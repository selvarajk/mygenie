
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Enable CORS to allow requests from the frontend (usually localhost:3000 or 5173)
app.use(cors());

/**
 * POST /api/ingest
 * Proxies the file upload to Astra DB Vector Store
 */
app.post('/api/ingest', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Received file: ${req.file.originalname}`);

    try {
        const formData = new FormData();
        // Stream the file from the temporary upload location
        formData.append('file', fs.createReadStream(req.file.path));

        // Make server-side call to Astra (Bypassing Browser CORS)
        const astraResponse = await axios.post(
            "https://astra.datastax.com/api/v2/files",
            formData,
            {
                headers: {
                    "X-DataStax-Current-Org": "a3d79f4a-2460-4634-b640-734f7bf06e79",
                    "Authorization": "Bearer AstraCS:qhJZXQyzlkIqgQYIWsXAIqQm:da6d7d860d2531d227f7b0d05290774e7fda08304a7bfb30d567672e17e6827d",
                    ...formData.getHeaders()
                }
            }
        );

        console.log("Astra Upload Success:", astraResponse.data);

        // Cleanup temp file
        fs.unlinkSync(req.file.path);

        res.json(astraResponse.data);

    } catch (error) {
        // Cleanup temp file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error("Proxy Error:", error.message);
        if (error.response) {
            console.error("Astra Response:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`RAG Proxy Server running on port ${PORT}`);
    console.log(`Endpoint ready at http://localhost:${PORT}/api/ingest`);
});
