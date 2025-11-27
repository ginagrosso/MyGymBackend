const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { createRegistration } = require('../src/services/registrations/createRegistration.service');
const { getUserActiveRegistrations, getRegistrationDetails, getUserRegistrationHistory } = require('../src/services/registrations/readRegistration.service');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { cancelRegistration } = require('../src/services/registrations/cancelRegistration.service');

const app = express();

app.use(cors({
    origin:'https://ginagrosso.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.get('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            const error = new Error('userId es requerido');
            const errorResponse = getErrorResponseObject(error);
            return res.status(errorResponse.statusCode || 400).json(errorResponse);
        }
        const registrations = await getUserActiveRegistrations(userId);
        res.status(200).json(getSuccessResponseObject(registrations, undefined, { count: registrations.length }));
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const registration = await createRegistration(req.body);
        res.status(201).json(getSuccessResponseObject(registration, 'Inscripción realizada exitosamente'));
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

app.get('/history', validateFirebaseIdToken, async (req, res) => {
    try {
        const userId = req.query.userId;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        if (!userId) {
            const error = new Error('userId es requerido');
            const errorResponse = getErrorResponseObject(error);
            return res.status(errorResponse.statusCode || 400).json(errorResponse);
        }
        const history = await getUserRegistrationHistory(userId, limit, offset);
        res.status(200).json(getSuccessResponseObject(history, undefined, {
            count: history.length,
            pagination: {
                limit,
                offset,
                hasMore: history.length === limit
            }
        }));
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await getRegistrationDetails(id);
        res.status(200).json(getSuccessResponseObject(registration));
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 404).json(errorResponse);
    }
});

app.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await cancelRegistration(id);
        res.status(200).json(getSuccessResponseObject(result, 'Inscripción cancelada exitosamente'));
    } catch (error) {
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

module.exports = functions.https.onRequest(app);