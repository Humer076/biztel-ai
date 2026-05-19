const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// For Images: Detect if Table or Text, then extract
async function processImage(base64Image) {
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    
    const prompt = `Analyze this image and do ONE of the following:

1. If it's a MANUFACTURING TABLE (has rows/columns with data like date, shift, employee, machine, quantity):
   Extract these exact fields as JSON:
   - date (YYYY-MM-DD)
   - shift (Morning/Evening/Night)
   - employeeNumber
   - operationCode
   - machineNumber
   - workOrderNumber
   - quantityProduced (number)
   - timeTaken

2. If it's NORMAL TEXT, STORY, or NOTES (no table structure):
   Provide a summary and key points.

Return ONLY valid JSON in this format:
{
  "type": "TABLE" or "TEXT",
  "data": {
    // If TABLE:
    "date": {"value": "...", "confidence": 0.9},
    "shift": {"value": "...", "confidence": 0.9},
    "employeeNumber": {"value": "...", "confidence": 0.9},
    "operationCode": {"value": "...", "confidence": 0.9},
    "machineNumber": {"value": "...", "confidence": 0.9},
    "workOrderNumber": {"value": "...", "confidence": 0.9},
    "quantityProduced": {"value": 0, "confidence": 0.9},
    "timeTaken": {"value": "...", "confidence": 0.9},
    
    // If TEXT:
    "summary": "Brief summary of the content",
    "keyPoints": ["point 1", "point 2"]
  }
}`;

    const imagePart = { inlineData: { data: base64Image, mimeType: "image/jpeg" } };
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(text);
}

// For PDFs: Extract text, then summarize
async function processPDF(pdfPath) {
    // 1. Extract text from PDF
    const dataBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdf(dataBuffer);
    const extractedText = pdfData.text.substring(0, 8000); // Limit text length

    // 2. Summarize with Gemini
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const prompt = `Summarize this manufacturing document text and extract key operational data.

Text:
${extractedText}

Return ONLY valid JSON:
{
  "type": "PDF",
  "summary": "A 2-3 sentence summary",
  "keyData": {
    "date": "YYYY-MM-DD if found",
    "workOrder": "work order number if found",
    "employee": "employee number if found",
    "machine": "machine number if found",
    "quantity": "quantity if found"
  }
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(text);
}

module.exports = { processImage, processPDF };
