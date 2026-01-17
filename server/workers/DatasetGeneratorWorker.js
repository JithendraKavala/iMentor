const { workerData, parentPort } = require('worker_threads');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Dataset = require('../models/Dataset');
const connectDB = require('../config/db');
const geminiService = require('../services/geminiService');

async function runDatasetGeneration() {
    const { documentText, category, version, originalName, userId, apiKey } = workerData;
    const logPrefix = `[DatasetGenerator ${process.pid}]`;
    let dbConnected = false;

    try {
        console.log(`${logPrefix} Starting dataset generation for '${originalName}'.`);

        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI not set.");
        }

        await connectDB(process.env.MONGO_URI);
        dbConnected = true;

        const prompt = `
        You are an expert educational content creator.
        Generate 50 high-quality Question-Answer pairs based on the provided text.
        Target Audience: ${category} student.

        **Output Format:**
        Strictly a JSON array of objects. Each object must have:
        - "instruction": The question.
        - "output": The detailed answer.

        **Source Text:**
        ${documentText.substring(0, 45000)}...

        **JSON Output:**
        `;

        const responseText = await geminiService.generateContentWithHistory(
            [], prompt, "You are a dataset generator.", { apiKey, maxOutputTokens: 8192 }
        );

        let qaPairs = [];
        try {
            const jsonMatch = responseText.match(/\[.*\]/s);
            if (jsonMatch) {
                qaPairs = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON array found in response.");
            }
        } catch (parseError) {
            console.warn(`${logPrefix} Failed to parse JSON, attempting raw text save. Error: ${parseError.message}`);
            // Fallback: wrap text in a single object if parsing fails, or log error
        }

        if (qaPairs.length > 0) {
            const datasetsDir = path.join(__dirname, '../datasets');
            if (!fs.existsSync(datasetsDir)) {
                fs.mkdirSync(datasetsDir, { recursive: true });
            }

            const filename = `dataset_${category}_${uuidv4()}.json`;
            const filepath = path.join(datasetsDir, filename);

            fs.writeFileSync(filepath, JSON.stringify(qaPairs, null, 2));
            console.log(`${logPrefix} Saved ${qaPairs.length} pairs to ${filepath}`);

            await Dataset.create({
                originalName: filename,
                s3Key: filepath, // Storing local path for simplicity in this implementation
                category: category || 'General',
                version: version || 'v1.0',
                fileType: 'application/json',
                size: fs.statSync(filepath).size,
                uploadedBy: userId || 'system'
            });

            console.log(`${logPrefix} Dataset record created.`);
            if (parentPort) parentPort.postMessage({ success: true, count: qaPairs.length, filepath });
        } else {
            console.error(`${logPrefix} No QA pairs generated.`);
            if (parentPort) parentPort.postMessage({ success: false, error: "No pairs generated." });
        }

    } catch (error) {
        console.error(`${logPrefix} Critical Error:`, error);
        if (parentPort) parentPort.postMessage({ success: false, error: error.message });
    } finally {
        if (dbConnected) {
            await mongoose.disconnect();
        }
    }
}

runDatasetGeneration();
