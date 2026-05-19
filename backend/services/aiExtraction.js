require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function extractFromImage(base64Image) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash"
    });
    
    const prompt = `You are an intelligent document analyzer. Analyze this document image and extract relevant information based on its type.

STEP 1: First, identify what type of document this is:
- MANUFACTURING_TABLE (contains rows/columns with fields like date, shift, employee, machine, quantity, etc.)
- CHART (bar chart, pie chart, line graph, etc.)
- TEXT_DOCUMENT (paragraphs, notes, letters, stories)
- INVOICE/RECEIPT
- OTHER

STEP 2: Based on document type, extract accordingly:

If MANUFACTURING_TABLE, extract these fields:
- date (YYYY-MM-DD format)
- shift (Morning/Evening/Night)
- employeeNumber
- operationCode
- machineNumber
- workOrderNumber
- quantityProduced (number)
- timeTaken (string like "2.5 hours")

If CHART, extract:
- chartType (bar/pie/line/etc.)
- title
- dataPoints: [{label, value}]
- insights: key observations

If TEXT_DOCUMENT or STORY, extract:
- documentType (story/article/note/letter)
- title/heading
- summary (1-2 sentences)
- keyEntities: [people, places, dates mentioned]
- wordCount (approximate)

If INVOICE, extract:
- invoiceNumber
- date
- totalAmount
- vendorName
- customerName

Return ONLY valid JSON in this exact structure:

{
  "documentType": "MANUFACTURING_TABLE | CHART | TEXT_DOCUMENT | INVOICE | OTHER",
  "confidence": 0.0-1.0,
  "fields": {
    // Manufacturing table fields (if applicable)
    "date": {"value": "", "confidence": 0},
    "shift": {"value": "", "confidence": 0},
    "employeeNumber": {"value": "", "confidence": 0},
    "operationCode": {"value": "", "confidence": 0},
    "machineNumber": {"value": "", "confidence": 0},
    "workOrderNumber": {"value": "", "confidence": 0},
    "quantityProduced": {"value": 0, "confidence": 0},
    "timeTaken": {"value": "", "confidence": 0},
    
    // Chart fields (if applicable)
    "chartType": {"value": "", "confidence": 0},
    "title": {"value": "", "confidence": 0},
    "dataPoints": {"value": [], "confidence": 0},
    "insights": {"value": "", "confidence": 0},
    
    // Text document fields (if applicable)
    "summary": {"value": "", "confidence": 0},
    "keyEntities": {"value": [], "confidence": 0},
    
    // Invoice fields (if applicable)
    "invoiceNumber": {"value": "", "confidence": 0},
    "totalAmount": {"value": "", "confidence": 0}
  },
  "message": "Brief description of what was extracted"
}

For non-table documents, leave manufacturing fields empty.
For charts and text documents, provide meaningful extractions.
Be helpful and intelligent in your analysis.

Respond with ONLY the JSON, no other text.`;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '');
    }
    
    const extractionResult = JSON.parse(cleanText);
    return extractionResult;
    
  } catch (error) {
    console.error('Gemini Extraction error:', error);
    throw new Error(`Failed to extract data: ${error.message}`);
  }
}

module.exports = { extractFromImage };
