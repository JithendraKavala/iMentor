const express = require('express');
const axios = require('axios');
const router = express.Router();
const CodeFile = require('../models/CodeFile');
const ExecutionHistory = require('../models/ExecutionHistory');
const { auditLog } = require('../utils/logger');
const User = require('../models/User');

// --- Helper to get Python Service URL ---
const getPythonServiceUrl = () => {
    const url = process.env.PYTHON_RAG_SERVICE_URL;
    if (!url) throw new Error("PYTHON_RAG_SERVICE_URL is not configured.");
    return url;
};

// @route   GET /api/code/languages
// @desc    Get all supported languages from Judge0 (proxied via Python)
// @access  Private
router.get('/languages', async (req, res) => {
    try {
        const pythonUrl = getPythonServiceUrl();
        const response = await axios.get(`${pythonUrl}/languages`, { timeout: 5000 });
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching languages:", error.message);
        res.status(500).json({ message: "Failed to fetch languages." });
    }
});

// @route   POST /api/code/execute
// @desc    Execute code, optionally save history
// @access  Private
router.post('/execute', async (req, res) => {
    const { code, language, languageId, fileId, saveHistory = true } = req.body;

    if (!code) return res.status(400).json({ message: "Code is required" });

    const userId = req.user._id;
    let executionLog = null;

    try {
        // 1. Create a "Pending" Execution Log if saving history
        if (saveHistory) {
            executionLog = new ExecutionHistory({
                userId,
                fileId: fileId || null,
                languageId: languageId || 0, // 0 if unknown/mapped later
                codeSnapshot: code,
                status: 'Pending',
                executionTime: '0.0s',
                memory: 0
            });
            await executionLog.save();
        }

        // 2. Call Python Service
        const pythonUrl = getPythonServiceUrl();
        const testCaseList = Array.isArray(req.body.testCases) ? req.body.testCases : [];

        const pythonResponse = await axios.post(`${pythonUrl}/execute_code`, {
            code,
            language,
            languageId,
            testCases: testCaseList
        }, { timeout: 35000 });

        const results = pythonResponse.data.results || [];

        // 3. Update Execution Log
        if (executionLog) {
            // Aggregate status
            const allPassed = results.length > 0 && results.every(r => r.status === 'pass');
            const hasError = results.some(r => r.status === 'error' || r.status === 'time_limit_exceeded');

            executionLog.status = allPassed ? 'Success' : (hasError ? 'Error' : 'Failed');

            // For history, we store a summary or the first output if there are no test cases
            // If strictly test cases, we might want to store a JSON string of results
            executionLog.output = JSON.stringify(results);
            executionLog.error = results.find(r => r.error)?.error || null;

            // Sum up time or take max? Usually max or sum. Let's take max for simplicity or first.
            const maxTime = results.reduce((max, r) => Math.max(max, parseFloat(r.execution_time || 0)), 0);
            executionLog.executionTime = `${maxTime}s`;

            const maxMem = results.reduce((max, r) => Math.max(max, parseFloat(r.memory || 0)), 0);
            executionLog.memory = maxMem;

            await executionLog.save();
        }

        res.status(200).json(pythonResponse.data);

    } catch (error) {
        const errorMsg = error.response?.data?.error || error.message;

        if (executionLog) {
            executionLog.status = 'System Error';
            executionLog.error = errorMsg;
            await executionLog.save();
        }

        console.error(`Execution Error: ${errorMsg}`);
        res.status(error.response?.status || 500).json({ message: errorMsg });
    }
});

// @route   POST /api/code/files
// @desc    Create or Update a code file
// @access  Private
router.post('/files', async (req, res) => {
    const { filename, language, languageId, content, _id } = req.body;
    const userId = req.user._id;

    if (!filename || !languageId) {
        return res.status(400).json({ message: "Filename and Language ID are required." });
    }

    try {
        let file;
        if (_id) {
            // Update existing
            file = await CodeFile.findOne({ _id, userId });
            if (!file) return res.status(404).json({ message: "File not found." });

            file.content = content || "";
            file.language = language;
            file.languageId = languageId;
            file.filename = filename;
        } else {
            // Create New
            // Check uniqueness
            const existing = await CodeFile.findOne({ userId, filename });
            if (existing) return res.status(409).json({ message: "File with this name already exists." });

            file = new CodeFile({
                userId,
                filename,
                language,
                languageId,
                content
            });
        }

        await file.save();
        res.status(200).json(file);

    } catch (error) {
        console.error("Save File Error:", error);
        res.status(500).json({ message: "Failed to save file." });
    }
});

// @route   GET /api/code/files
// @desc    List user's code files
// @access  Private
router.get('/files', async (req, res) => {
    try {
        const files = await CodeFile.find({ userId: req.user._id }).sort({ updatedAt: -1 });
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: "Failed to list files." });
    }
});

// @route   GET /api/code/files/:id
// @desc    Get single file
// @access  Private
router.get('/files/:id', async (req, res) => {
    try {
        const file = await CodeFile.findOne({ _id: req.params.id, userId: req.user._id });
        if (!file) return res.status(404).json({ message: "File not found." });
        res.status(200).json(file);
    } catch (error) {
        res.status(500).json({ message: "Failed to get file." });
    }
});

// @route   GET /api/code/history
// @desc    Get execution history (Global or for a specific file)
// @access  Private
router.get('/history', async (req, res) => {
    const { fileId, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (fileId) query.fileId = fileId;

    try {
        const logs = await ExecutionHistory.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('fileId', 'filename'); // Populate filename if linked

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch history." });
    }
});

module.exports = router;
