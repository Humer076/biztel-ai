import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ResultDisplay from '../components/ResultDisplay';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [uploadId, setUploadId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        if (selectedFile.type === 'application/pdf') {
          setPreview('pdf');
        } else {
          setPreview(URL.createObjectURL(selectedFile));
        }
        setResult(null);
      } else {
        alert('Please upload an image (JPEG/PNG) or PDF file');
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type === 'application/pdf') {
        setPreview('pdf');
      } else {
        setPreview(URL.createObjectURL(selectedFile));
      }
      setResult(null);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleExtract = async () => {
    if (!file) return;
    
    setExtracting(true);
    setProcessingStep('📤 Uploading document...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      setProcessingStep('📄 Analyzing document structure...');
      const uploadRes = await axios.post('/api/upload', formData);
      setUploadId(uploadRes.data.uploadId);

      let response;
      if (file.type === 'application/pdf') {
        setProcessingStep('📑 Extracting text from PDF...');
        response = await axios.post('/api/extract', { 
          pdfPath: uploadRes.data.filepath, 
          isPDF: true 
        });
      } else {
        setProcessingStep('🖼️ Processing image with AI...');
        const base64 = await fileToBase64(file);
        response = await axios.post('/api/extract', { imageBase64: base64 });
      }
      
      setProcessingStep('✨ AI analysis complete!');
      setTimeout(() => setProcessingStep(''), 1000);
      setResult(response.data);
    } catch (error) {
      console.error('Extraction failed:', error);
      setProcessingStep('❌ Extraction failed');
      setTimeout(() => setProcessingStep(''), 2000);
      alert('Extraction failed: ' + (error.response?.data?.error || error.message));
    } finally {
      setExtracting(false);
    }
  };

const handleSave = async (editedData) => {
  try {
    // Make sure all fields are included even if empty
    const recordToSave = {
      uploadId: uploadId,
      date: editedData.date || '',
      shift: editedData.shift || '',
      employeeNumber: editedData.employeeNumber || '',
      operationCode: editedData.operationCode || '',
      machineNumber: editedData.machineNumber || '',
      workOrderNumber: editedData.workOrderNumber || '',
      quantityProduced: parseInt(editedData.quantityProduced) || 0,
      timeTaken: editedData.timeTaken || '',
      summary: editedData.summary || '',
      confidenceScores: {
        date: 0.9, shift: 0.9, employeeNumber: 0.9, operationCode: 0.9,
        machineNumber: 0.9, workOrderNumber: 0.9, quantityProduced: 0.9, timeTaken: 0.9
      }
    };
    
    console.log('📤 Sending to backend:', recordToSave);
    
    const response = await axios.post('/api/records', recordToSave);
    
    if (response.data.success) {
      alert('✅ Record saved successfully!');
      setResult(null);
      setFile(null);
      setPreview(null);
      window.location.href = '/history';
    } else {
      alert('❌ Save failed: ' + (response.data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Save failed:', error);
    const errorMsg = error.response?.data?.error || error.message;
    const validation = error.response?.data?.validation;
    
    if (validation?.errors) {
      alert('Validation Errors:\n' + Object.entries(validation.errors).map(([k,v]) => `${k}: ${v}`).join('\n'));
    } else {
      alert('Failed to save: ' + errorMsg);
    }
  }
};

  const handleCancel = () => {
    setResult(null);
    setFile(null);
    setPreview(null);
  };

  const resetUpload = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            AI Document Processing
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Upload manufacturing documents, charts, or PDFs. Our AI extracts data and provides intelligent insights.
          </p>
        </motion.div>

        {/* Upload Area */}
        {!file && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
          >
            <div
              className={`relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
                ${dragActive 
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">Drop your document here</p>
                  <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                </div>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">📷 JPEG/PNG</span>
                  <span className="flex items-center gap-1">📄 PDF</span>
                  <span className="flex items-center gap-1">📊 Tables & Charts</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing & Preview Area */}
        <AnimatePresence>
          {file && !result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {file.type === 'application/pdf' ? (
                      <span className="text-2xl">📄</span>
                    ) : (
                      <span className="text-2xl">🖼️</span>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button onClick={resetUpload} className="text-gray-400 hover:text-gray-600 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {preview && preview !== 'pdf' && (
                  <div className="p-6 bg-gray-50 flex justify-center">
                    <img src={preview} alt="Preview" className="max-h-64 object-contain rounded-lg" />
                  </div>
                )}
                
                {preview === 'pdf' && (
                  <div className="p-12 bg-gray-50 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📄</span>
                    </div>
                    <p className="text-gray-600">PDF ready for processing</p>
                    <p className="text-sm text-gray-400 mt-1">Text will be extracted and summarized</p>
                  </div>
                )}

                <div className="p-6">
                  {!extracting ? (
                    <button
                      onClick={handleExtract}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Extract with AI
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600">{processingStep}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {result && (
          <ResultDisplay 
            result={result} 
            onSave={handleSave} 
            onCancel={handleCancel} 
          />
        )}
      </div>
    </div>
  );
}
