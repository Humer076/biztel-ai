require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log("Checking available models for your API key...");

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    console.log("\n✅ Available models for generateContent:");
    if (data.models) {
      data.models.forEach(model => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`  - ${model.name} (${model.displayName})`);
        }
      });
    } else {
      console.log("No models found. Your API key might need additional setup.");
      console.log("Response:", data);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();