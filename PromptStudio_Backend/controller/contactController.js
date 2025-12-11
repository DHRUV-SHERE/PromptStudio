const Contact = require('../models/Contact');
const nodemailer = require('nodemailer'); // For sending emails

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields'
            });
        }

        // Create contact submission
        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        // Optional: Send confirmation email to user
        try {
            await sendConfirmationEmail(email, name);
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
            // Don't fail the request if email fails
        }

        // Optional: Send notification to admin
        try {
            await sendAdminNotification(contact);
        } catch (notificationError) {
            console.error('Failed to send admin notification:', notificationError);
        }

        res.status(201).json({
            success: true,
            message: 'Thank you for contacting us! We\'ll get back to you soon.',
            data: {
                id: contact._id,
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                createdAt: contact.createdAt
            }
        });

    } catch (error) {
        console.error('Contact submission error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.'
        });
    }
};

// @desc    Get all contact submissions (Admin only)
// @route   GET /api/contact
// @access  Private/Admin
const getContactSubmissions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        
        const query = { isArchived: false };
        
        // Filter by status
        if (status && ['pending', 'read', 'replied', 'closed'].includes(status)) {
            query.status = status;
        }
        
        // Search by name, email, or subject
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }
        
        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v');
        
        const total = await Contact.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: contacts.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: contacts
        });
        
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update contact status (Admin only)
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
    try {
        const { status, replyMessage } = req.body;
        const { id } = req.params;
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }
        
        // Update status
        if (status && ['pending', 'read', 'replied', 'closed'].includes(status)) {
            contact.status = status;
            
            // If replying, set reply info
            if (status === 'replied' && replyMessage) {
                contact.repliedAt = new Date();
                contact.repliedBy = req.userId;
                contact.replyMessage = replyMessage;
                
                // Send reply email to user
                await sendReplyEmail(contact.email, contact.name, replyMessage);
            }
        }
        
        await contact.save();
        
        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: contact
        });
        
    } catch (error) {
        console.error('Update contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Archive contact (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const archiveContact = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }
        
        contact.isArchived = true;
        await contact.save();
        
        res.status(200).json({
            success: true,
            message: 'Contact archived successfully'
        });
        
    } catch (error) {
        console.error('Archive contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// Email functions (optional - requires email setup)

const sendConfirmationEmail = async (toEmail, name) => {
    // Configure nodemailer with your email service
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: toEmail,
        subject: 'Thank you for contacting PromptStudio',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Hello ${name},</h2>
                <p>Thank you for reaching out to PromptStudio! We have received your message and will get back to you as soon as possible.</p>
                <p>Our team typically responds within 24 hours.</p>
                <br>
                <p>Best regards,</p>
                <p><strong>The PromptStudio Team</strong></p>
                <br>
                <hr>
                <p style="color: #666; font-size: 12px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
};

const sendAdminNotification = async (contact) => {
    // Similar to above but sent to admin email
    // You can add this if you want email notifications
};

const sendReplyEmail = async (toEmail, name, replyMessage) => {
    // Send the actual reply to user
};

module.exports = {
    submitContactForm,
    getContactSubmissions,
    updateContactStatus,
    archiveContact
};