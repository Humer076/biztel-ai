function validateRecord(record) {
  const errors = {};
  const warnings = {};

  // Only validate if fields have values - DON'T require all fields
  // This allows saving partial data

  // Shift validation (only if shift is provided)
  if (record.shift && record.shift !== '') {
    const validShifts = ['Morning', 'Evening', 'Night', 'morning', 'evening', 'night', 'Day', 'Night Shift'];
    if (!validShifts.includes(record.shift) && !validShifts.includes(record.shift.toLowerCase())) {
      warnings.shift = `Shift '${record.shift}' may be incorrect. Expected Morning, Evening, or Night`;
    }
  }

  // Machine number format (only if provided)
  if (record.machineNumber && record.machineNumber !== '') {
    const machinePattern = /^[A-Za-z]{2,4}[-]?\d{3,4}$/;
    if (!machinePattern.test(record.machineNumber)) {
      warnings.machineNumber = `Machine number format may be incorrect. Expected format: MACH001 or MC-730`;
    }
  }

  // Employee number format (only if provided)
  if (record.employeeNumber && record.employeeNumber !== '') {
    const empPattern = /^[A-Za-z]{2,4}\d{3,4}$/;
    if (!empPattern.test(record.employeeNumber)) {
      warnings.employeeNumber = `Employee number format may be incorrect. Expected format: BT4685`;
    }
  }

  // Work order number format (only if provided)
  if (record.workOrderNumber && record.workOrderNumber !== '') {
    const woPattern = /^\d{5,6}$/;
    if (!woPattern.test(record.workOrderNumber)) {
      warnings.workOrderNumber = `Work order number should be 5-6 digits`;
    }
  }

  // Quantity validation (only if provided)
  if (record.quantityProduced && record.quantityProduced !== '') {
    const qty = parseInt(record.quantityProduced);
    if (isNaN(qty) || qty <= 0) {
      errors.quantityProduced = 'Quantity must be a positive number';
    } else if (qty > 10000) {
      warnings.quantityProduced = `Quantity ${qty} seems unusually high. Please verify`;
    }
  }

  // Date format validation (only if provided)
  if (record.date && record.date !== '') {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(record.date)) {
      errors.date = 'Date must be YYYY-MM-DD format';
    } else if (new Date(record.date) > new Date()) {
      warnings.date = 'Date is in the future. Please verify';
    }
  }

  // Time taken validation (only if provided)
  if (record.timeTaken && record.timeTaken !== '') {
    const timeMatch = record.timeTaken.match(/(\d+(?:\.\d+)?)/);
    if (timeMatch && parseFloat(timeMatch[1]) > 24) {
      warnings.timeTaken = `Time ${record.timeTaken} seems high. Is this correct?`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    hasWarnings: Object.keys(warnings).length > 0,
    errors,
    warnings
  };
}

async function checkDuplicateWorkOrder(db, workOrderNumber, excludeId = null) {
  // Skip duplicate check if no work order number
  if (!workOrderNumber || workOrderNumber === '') {
    return false;
  }
  
  return new Promise((resolve, reject) => {
    let query = 'SELECT COUNT(*) as count FROM records WHERE work_order_number = ?';
    const params = [workOrderNumber];
    
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row.count > 0);
    });
  });
}

module.exports = { validateRecord, checkDuplicateWorkOrder };
