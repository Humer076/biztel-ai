const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes (MUST come before static file handler)
app.use('/api/upload', require('./routes/upload'));
app.use('/api/extract', require('./routes/extract'));
app.use('/api/records', require('./routes/records'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/history', require('./routes/history'));

// ✅ Serve Frontend Static Files with Correct MIME Types
const distPath = path.resolve(__dirname, '../frontend/dist');
console.log(`📁 Serving static files from: ${distPath}`);
console.log(`✅ Directory exists: ${fs.existsSync(distPath)}`);

if (fs.existsSync(distPath)) {
    // Serve static assets with correct MIME types
    app.use(express.static(distPath, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
            if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
            if (filePath.endsWith('.json')) {
                res.setHeader('Content-Type', 'application/json');
            }
            if (filePath.endsWith('.svg')) {
                res.setHeader('Content-Type', 'image/svg+xml');
            }
        }
    }));
    
    // For any other route (not starting with /api), send index.html
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.error(`❌ Frontend build not found at ${distPath}`);
    app.get('/', (req, res) => {
        res.send('Server is running, but frontend is not built yet. Run `npm run build` in frontend folder.');
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
