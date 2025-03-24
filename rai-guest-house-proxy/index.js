const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxJSmd0oBkboseiVTOrHOQbBo1wWOi5Z237WmbbZtpz4wv3BZD6X3Ttk-TtzOSsei2K/exec';

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    exposedHeaders: ['Access-Control-Allow-Origin'],
    credentials: false
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    console.log('Raw request body:', req.body);
    console.log('Request headers:', req.headers);
    next();
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin');
    res.header('Content-Type', 'application/json');
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
            timeout: 15000
        });

        console.log('Menu response:', response.data);

        if (response.data.status === 'error') {
            throw new Error(response.data.message);
        }

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching menu:', error.message);
        if (error.response) {
            console.error('Full error response:', error.response.data);
            console.error('Status code:', error.response.status);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        }
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

        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new Error('Request body is empty');
        }

        const { roomNumber, mobileNumber, cart, total } = req.body;

        // Validate required fields
        if (!roomNumber || typeof roomNumber !== 'string') {
            throw new Error('Room number is required and must be a string');
        }
        if (!mobileNumber || typeof mobileNumber !== 'string') {
            throw new Error('Mobile number is required and must be a string');
        }
        if (!Array.isArray(cart) || cart.length === 0) {
            throw new Error('Cart must be a non-empty array');
        }
        if (typeof total !== 'number' || total <= 0) {
            throw new Error('Total must be a positive number');
        }

        // Validate cart items
        for (const item of cart) {
            if (!item.name || typeof item.name !== 'string') {
                throw new Error('Each cart item must have a valid name');
            }
            if (typeof item.price !== 'number' || item.price <= 0) {
                throw new Error('Each cart item must have a valid price');
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0) {
                throw new Error('Each cart item must have a valid quantity');
            }
        }

        const orderDataWithSheet = {
            action: 'submitOrder',
            spreadsheetId: '1RzPVjVA635R8GgjKSsvTLW2tC-FpVB0JdwVpp7ffVys',
            data: {
                roomNumber: roomNumber,
                mobileNumber: mobileNumber,
                orderItems: cart,
                total: total,
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
                timeout: 15000
            }
        );

        console.log('Apps Script response status:', response.status);
        console.log('Apps Script response data:', response.data);

        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid response from Apps Script');
        }

        if (response.data.status === 'success') {
            console.log('Order submitted successfully');
            res.json({ status: 'success', message: 'Order submitted successfully' });
        } else {
            console.log('Apps Script error:', response.data.message);
            throw new Error(response.data.message || 'Unknown error from Apps Script');
        }
    } catch (error) {
        console.error('Error submitting order:', error.message);
        if (error.response) {
            console.error('Apps Script error response:', error.response.data);
            console.error('Status code:', error.response.status);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
        }
        res.status(500).json({ 
            status: 'error',
            message: error.message || 'Failed to submit order',
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
