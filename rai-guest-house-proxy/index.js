const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Update the Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzZY6a4f7CG4C373daFARv1AEga6mxWUV2ngCcCrU3cqXfISi0goPSJqk8Qc73vGymm/exec';

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    credentials: false
}));

app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    next();
});

// Ensure CORS headers are set for all responses
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin');
    next();
});

app.get('/', (req, res) => {
    res.send('Welcome to Rai Guest House Proxy Server 🚀');
});

app.get('/menu', async (req, res) => {
    try {
        console.log('Fetching menu...');
        const response = await axios.get(`${APPS_SCRIPT_URL}?action=getMenu&spreadsheetId=1dlrMCBndJsgFAQi3c9yf-7Rg_ZMIIFHlo2yCHYGyWGk&sheetName=Menu Items`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 15000 // Increase timeout to 15 seconds
        });

        console.log('Menu response:', response.data);

        // Check if response is an error
        if (response.data.status === 'error') {
            throw new Error(response.data.message);
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        if (error.response) {
            console.error('Full error response:', error.response.data);
            console.error('Status code:', error.response.status);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ 
            error: 'Failed to fetch menu',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/submit-order', async (req, res) => {
    try {
        console.log('Submitting order...', req.body);
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Error('Request body khali hai.');
        }

        const orderDataWithSheet = {
            action: 'submitOrder',
            spreadsheetId: '1RzPVjVA635R8GgjKSsvTLW2tC-FpVB0JdwVpp7ffVys',
            data: {
                roomNumber: req.body.roomNumber,
                mobileNumber: req.body.mobileNumber,
                orderItems: req.body.cart, // Changed from req.body.items to req.body.cart
                total: req.body.total,
                timestamp: new Date().toISOString()
            }
        };

        console.log('Sending to Apps Script:', orderDataWithSheet);

        const response = await axios.post(
            APPS_SCRIPT_URL,
            orderDataWithSheet,
            { 
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000 // Increased timeout to 15 seconds
            }
        );

        console.log('Apps Script response:', response.data);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.json(response.data);
    } catch (error) {
        console.error('Error submitting order:', error.message);
        if (error.response) {
            console.error('Apps Script error response:', error.response.data);
            console.error('Status code:', error.response.status);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({ 
            error: 'Failed to submit order',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;