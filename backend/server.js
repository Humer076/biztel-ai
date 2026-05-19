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

// API Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/extract', require('./routes/extract'));
app.use('/api/records', require('./routes/records'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/history', require('./routes/history'));

// ============================================
// CRITICAL: Serve Frontend Files
// ============================================

// Try multiple possible paths for frontend dist folder
const possiblePaths = [
    path.join(__dirname, '../frontend/dist'),
    path.join(process.cwd(), 'frontend/dist'),
    path.join(process.cwd(), '../frontend/dist'),
    '/opt/render/project/src/frontend/dist'
];

let distPath = null;
for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
        distPath = testPath;
        console.log(`✅ Found frontend at: ${distPath}`);
        break;
    }
}

if (distPath) {
    // Serve static files with correct MIME types
    app.use(express.static(distPath, {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.css')) {
                res.setHeader('Content-Type', 'text/css');
            }
            if (filePath.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
            }
        }
    }));
    
    // All non-API routes go to index.html
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('✅ Frontend serving configured');
} else {
    console.error('❌ Could not find frontend dist folder');
    app.get('/', (req, res) => {
        res.send(`
            <html>
                <head><title>BiztelAI API</title></head>
                <body>
                    <h1>BiztelAI Backend Running</h1>
                    <p>API is working. Visit <a href="/api/dashboard/stats">/api/dashboard/stats</a></p>
                </body>
            </html>
        `);
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
