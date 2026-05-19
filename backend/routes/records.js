const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const db = require('../db');
const { validateRecord, checkDuplicateWorkOrder } = require('../services/validation');

// Create/update record
router.post('/', async (req, res) => {
  try {
    const { 
      id, uploadId, date, shift, employeeNumber, operationCode, 
      machineNumber, workOrderNumber, quantityProduced, timeTaken, 
      confidenceScores, summary
    } = req.body;
    
    console.log('📝 Saving record:', { 
      uploadId, date, shift, employeeNumber, 
      workOrderNumber, quantityProduced, summary 
    });

    // Run validation (non-blocking - only warnings, not errors)
    const validation = validateRecord({
      date, shift, employeeNumber, operationCode, machineNumber, workOrderNumber, quantityProduced
    });

    // Check for duplicate work order (only if work order exists)
    let isDuplicate = false;
    if (workOrderNumber && workOrderNumber !== '') {
      isDuplicate = await checkDuplicateWorkOrder(db, workOrderNumber, id);
    }

    const recordId = id || uuidv4();
    const confidenceJson = JSON.stringify(confidenceScores || {});
    const validationErrorsJson = JSON.stringify({
      errors: validation.errors,
      warnings: validation.warnings,
      isDuplicate: isDuplicate
    });

    // If duplicate, still save but mark as warning
    // Don't block the save

    const query = `INSERT OR REPLACE INTO records (
      id, upload_id, date, shift, employee_number, operation_code, 
      machine_number, work_order_number, quantity_produced, time_taken, 
      confidence_scores, validation_errors, summary, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reviewed')`;

    const params = [
      recordId, 
      uploadId || '', 
      date || '', 
      shift || '', 
      employeeNumber || '', 
      operationCode || '', 
      machineNumber || '', 
      workOrderNumber || '', 
      quantityProduced || 0, 
      timeTaken || '', 
      confidenceJson, 
      validationErrorsJson, 
      summary || ''
    ];

    db.run(query, params, function(err) {
      if (err) {
        console.error('Save error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      res.json({ 
        success: true, 
        id: recordId, 
        message: 'Record saved successfully',
        validation: { 
          hasWarnings: validation.hasWarnings || isDuplicate, 
          warnings: validation.warnings,
          isDuplicate: isDuplicate
        }
      });
    });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all records
router.get('/', (req, res) => {
  db.all('SELECT * FROM records ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: err.message });
    }
    rows.forEach(row => {
      try {
        row.confidence_scores = JSON.parse(row.confidence_scores || '{}');
        row.validation_errors = JSON.parse(row.validation_errors || '{}');
      } catch(e) {
        row.confidence_scores = {};
        row.validation_errors = {};
      }
    });
    res.json(rows || []);
  });
});

// Get records by upload ID
router.get('/upload/:uploadId', (req, res) => {
  const { uploadId } = req.params;
  db.all('SELECT * FROM records WHERE upload_id = ? ORDER BY created_at DESC', [uploadId], (err, rows) => {
    if (err) {
      console.error('Fetch error:', err);
      return res.status(500).json({ error: err.message });
    }
    rows.forEach(row => {
      try {
        row.confidence_scores = JSON.parse(row.confidence_scores || '{}');
        row.validation_errors = JSON.parse(row.validation_errors || '{}');
      } catch(e) {
        row.confidence_scores = {};
        row.validation_errors = {};
      }
    });
    res.json(rows || []);
  });
});

module.exports = router;
