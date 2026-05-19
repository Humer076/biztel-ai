require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("=== Testing Gemini API ===");
console.log("1. Checking API key...");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ No API key found in .env file");
  process.exit(1);
}
console.log("✅ API key found (length:", apiKey.length, "characters)");

console.log("2. Initializing Gemini...");
const genAI = new GoogleGenerativeAI(apiKey);

console.log("3. Testing model: models/gemini-2.5-flash...");

async function test() {
  try {
    // Use the FULL model name with "models/" prefix
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent("Say 'Hello from Gemini API!'");
    const response = await result.response;
    console.log("4. ✅ SUCCESS! Response:", response.text());
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

test();