const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const EndpointModel = require('../models/endpointModel');
const ApiTestRunModel = require('../models/apiTestRunModel');
const { generateK6Script } = require('../utils/k6ScriptGenerator');
const AppError = require('../utils/appError');
const { execFile } = require('child_process');

async function runK6Test(suiteId, testType, vus, duration) {
    // Normalisasi tipe tes untuk menghindari bug spasi (seperti ' stress')
    const normalizedTestType = testType.trim();

    const endpoints = await EndpointModel.findBySuiteId(suiteId);
    if (endpoints.length === 0) {
        throw new AppError('Tidak ada endpoint yang terekam untuk skenario ini', 404);
    }

    // Generate K6 script menggunakan modular helper
    const k6ScriptContent = generateK6Script(endpoints, normalizedTestType, vus, duration);

    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const scriptPath = path.join(tempDir, `suite_${suiteId}_test.js`);
    const summaryPath = path.join(tempDir, `suite_${suiteId}_summary.json`);

    await fs.promises.writeFile(scriptPath, k6ScriptContent);

    return new Promise((resolve, reject) => {

        execFile('k6', ['run', `--summary-export=${summaryPath}`, scriptPath], async (error, stdout, stderr) => {
            const logOutput = stdout + '\n' + stderr;

            let avgLatency = 0;
            let successRate = 0;
            let totalRequests = 0;
            let maxRps = 0;
            let status = 'failed';

            try {
                if (fs.existsSync(summaryPath)) {
                    const summaryData = JSON.parse(await fs.promises.readFile(summaryPath, 'utf8'));
                    const metrics = summaryData.metrics;

                    avgLatency = Math.round(metrics.http_req_duration?.values?.avg || 0);
                    totalRequests = metrics.http_reqs?.values?.count || 0;

                    if (totalRequests > 0) {
                        const failedRequests = metrics.http_req_failed?.values?.passes || 0;
                        successRate = parseFloat((((totalRequests - failedRequests) / totalRequests) * 100).toFixed(2));
                    }

                    maxRps = Math.round(metrics.http_reqs?.values?.rate || 0);
                    status = (successRate >= 95) ? 'success' : 'failed';
                }
            } catch (err) {
                console.error('Gagal mengekstrak ringkasan metrik k6:', err);
            } finally {
                // Selalu bersihkan file temporer jika ada
                await fs.promises.unlink(summaryPath).catch(() => {});
                await fs.promises.unlink(scriptPath).catch(() => {});
            }

            try {
                // Menyimpan laporan ke database melalui Model
                await ApiTestRunModel.create({
                    suiteId,
                    testType: normalizedTestType,
                    status,
                    durationMs: duration * 1000,
                    totalRequests,
                    successRate,
                    avgLatency,
                    maxRps,
                    logOutput
                });

                resolve({ status, totalRequests, successRate, avgLatency, maxRps, logOutput });
            } catch (dbError) {
                reject(new AppError('Gagal menyimpan hasil uji ke database: ' + dbError.message, 500));
            }
        });
    });
}

module.exports = { runK6Test };