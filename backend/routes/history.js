const express = require('express');
const router = express.Router();
const db = require('../db');
const path = require('path');
const fs = require('fs');

router.get('/uploads', (req, res) => {
  db.all('SELECT * FROM uploads ORDER BY uploaded_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/upload/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  db.get('SELECT * FROM uploads WHERE id = ?', [uploadId], (err, upload) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!upload) return res.status(404).json({ error: 'Upload not found' });
    
    // Check if file exists
    if (fs.existsSync(upload.filepath)) {
      upload.fileExists = true;
    } else {
      upload.fileExists = false;
    }
    res.json(upload);
  });
});

module.exports = router;