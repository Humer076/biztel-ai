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

// ✅ API Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/extract', require('./routes/extract'));
app.use('/api/records', require('./routes/records'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/history', require('./routes/history'));

// ============================================
// ✅ CRITICAL FIX: Serve Frontend Files
// ============================================

// This finds the 'client/build' or 'frontend/dist' folder no matter what [citation:7][citation:8]
// 'process.cwd()' is the key - it always points to your project root on Render
const distPath = path.resolve(process.cwd(), 'frontend', 'dist');

console.log('🔍 Looking for frontend at:', distPath);
console.log('📁 Folder exists?', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
    // Serve static files (CSS, JS, images) with the correct MIME type [citation:5][citation:8]
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
    
    // For any non-API request, send the React app's index.html
    // This also enables React Router to work on refresh [citation:4]
    app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        res.sendFile(path.join(distPath, 'index.html'));
    });
    
    console.log('✅ Frontend configuration successful!');
} else {
    console.error(`❌ Frontend build NOT found at ${distPath}`);
    app.get('/', (req, res) => {
        res.send('Server is running, but frontend build is missing. Check Render build command.');
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
