require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow your Chrome extension to talk to this server
app.use(express.json({ limit: '10mb' })); // Increased limit to handle base64 image uploads

// The Proxy Endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        // Securely access the API key from environment variables
        const apiKey = process.env.GEMINI_API_KEY; 
        
        if (!apiKey) {
            return res.status(500).json({ error: "API Key missing on server" });
        }

        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        // Forward the request to Gemini
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body) // Pass the payload received from the extension
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Gemini API Error: ${errText}`);
        }
        
        const data = await response.json();
        res.json(data); // Send the Gemini response back to the extension

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure backend running on port ${PORT}`));