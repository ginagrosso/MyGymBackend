const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { createRegistration } = require('../src/services/registrations/createRegistration.service');
const { getUserActiveRegistrations, getRegistrationDetails, getUserRegistrationHistory } = require('../src/services/registrations/readRegistration.service');
const { cancelRegistration } = require('../src/services/registrations/cancelRegistration.service');

const app = express();

app.use(cors({
    origin:'https://ginagrosso.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

/**
 * GET /
 * Ver mis inscripciones activas
 */
app.get('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId es requerido'
            });
        }
        
        const registrations = await getUserActiveRegistrations(userId);
        
        res.status(200).json({
            success: true,
            data: registrations,
            count: registrations.length
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener inscripciones'
        });
    }
});

/**
 * POST /
 * Inscribirse a una clase
 */
app.post('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const registration = await createRegistration(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Inscripción realizada exitosamente',
            data: registration
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear inscripción'
        });
    }
});

/**
 * GET /history
 * Historial de inscripciones pasadas
 */
app.get('/history', validateFirebaseIdToken, async (req, res) => {
    try {
        const userId = req.query.userId;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId es requerido'
            });
        }
        
        const history = await getUserRegistrationHistory(userId, limit, offset);
        
        res.status(200).json({
            success: true,
            data: history,
            count: history.length,
            pagination: {
                limit,
                offset,
                hasMore: history.length === limit
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener historial'
        });
    }
});


/**
 * GET /:id
 * Detalle de inscripción
 */
app.get('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const registration = await getRegistrationDetails(id);
        
        res.status(200).json({
            success: true,
            data: registration
        });
        
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Inscripción no encontrada'
        });
    }
});

/**
 * DELETE /:id
 * Cancelar inscripción
 */
app.delete('/:id', validateFirebaseIdToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await cancelRegistration(id);
        
        res.status(200).json({
            success: true,
            message: 'Inscripción cancelada exitosamente',
            data: result
        });
        
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error al cancelar inscripción'
        });
    }
});

// Exportar como Cloud Function
module.exports = functions.https.onRequest(app);