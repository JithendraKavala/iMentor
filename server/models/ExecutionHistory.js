const mongoose = require('mongoose');

const executionHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CodeFile',
        required: false // Allow executing code snippets without saving a file
    },
    languageId: {
        type: Number,
        required: true
    },
    codeSnapshot: {
        type: String,
        required: true
    },
    status: {
        type: String, // 'Success', 'Error', 'Time Limit Exceeded', etc.
        required: true
    },
    output: {
        type: String
    },
    error: {
        type: String
    },
    executionTime: { // in seconds
        type: String
    },
    memory: { // in KB
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('ExecutionHistory', executionHistorySchema);
