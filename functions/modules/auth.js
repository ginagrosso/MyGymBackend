
const express = require('express');
const cors = require('cors');
const authService = require('../src/services/auth.service');
const functions = require('firebase-functions');
const loggingMiddleware = require('../src/middlewares/logging.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://your-production-domain.com'],
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(loggingMiddleware);


app.post('/auth/login', async (req, res) => {
    try {
        const loginData = req.body;
        const loginResponse = await authService.login(loginData);
        const response = getSuccessResponseObject(loginResponse, 'Login exitoso');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    };
});

module.exports = functions.https.onRequest(app);