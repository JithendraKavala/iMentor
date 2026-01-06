const mongoose = require('mongoose');

const codeFileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filename: {
        type: String,
        required: true,
        trim: true,
        unique: false // Filenames are unique per user, handled by index/logic
    },
    language: { // Human readable name e.g. 'python', 'javascript'
        type: String,
        required: true
    },
    languageId: { // Judge0 ID e.g. 71
        type: Number,
        required: true
    },
    content: {
        type: String,
        default: ''
    },
    lastExecutedAt: {
        type: Date
    }
}, { timestamps: true });

// Ensure unique filename per user
codeFileSchema.index({ userId: 1, filename: 1 }, { unique: true });

module.exports = mongoose.model('CodeFile', codeFileSchema);
