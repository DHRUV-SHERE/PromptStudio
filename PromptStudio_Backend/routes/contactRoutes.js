const express = require('express');
const router = express.Router();
const {
    submitContactForm,
    getContactSubmissions,
    updateContactStatus,
    archiveContact
} = require('../controller/contactController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/authrizeMiddleware'); // Optional: for admin only

// Public route
router.post('/', submitContactForm);

// Protected routes (admin only)
router.get('/', protect, getContactSubmissions);
router.put('/:id', protect, updateContactStatus);
router.delete('/:id', protect, archiveContact);

module.exports = router;