const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { logCheckIn } = require('../src/services/streaks/createStreak.service');
const { getUserStreak } = require('../src/services/streaks/readStreak.service');

const app = express();

// Middlewares
//cors permite cualquier origen, cambiar en producción
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * POST /check-in
 * Registrar asistencia (check-in)
 */
app.post('/check-in', async (req, res) => {
    console.log('=== POST /check-in ===');
    console.log('Body recibido:', req.body);
    
    try {
        const { userId, gymId, classId, code } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'El userId es requerido'
            });
        }
        
        const checkIn = await logCheckIn({ userId, gymId, classId, code });
        
        console.log('Check-in registrado exitosamente:', checkIn);
        
        res.status(201).json({
            success: true,
            message: 'Check-in registrado exitosamente',
            data: checkIn
        });
        
    } catch (error) {
        console.error('Error en POST /check-in:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al registrar check-in'
        });
    }
});

/**
 * GET /streak/:userId
 * Obtener racha de un usuario
 */
app.get('/streak/:userId', async (req, res) => {
    console.log('=== GET /streak/:userId ===');
    console.log('Params:', req.params);
    
    try {
        const { userId } = req.params;
        
        const streakData = await getUserStreak(userId);
        
        console.log('Racha obtenida exitosamente');
        
        res.status(200).json({
            success: true,
            data: streakData
        });
        
    } catch (error) {
        console.error('Error en GET /streak:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener racha'
        });
    }
});

/**
 * GET /history
 * Historial de asistencias del usuario autenticado
 */
app.get('/history', async (req, res) => {
    console.log('=== GET /history ===');
    console.log('Query params:', req.query);
    
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no autenticado o userId no proporcionado'
            });
        }
        
        const streakData = await getUserStreak(userId);
        
        const history = Object.entries(streakData.checkIns || {}).map(([date, data]) => ({
            date,
            timestamp: data.timestamp
        })).sort((a, b) => b.timestamp - a.timestamp);
        
        res.status(200).json({
            success: true,
            data: {
                history,
                totalCheckIns: streakData.totalCheckIns,
                currentStreak: streakData.currentStreak,
                longestStreak: streakData.longestStreak
            }
        });
        
    } catch (error) {
        console.error('Error en GET /history:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener historial'
        });
    }
});

module.exports = functions.https.onRequest(app);