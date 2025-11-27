const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { logCheckIn } = require('../src/services/streaks/createStreak.service');
const { getUserStreak } = require('../src/services/streaks/readStreak.service');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');

const app = express();

app.use(cors({
    origin:'https://ginagrosso.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.post('/check-in', validateFirebaseIdToken, async (req, res) => {
    console.log('=== POST /check-in ===');
    console.log('Body recibido:', req.body);
    try {
        const { userId, gymId, classId, code } = req.body;
        if (!userId) {
            const error = new Error('El userId es requerido');
            const errorResponse = getErrorResponseObject(error);
            return res.status(errorResponse.statusCode || 400).json(errorResponse);
        }
        const checkIn = await logCheckIn({ userId, gymId, classId, code });
        console.log('Check-in registrado exitosamente:', checkIn);
        res.status(201).json(getSuccessResponseObject(checkIn, 'Check-in registrado exitosamente'));
    } catch (error) {
        console.error('Error en POST /check-in:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get('/history', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /history ===');
    console.log('Query params:', req.query);
    try {
        const userId = req.query.userId;
        if (!userId) {
            const error = new Error('Usuario no autenticado o userId no proporcionado');
            const errorResponse = getErrorResponseObject(error);
            return res.status(errorResponse.statusCode || 400).json(errorResponse);
        }
        const streakData = await getUserStreak(userId);
        const history = Object.entries(streakData.checkIns || {}).map(([date, data]) => ({
            date,
            timestamp: data.timestamp
        })).sort((a, b) => b.timestamp - a.timestamp);
        res.status(200).json(getSuccessResponseObject({
            history,
            totalCheckIns: streakData.totalCheckIns,
            currentStreak: streakData.currentStreak,
            longestStreak: streakData.longestStreak
        }));
    } catch (error) {
        console.error('Error en GET /history:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get('/:userId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /streak/:userId ===');
    console.log('Params:', req.params);
    try {
        const { userId } = req.params;
        const streakData = await getUserStreak(userId);
        console.log('Racha obtenida exitosamente');
        res.status(200).json(getSuccessResponseObject(streakData));
    } catch (error) {
        console.error('Error en GET /streak:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});


module.exports = functions.https.onRequest(app);