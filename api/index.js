const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const instagramService = require('../src/services/instagram');

const app = express();

// Security and middleware
app.use(cors({
    origin: '*' // Can also be 'https://artsfestapp.web.app'
}));
app.use(express.json());

// Basic rate limiting: max 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});

// Instagram API Endpoint
app.get('/api/instagram/posts', apiLimiter, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 18;
        const after = req.query.after || null;
        const result = await instagramService.getPosts(limit, after);
        
        // Add cache-control headers (60 seconds to match in-memory cache)
        res.set('Cache-Control', 'public, max-age=60');
        
        res.json(result);
    } catch (error) {
        console.error('API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch Instagram posts.' });
    }
});

// Token refresh endpoint (protected) - Supports POST for manual, GET for Vercel Cron
app.all('/api/instagram/refresh', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const adminSecret = process.env.ADMIN_SECRET;
        const cronSecret = process.env.CRON_SECRET;

        // Basic protection check (allow either ADMIN_SECRET or Vercel's CRON_SECRET)
        const isAuthorizedAdmin = adminSecret && authHeader === `Bearer ${adminSecret}`;
        const isAuthorizedCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

        if (!isAuthorizedAdmin && !isAuthorizedCron) {
            return res.status(403).json({ error: 'Unauthorized.' });
        }

        await instagramService.refreshToken();
        res.json({ message: 'Token successfully refreshed.' });
    } catch (error) {
        console.error('Refresh API Error:', error.message);
        res.status(500).json({ error: 'Failed to refresh token.' });
    }
});
// Root endpoint (health check)
app.get('/', (req, res) => {
    res.json({ message: 'Instagram Feed API Middleware is running.' });
});

module.exports = app;

// Start server if not running on Vercel
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
