const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Create transporter with Render.com-friendly settings
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        // Render.com specific settings
        connectionTimeout: 10000, // 10 seconds
        socketTimeout: 15000, // 15 seconds
        greetingTimeout: 5000, // 5 seconds
        tls: {
            rejectUnauthorized: false // Required for Render.com
        }
    });
};

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

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Message length validation
        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Message should be at least 10 characters long'
            });
        }

        // Create contact submission
        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || 'Unknown'
        });

        console.log(`📧 Contact form submitted by ${name} (${email})`);

        // Send confirmation email to user (non-blocking)
        sendConfirmationEmail(email, name, subject).catch(error => {
            console.error('Confirmation email failed:', error.message);
        });

        // Send notification to admin (non-blocking)
        sendAdminNotification(contact).catch(error => {
            console.error('Admin notification failed:', error.message);
        });

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
        
        // Handle duplicate email submissions (optional)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a message recently. Please wait before sending another.'
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
        const { page = 1, limit = 20, status, search, startDate, endDate } = req.query;
        
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
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Execute queries in parallel for better performance
        const [contacts, total] = await Promise.all([
            Contact.find(query)
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip(skip)
                .select('-__v')
                .lean(),
            Contact.countDocuments(query)
        ]);
        
        res.status(200).json({
            success: true,
            count: contacts.length,
            total,
            totalPages: Math.ceil(total / limitNum),
            currentPage: pageNum,
            data: contacts
        });
        
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching contacts'
        });
    }
};

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const contact = await Contact.findById(id).select('-__v');
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }
        
        // Update last read time
        contact.lastReadAt = new Date();
        await contact.save();
        
        res.status(200).json({
            success: true,
            data: contact
        });
        
    } catch (error) {
        console.error('Get contact by ID error:', error);
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
        const { status, replyMessage, notes } = req.body;
        const { id } = req.params;
        const userId = req.user?.id || 'system';
        
        const contact = await Contact.findById(id);
        
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact submission not found'
            });
        }
        
        // Update status if provided
        if (status && ['pending', 'read', 'replied', 'closed'].includes(status)) {
            contact.status = status;
            contact.updatedBy = userId;
            
            // If replying, set reply info
            if (status === 'replied' && replyMessage) {
                contact.repliedAt = new Date();
                contact.repliedBy = userId;
                contact.replyMessage = replyMessage;
                
                // Send reply email to user (non-blocking)
                sendReplyEmail(contact.email, contact.name, replyMessage, contact.subject)
                    .catch(error => console.error('Reply email failed:', error.message));
            }
        }
        
        // Add notes if provided
        if (notes) {
            contact.adminNotes = notes;
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
            message: 'Server error while updating contact'
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
        contact.archivedAt = new Date();
        contact.archivedBy = req.user?.id || 'system';
        await contact.save();
        
        res.status(200).json({
            success: true,
            message: 'Contact archived successfully'
        });
        
    } catch (error) {
        console.error('Archive contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while archiving contact'
        });
    }
};

// @desc    Get contact statistics (Admin only)
// @route   GET /api/contact/stats/overview
// @access  Private/Admin
const getContactStats = async (req, res) => {
    try {
        const stats = await Contact.aggregate([
            {
                $facet: {
                    totalSubmissions: [
                        { $count: "count" }
                    ],
                    submissionsByStatus: [
                        {
                            $group: {
                                _id: "$status",
                                count: { $sum: 1 }
                            }
                        }
                    ],
                    submissionsByDay: [
                        {
                            $group: {
                                _id: {
                                    $dateToString: {
                                        format: "%Y-%m-%d",
                                        date: "$createdAt"
                                    }
                                },
                                count: { $sum: 1 }
                            }
                        },
                        { $sort: { _id: -1 } },
                        { $limit: 7 }
                    ],
                    recentActivity: [
                        { $sort: { createdAt: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                name: 1,
                                email: 1,
                                subject: 1,
                                status: 1,
                                createdAt: 1
                            }
                        }
                    ]
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: stats[0]
        });
        
    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
};

// Email Functions

const sendConfirmationEmail = async (toEmail, name, subject) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: `"PromptStudio" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Thank you for contacting PromptStudio',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Contact Confirmation</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                    }
                    .container {
                        background: white;
                        border-radius: 10px;
                        padding: 30px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        color: #4F46E5;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .content {
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        font-size: 12px;
                        color: #666;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">✨ PromptStudio</div>
                        <h2>Thank you for contacting us!</h2>
                    </div>
                    
                    <div class="content">
                        <p>Hello <strong>${name}</strong>,</p>
                        
                        <p>We have received your message regarding:</p>
                        <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                            <strong>Subject:</strong> ${subject}
                        </blockquote>
                        
                        <p>Our team will review your message and get back to you as soon as possible. We typically respond within 24 hours during business days.</p>
                        
                        <p>If you have any urgent inquiries, please don't hesitate to contact us again.</p>
                    </div>
                    
                    <div class="footer">
                        <p>Best regards,<br>
                        <strong>The PromptStudio Team</strong></p>
                        <p style="margin-top: 10px;">
                            <small>
                                This is an automated message. Please do not reply to this email.<br>
                                © ${new Date().getFullYear()} PromptStudio. All rights reserved.
                            </small>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    // Add timeout for email sending
    const sendPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timeout')), 20000);
    });

    try {
        const info = await Promise.race([sendPromise, timeoutPromise]);
        console.log('✅ Confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error.message);
        throw error;
    }
};

const sendAdminNotification = async (contact) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: `"PromptStudio Notifications" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: process.env.CONTACT_EMAIL || process.env.EMAIL_USER,
        subject: `📬 New Contact Form Submission: ${contact.subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">New Contact Form Submission</h2>
                
                <h3>Submission Details:</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Name:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${contact.name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${contact.email}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Subject:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${contact.subject}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Submitted:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(contact.createdAt).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9; vertical-align: top;"><strong>Message:</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd; white-space: pre-wrap;">${contact.message}</td>
                    </tr>
                </table>
                
                <p>
                    <a href="${process.env.APP_URL || 'https://promptstudio-av40.onrender.com'}/admin/contacts/${contact._id}" 
                       style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View in Dashboard
                    </a>
                </p>
                
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This is an automated notification from PromptStudio.
                </p>
            </div>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Admin notification sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Failed to send admin notification:', error.message);
        throw error;
    }
};

const sendReplyEmail = async (toEmail, name, replyMessage, originalSubject) => {
    const transporter = createTransporter();
    
    const mailOptions = {
        from: `"PromptStudio Support" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Re: ${originalSubject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">Response from PromptStudio</h2>
                
                <p>Hello <strong>${name}</strong>,</p>
                
                <p>Thank you for reaching out to us. Here is our response to your inquiry:</p>
                
                <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid #4F46E5; margin: 20px 0;">
                    ${replyMessage.replace(/\n/g, '<br>')}
                </div>
                
                <p>If you have any further questions, please don't hesitate to reply to this email.</p>
                
                <p>Best regards,<br>
                <strong>The PromptStudio Team</strong></p>
                
                <hr style="margin: 30px 0;">
                <p style="color: #666; font-size: 12px;">
                    This email is in response to your inquiry regarding: "${originalSubject}"
                </p>
            </div>
        `
    };
    
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Reply email sent to ${name} (${toEmail})`);
        return info;
    } catch (error) {
        console.error('❌ Failed to send reply email:', error.message);
        throw error;
    }
};

module.exports = {
    submitContactForm,
    getContactSubmissions,
    getContactById,
    updateContactStatus,
    archiveContact,
    getContactStats
};