// server/routes/learningPath.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const LearningPath = require('../models/LearningPath');
const User = require('../models/User'); // <<< THIS IS THE FIX
const { createLearningPath } = require('../services/learning/curriculumOrchestrator');
const { auditLog } = require('../utils/logger');

// @route   GET /api/learning/paths/skill-tree/:documentName
// @desc    Get Syllabus Graph overlaid with student status.
// @access  Private
router.get('/skill-tree/:documentName', async (req, res) => {
    const { documentName } = req.params;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).select('profile.studentState');
        const studentState = user.profile.studentState || { masteredConcepts: [], strugglingConcepts: [] };

        const pythonServiceUrl = process.env.PYTHON_RAG_SERVICE_URL;
        if (!pythonServiceUrl) {
             return res.status(500).json({ message: "Python service not configured." });
        }

        // Fetch KG from Python Service (Neo4j)
        const getKgUrl = `${pythonServiceUrl}/kg/${userId}/${encodeURIComponent(documentName)}`;
        let kgData = { nodes: [], edges: [] };

        try {
            const pythonResponse = await axios.get(getKgUrl);
            kgData = pythonResponse.data || { nodes: [], edges: [] };
        } catch (kgError) {
            console.warn(`[SkillTree] Failed to fetch KG for ${documentName}. Returning empty/default.`);
        }

        // Overlay Status
        const nodesWithStatus = kgData.nodes.map(node => {
            let status = 'unseen'; // Default: Fog of War / Gray
            // Simple label matching. Could be improved with vector similarity.
            if (studentState.masteredConcepts.some(c => c.toLowerCase() === node.label.toLowerCase())) {
                status = 'mastered'; // Green
            } else if (studentState.strugglingConcepts.some(c => c.toLowerCase() === node.label.toLowerCase())) {
                status = 'struggling'; // Red
            }
            return { ...node, status };
        });

        res.json({ nodes: nodesWithStatus, edges: kgData.edges });

    } catch (error) {
        console.error("[SkillTree] Error:", error);
        res.status(500).json({ message: "Failed to fetch skill tree." });
    }
});

// @route   POST /api/learning/paths/generate
// @desc    Create a new learning path for the authenticated user based on a goal.
// @access  Private
router.post('/generate', async (req, res) => {
    const { goal, context } = req.body;
    const userId = req.user._id;

    if (!goal) {
        return res.status(400).json({ message: 'A learning goal is required.' });
    }

    try {
        // This function is now called only ONCE.
        const newPathOrQuestions = await createLearningPath(userId, goal, context);
        
        auditLog(req, 'STUDY_PLAN_GENERATION_SUCCESS', {
            goal: goal,
            isClarificationNeeded: newPathOrQuestions.isQuestionnaire || false
        });
        
        // Return the result directly.
        res.status(201).json(newPathOrQuestions);

    } catch (error) {
        auditLog(req, 'STUDY_PLAN_GENERATION_FAILURE', {
            goal: goal,
            error: error.message
        });
        console.error(`[API Error] Failed to create learning path for user ${userId}:`, error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// @route   GET /api/learning/paths
// @desc    Get all learning paths for the authenticated user.
// @access  Private
router.get('/', async (req, res) => {
    const userId = req.user._id;

    try {
        const paths = await LearningPath.find({ userId: userId }).sort({ createdAt: -1 });
        res.status(200).json(paths);
    } catch (error) {
        console.error(`[API Error] Failed to retrieve learning paths for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error while fetching learning paths.' });
    }
});


router.put('/:pathId/modules/:moduleId', async (req, res) => {
    const { pathId, moduleId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    if (!status || !['completed', 'in_progress', 'not_started'].includes(status)) {
        return res.status(400).json({ message: 'A valid status is required (completed, in_progress, not_started).' });
    }

    try {
        const learningPath = await LearningPath.findOne({ _id: pathId, userId: userId });

        if (!learningPath) {
            return res.status(404).json({ message: 'Learning path not found or you do not have permission to modify it.' });
        }

        const moduleIndex = learningPath.modules.findIndex(m => m.moduleId === moduleId);
        if (moduleIndex === -1) {
            return res.status(404).json({ message: 'Module not found in this learning path.' });
        }

        learningPath.modules[moduleIndex].status = status;

        if (status === 'completed' && moduleIndex + 1 < learningPath.modules.length) {
            if (learningPath.modules[moduleIndex + 1].status === 'locked') {
                learningPath.modules[moduleIndex + 1].status = 'not_started';
            }
        }

        learningPath.markModified('modules');
        await learningPath.save();
        
        auditLog(req, 'STUDY_PLAN_MODULE_UPDATED', {
            pathId: pathId,
            moduleId: moduleId,
            newStatus: status
        });
        res.status(200).json(learningPath);

    } catch (error) {
        console.error(`[API Error] Failed to update module status for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error while updating module status.' });
    }
});


// @route   DELETE /api/learning/paths/:pathId
// @desc    Delete a learning path for the authenticated user.
// @access  Private
router.delete('/:pathId', async (req, res) => {
    const { pathId } = req.params;
    const userId = req.user._id;

    try {
        const result = await LearningPath.deleteOne({ _id: pathId, userId: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Learning path not found or you do not have permission to delete it.' });
        }

        await User.updateOne({ _id: userId }, { $pull: { learningPaths: pathId } });

        auditLog(req, 'STUDY_PLAN_DELETED', {
            pathId: pathId
        });
        res.status(200).json({ message: 'Learning path deleted successfully.' });
    } catch (error) {
        console.error(`[API Error] Failed to delete learning path ${pathId} for user ${userId}:`, error);
        res.status(500).json({ message: 'Server error while deleting learning path.' });
    }
});


module.exports = router;