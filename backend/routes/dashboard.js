const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', (req, res) => {
  // Total uploads
  db.get('SELECT COUNT(*) as totalUploads FROM uploads', (err, uploadRow) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Total records and validation failures
    db.get(`SELECT 
      COUNT(*) as totalRecords, 
      SUM(CASE WHEN validation_errors != '{}' AND validation_errors IS NOT NULL THEN 1 ELSE 0 END) as validationFailures 
      FROM records`, (err, recordRow) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Shift-wise summary
      db.all(`SELECT 
        COALESCE(shift, 'Unknown') as shift, 
        SUM(quantity_produced) as totalQuantity, 
        COUNT(*) as recordCount 
        FROM records 
        WHERE shift IS NOT NULL AND shift != '' AND quantity_produced > 0
        GROUP BY shift`, (err, shiftRows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Machine-wise summary
        db.all(`SELECT 
          COALESCE(machine_number, 'Unknown') as machine_number, 
          SUM(quantity_produced) as totalQuantity, 
          COUNT(*) as recordCount 
          FROM records 
          WHERE machine_number IS NOT NULL AND machine_number != '' AND quantity_produced > 0
          GROUP BY machine_number
          ORDER BY totalQuantity DESC
          LIMIT 5`, (err, machineRows) => {
          if (err) return res.status(500).json({ error: err.message });
          
          // Recent activity
          db.all(`SELECT 
            date, 
            COUNT(*) as recordsCount 
            FROM records 
            WHERE date IS NOT NULL 
            GROUP BY date 
            ORDER BY date DESC 
            LIMIT 7`, (err, recentRows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            // NEW: Average confidence score across all records
            db.all(`SELECT 
              confidence_scores,
              validation_errors
              FROM records 
              WHERE confidence_scores IS NOT NULL AND confidence_scores != '{}'`, (err, confidenceRows) => {
              if (err) return res.status(500).json({ error: err.message });
              
              let totalConfidence = 0;
              let confidenceCount = 0;
              let highConfidenceCount = 0;
              let mediumConfidenceCount = 0;
              let lowConfidenceCount = 0;
              let totalWarnings = 0;
              let totalErrors = 0;
              
              confidenceRows.forEach(row => {
                try {
                  const scores = JSON.parse(row.confidence_scores || '{}');
                  const validation = JSON.parse(row.validation_errors || '{}');
                  
                  // Count warnings and errors
                  if (validation.warnings) {
                    totalWarnings += Object.keys(validation.warnings).length;
                  }
                  if (validation.errors) {
                    totalErrors += Object.keys(validation.errors).length;
                  }
                  
                  // Calculate average confidence
                  const scoreValues = Object.values(scores);
                  scoreValues.forEach(score => {
                    if (typeof score === 'number') {
                      totalConfidence += score;
                      confidenceCount++;
                      
                      if (score >= 0.7) highConfidenceCount++;
                      else if (score >= 0.4) mediumConfidenceCount++;
                      else lowConfidenceCount++;
                    }
                  });
                } catch(e) {}
              });
              
              const avgConfidence = confidenceCount > 0 ? (totalConfidence / confidenceCount) : 0;
              
              res.json({
                totalUploads: uploadRow.totalUploads || 0,
                totalRecords: recordRow.totalRecords || 0,
                validationFailures: recordRow.validationFailures || 0,
                shiftSummary: shiftRows || [],
                machineSummary: machineRows || [],
                recentActivity: recentRows || [],
                // NEW Confidence Stats
                confidenceStats: {
                  averageConfidence: Math.round(avgConfidence * 100),
                  highConfidenceCount: highConfidenceCount,
                  mediumConfidenceCount: mediumConfidenceCount,
                  lowConfidenceCount: lowConfidenceCount,
                  totalFieldsAnalyzed: confidenceCount
                },
                // NEW Validation Stats
                validationStats: {
                  totalWarnings: totalWarnings,
                  totalErrors: totalErrors,
                  affectedRecords: confidenceRows.filter(row => {
                    try {
                      const validation = JSON.parse(row.validation_errors || '{}');
                      return Object.keys(validation.errors || {}).length > 0 || Object.keys(validation.warnings || {}).length > 0;
                    } catch(e) { return false; }
                  }).length
                }
              });
            });
          });
        });
      });
    });
  });
});

module.exports = router;
