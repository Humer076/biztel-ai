import { useState, useEffect } from 'react';
import ConfidenceBadge from './ConfidenceBadge';

export default function ResultDisplay({ result, onSave, onCancel, validationWarnings = {} }) {
  const [editedData, setEditedData] = useState({});
  const [showWarnings, setShowWarnings] = useState(true);

  // Initialize editedData when result changes
  useEffect(() => {
    if (result?.type === 'TABLE') {
      const initialData = {};
      ['date', 'shift', 'employeeNumber', 'operationCode', 'machineNumber', 'workOrderNumber', 'quantityProduced', 'timeTaken'].forEach(field => {
        initialData[field] = result[field]?.value || result[field] || '';
      });
      setEditedData(initialData);
    } else if (result?.type === 'TEXT' || result?.type === 'PDF') {
      setEditedData({ summary: result?.summary || '' });
    }
  }, [result]);

  const handleFieldChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(editedData);
  };

  const isTable = result?.type === 'TABLE';
  const isText = result?.type === 'TEXT';
  const isPDF = result?.type === 'PDF';

  const fieldLabels = {
    date: 'Date', 
    shift: 'Shift', 
    employeeNumber: 'Employee Number',
    operationCode: 'Operation Code', 
    machineNumber: 'Machine Number',
    workOrderNumber: 'Work Order Number', 
    quantityProduced: 'Quantity Produced',
    timeTaken: 'Time Taken'
  };

  // Helper to get confidence value
  const getConfidence = (field) => {
    if (result?.fields?.[field]?.confidence) {
      return result.fields[field].confidence;
    }
    if (result?.[field]?.confidence) {
      return result[field].confidence;
    }
    return null;
  };

  if (!result) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {isTable && '📊 Extracted Manufacturing Data'}
          {isText && '📝 AI Summary'}
          {isPDF && '📄 PDF Analysis'}
        </h2>
      </div>
      
      <div className="p-6">
        {/* Confidence Score Summary */}
        {isTable && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🤖 AI Confidence Scores: 
              <span className="ml-2">
                {Object.keys(editedData).map(field => {
                  const conf = getConfidence(field);
                  if (conf) {
                    let color = conf >= 0.7 ? 'text-green-600' : conf >= 0.4 ? 'text-yellow-600' : 'text-red-600';
                    return (
                      <span key={field} className={`ml-2 ${color}`}>
                        {fieldLabels[field]}: {Math.round(conf * 100)}%
                      </span>
                    );
                  }
                  return null;
                })}
              </span>
            </p>
          </div>
        )}

        {/* Validation Warnings */}
        {Object.keys(validationWarnings).length > 0 && showWarnings && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ Validation Warnings:</p>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  {Object.entries(validationWarnings).map(([field, message]) => (
                    <li key={field}>
                      <span className="font-medium">{fieldLabels[field] || field}:</span> {message}
                    </li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => setShowWarnings(false)}
                className="text-xs text-yellow-600 hover:text-yellow-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        {isTable && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {['date', 'shift', 'employeeNumber', 'operationCode', 'machineNumber', 'workOrderNumber', 'quantityProduced', 'timeTaken'].map(field => {
              const confidence = getConfidence(field);
              const hasWarning = validationWarnings[field];
              
              return (
                <div key={field} className="space-y-1">
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span>{fieldLabels[field] || field}</span>
                    <ConfidenceBadge confidence={confidence} />
                  </label>
                  <input
                    type={field === 'quantityProduced' ? 'number' : 'text'}
                    value={editedData[field] || ''}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                      ${hasWarning ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                  />
                  {hasWarning && (
                    <p className="text-xs text-yellow-600 mt-1">{validationWarnings[field]}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TEXT VIEW */}
        {isText && (
          <div className="mb-5">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              AI Summary <ConfidenceBadge confidence={0.85} />
            </label>
            <textarea
              value={editedData.summary || ''}
              onChange={(e) => handleFieldChange('summary', e.target.value)}
              rows="5"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="AI-generated summary will appear here..."
            />
          </div>
        )}

        {/* PDF VIEW */}
        {isPDF && (
          <>
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                PDF Summary <ConfidenceBadge confidence={0.9} />
              </label>
              <textarea
                value={editedData.summary || ''}
                onChange={(e) => handleFieldChange('summary', e.target.value)}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="PDF summary will appear here..."
              />
            </div>
            {result.keyPoints && result.keyPoints.length > 0 && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Key Points
                </label>
                <ul className="space-y-2">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <span className="text-blue-500">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition transform hover:scale-105"
          >
            ✓ Save to Database
          </button>
          <button 
            onClick={onCancel} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition"
          >
            Cancel
          </button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-400 mt-4 text-center">
          Fields with <span className="text-green-600">green confidence</span> are highly accurate. 
          <span className="text-yellow-600"> Yellow</span> needs review. 
          <span className="text-red-600"> Red</span> requires manual verification.
        </p>
      </div>
    </div>
  );
}
