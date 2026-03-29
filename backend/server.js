require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

app.post('/api/analyze', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing in Render Environment Variables.");

        // 1. Initialize the Official Google SDK
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 2. Extract data sent from your Chrome Extension
        const { systemPrompt, userText, imageBase64, mimeType } = req.body;

        // 3. Build the payload exactly how the SDK wants it
        const parts = [
            { text: systemPrompt },
            { text: "User Input: " + userText }
        ];

        // If an image was uploaded, attach it properly
        if (imageBase64 && mimeType) {
            parts.push({
                inlineData: {
                    data: imageBase64,
                    mimeType: mimeType
                }
            });
        }

        // 4. Generate Content! (The SDK handles all the URL routing perfectly)
        console.log("Sending request to Google AI...");
        const result = await model.generateContent(parts);
        const response = await result.response;
        const text = response.text();

        // 5. Send successful result back to extension
        res.json({ result: text });

    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`ET Money Mentor Live on Port ${PORT}`));