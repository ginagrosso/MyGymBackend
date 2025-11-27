
const express = require('express');
const cors = require('cors');
const authService = require('../src/services/auth.service');
const functions = require('firebase-functions');
const loggingMiddleware = require('../src/middlewares/logging.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');

const app = express();

app.use(cors({
    origin: ['https://ginagrosso.github.io'],
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

// Solicitar recuperación de contraseña (público)
app.post('/auth/forgot-password', async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body);
        const response = getSuccessResponseObject(result, 'Email de recuperación procesado');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

// Resetear contraseña con código (público)
app.post('/auth/reset-password', async (req, res) => {
    try {
        const result = await authService.resetPassword(req.body);
        const response = getSuccessResponseObject(result, 'Contraseña restablecida exitosamente');
        return res.status(httpStatusCodes.ok).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

module.exports = functions.https.onRequest(app);