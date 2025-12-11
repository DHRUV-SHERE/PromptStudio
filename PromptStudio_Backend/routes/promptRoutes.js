const express = require('express');
const router = express.Router();
const {
    generatePrompt,
    batchGeneratePrompts,
    enhancePrompt,
    getPromptHistory,
    getCategories,
    deletePrompt,
    getPrompt
} = require('../controller/promptController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/categories', getCategories);

// Protected routes
router.post('/generate', protect, generatePrompt);
router.post('/batch-generate', protect, batchGeneratePrompts);
router.post('/enhance', protect, enhancePrompt);
router.get('/history', protect, getPromptHistory);
router.get('/:id', protect, getPrompt);
router.delete('/:id', protect, deletePrompt);

module.exports = router;