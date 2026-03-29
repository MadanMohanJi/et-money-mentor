require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/analyze', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key missing in Render.");

        // 👉 Initialize SDK with the model that worked for you!
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const { systemPrompt, userText, imageBase64, mimeType } = req.body;

        const parts = [
            { text: systemPrompt },
            { text: "User Input: " + userText }
        ];

        if (imageBase64 && mimeType) {
            parts.push({
                inlineData: { data: imageBase64, mimeType: mimeType }
            });
        }

        console.log("Generating content with gemini-2.5-flash...");
        const result = await model.generateContent(parts);
        const response = await result.response;
        
        // Send plain text back to the extension to avoid JSON nesting errors
        res.json({ result: response.text() });

    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Backend Live on Port ${PORT}`));