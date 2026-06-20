const { startApiRecordingSession } = require('../services/recorderService');
const { runK6Test } = require('../services/k6RunnerService');
const SuiteModel = require('../models/suiteModel');
const EndpointModel = require('../models/endpointModel');
const ApiTestRunModel = require('../models/apiTestRunModel');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/response');

const apiAutomationController = {
    getSuites: asyncHandler(async (req, res) => {
        const suites = await SuiteModel.findAll();
        return sendSuccess(res, 'Suites retrieved successfully', suites);
    }),

    getSuite: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const suite = await SuiteModel.findById(id);
        if (!suite) {
            return sendError(res, 'Suite not found', 404);
        }
        return sendSuccess(res, 'Suite retrieved successfully', suite);
    }),

    createSuite: asyncHandler(async (req, res) => {
        const { name, description, targetUrl } = req.body;
        if (!name || !targetUrl) {
            return sendError(res, 'Name and Target URL are required', 400);
        }
        const suiteId = await SuiteModel.create(name, description, targetUrl);
        return sendSuccess(res, 'Suite created successfully', { id: suiteId }, 201);
    }),

    deleteSuite: asyncHandler(async (req, res) => {
        const { id } = req.params;
        await SuiteModel.delete(id);
        return sendSuccess(res, 'Suite deleted successfully');
    }),

    startRecording: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const suite = await SuiteModel.findById(id);
        if (!suite) {
            return sendError(res, 'Suite not found', 404);
        }
        const endpoints = await startApiRecordingSession(suite.id, suite.target_url);
        return sendSuccess(res, 'Recording completed and saved successfully', endpoints);
    }),

    getSuiteEndpoints: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const endpoints = await EndpointModel.findBySuiteId(id);
        return sendSuccess(res, 'Endpoints retrieved successfully', endpoints);
    }),

    deleteEndpoint: asyncHandler(async (req, res) => {
        const { id } = req.params;
        await EndpointModel.delete(id);
        return sendSuccess(res, 'Endpoint deleted successfully');
    }),

    runTest: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { testType, vus, duration } = req.body;
        
        let parsedVus = parseInt(vus) || 1;
        let parsedDuration = parseInt(duration) || 10;
        
        // Upper bound validation
        parsedVus = Math.min(Math.max(parsedVus, 1), 1000); // 1 to 1000 VUs
        parsedDuration = Math.min(Math.max(parsedDuration, 1), 3600); // 1 to 3600 seconds
        
        const type = testType || 'functional';

        const result = await runK6Test(id, type, parsedVus, parsedDuration);
        return sendSuccess(res, 'Simulation completed successfully', result);
    }),

    getSuiteRuns: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const runs = await ApiTestRunModel.findBySuiteId(id);
        return sendSuccess(res, 'Suite runs retrieved successfully', runs);
    }),

    getAllRuns: asyncHandler(async (req, res) => {
        const runs = await ApiTestRunModel.findAll();
        return sendSuccess(res, 'All runs retrieved successfully', runs);
    })
};

module.exports = apiAutomationController;
