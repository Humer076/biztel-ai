const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const pdf = require('pdf-parse');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to clean JSON response
function cleanJSONResponse(text) {
  // Remove markdown code blocks
  let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  // Remove trailing commas
  cleaned = cleaned.replace(/,\s*}/g, '}').replace(/,\s*\]/g, ']');
  return cleaned;
}

// Process images
async function processImage(base64Image) {
  const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
  
  const prompt = `Analyze this image and determine what it contains.

If it's a MANUFACTURING TABLE with data, return:
{
  "type": "TABLE",
  "date": "extracted date or empty",
  "shift": "Morning/Evening/Night or empty",
  "employeeNumber": "employee number or empty",
  "operationCode": "operation code or empty",
  "machineNumber": "machine number or empty",
  "workOrderNumber": "work order or empty",
  "quantityProduced": number or 0,
  "timeTaken": "time or empty"
}

If it's NORMAL TEXT (story, notes, article), return:
{
  "type": "TEXT",
  "summary": "A brief summary of what this text is about",
  "content": "The main content"
}

Return ONLY valid JSON. No explanations.`;

  const imagePart = { inlineData: { data: base64Image, mimeType: "image/jpeg" } };
  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const cleaned = cleanJSONResponse(response.text());
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Fallback if JSON parsing fails
    return { type: "TEXT", summary: "Could not parse document", content: response.text() };
  }
}

// Process PDFs
async function processPDF(pdfPath) {
  // Extract text from PDF
  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdf(dataBuffer);
  const text = pdfData.text.substring(0, 5000);
  
  const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
  
  const prompt = `Summarize this document and extract key information:

${text}

Return ONLY valid JSON:
{
  "type": "PDF",
  "summary": "2-3 sentence summary of the document",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "metadata": {
    "pageCount": ${pdfData.numpages},
    "title": "title if found"
  }
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const cleaned = cleanJSONResponse(response.text());
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return { type: "PDF", summary: "PDF processed successfully", keyPoints: [], metadata: {} };
  }
}

router.post('/', async (req, res) => {
  try {
    const { imageBase64, pdfPath, isPDF } = req.body;
    
    let result;
    if (isPDF && pdfPath) {
      result = await processPDF(pdfPath);
    } else if (imageBase64) {
      result = await processImage(imageBase64);
    } else {
      return res.status(400).json({ error: 'No file data provided' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'AI extraction failed: ' + error.message });
  }
});

module.exports = router;
