require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/analyze', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "Server Error: GEMINI_API_KEY is missing in Render Environment Variables." });
        }

        // Using the REST API method (fetch) which you used previously
        // We use v1beta and gemini-1.5-flash as it's the most stable for this method
        const model = "gemini-1.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        console.log(`Analyzing request with model: ${model}...`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", JSON.stringify(data));
            return res.status(response.status).json({ 
                error: data.error?.message || "Gemini API Error" 
            });
        }

        // Return the raw data back to the extension
        res.json(data);

    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: "Backend server failed to process request." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`ET Backend (REST Mode) live on port ${PORT}`));