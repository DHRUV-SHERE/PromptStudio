const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getContactSubmissions,
    getContactById,
    updateContactStatus,
    archiveContact,
    getContactStats
} = require('../controller/contactController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authrizeMiddleware');

// Public routes
router.post('/', submitContactForm);

// Protected admin routes
router.get('/', protect, authorize('admin'), getContactSubmissions);
router.get('/stats/overview', protect, authorize('admin'), getContactStats);
router.get('/:id', protect, authorize('admin'), getContactById);
router.put('/:id', protect, authorize('admin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin'), archiveContact);

module.exports = router;