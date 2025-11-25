require('../config/environment');
const express = require('express');
const cors = require('cors');
const userService = require('../src/services/users.service');
const functions = require('firebase-functions');
const loggingMiddleware = require('../src/middlewares/logging.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'https://your-production-domain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use(loggingMiddleware);

app.post('/auth/register/client', async (req, res) => {
    try {
        const nuevoCliente = await userService.registerClient(req.body);
        const response = getSuccessResponseObject(nuevoCliente, 'Cliente registrado con éxito');
        return res.status(httpStatusCodes.created).json(response);
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        const statusCode = errorResponse.statusCode;
        delete errorResponse.statusCode;
        return res.status(statusCode).json(errorResponse);
    }
});

module.exports = functions.https.onRequest(app);