const express = require('express');
const router = express.Router();
const apiAutomationController = require('../controllers/apiAutomationController');
const requireAuth = require('../middlewares/authMiddleware');

router.get('/suites', requireAuth, apiAutomationController.getSuites);
router.get('/suites/:id', requireAuth, apiAutomationController.getSuite);
router.post('/suites', requireAuth, apiAutomationController.createSuite);
router.delete('/suites/:id', requireAuth, apiAutomationController.deleteSuite);

router.post('/suites/:id/record', requireAuth, apiAutomationController.startRecording);
router.get('/suites/:id/endpoints', requireAuth, apiAutomationController.getSuiteEndpoints);
router.delete('/endpoints/:id', requireAuth, apiAutomationController.deleteEndpoint);

router.post('/suites/:id/run', requireAuth, apiAutomationController.runTest);
router.get('/suites/:id/runs', requireAuth, apiAutomationController.getSuiteRuns);
router.get('/runs', requireAuth, apiAutomationController.getAllRuns);

module.exports = router;
