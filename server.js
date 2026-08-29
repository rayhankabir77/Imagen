const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const API_TOKEN = process.env.HF_TOKEN; // Render Environment Variable থেকে নেবে

const MODELS = [
    "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
    "https://api-inference.huggingface.co/models/prompthero/openjourney"
];

app.post('/generate-image', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "প্রম্পট দেওয়া আবশ্যক!" });
    }

    for (let modelUrl of MODELS) {
        try {
            const response = await axios.post(
                modelUrl,
                { inputs: prompt },
                {
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'Content-Type': 'application/json',
                        'x-wait-for-model': 'true'
                    },
                    responseType: 'arraybuffer',
                    timeout: 60000
                }
            );

            // সফল হলে সরাসরি ইমেজ রিটার্ন করবে
            res.set('Content-Type', 'image/png');
            return res.send(Buffer.from(response.data));

        } catch (error) {
            console.log(`Model failed: ${modelUrl}`);
        }
    }

    res.status(500).json({ error: "সবগুলো মডেল ব্যর্থ হয়েছে!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
