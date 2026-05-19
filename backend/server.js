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

// ✅ API Routes (Must come BEFORE the static file handler)
app.use('/api/upload', require('./routes/upload'));
app.use('/api/extract', require('./routes/extract'));
app.use('/api/records', require('./routes/records'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/history', require('./routes/history'));

// ✅ Serve Frontend Static Files (CRITICAL FIX)
const distPath = path.resolve(__dirname, '../frontend/dist');
console.log(`Serving static files from: ${distPath}`);
console.log(`Directory exists: ${fs.existsSync(distPath)}`);

if (fs.existsSync(distPath)) {
    // Serve static assets (CSS, JS, images) from the dist folder
    app.use(express.static(distPath));
    
    // For any other route (not starting with /api), send the index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
} else {
    console.error(`ERROR: Frontend build not found at ${distPath}`);
    app.get('/', (req, res) => {
        res.send('Server is running, but frontend is not built yet.');
    });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
