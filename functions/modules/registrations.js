//functions/modules/memberships.js
//Importar express, cors, y el pasamano membershipService.
//Crear la app de Express: const app = express();.
//Endpoint GET /gym/:gymId: (Para gestion-socios.tsx) Llama a membershipService.getMembersByGym(req.params.gymId).
//Endpoint POST /add: (Para ClientFormModal.tsx) Llama a membershipService.addMemberToGym(req.body).
//Endpoint DELETE /remove: (Para gestion-socios.tsx) Llama a membershipService.removeMemberFromGym(req.body).
//Exportar app.

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const { createRegistration } = require('../src/services/registrations/createRegistration.service');
const { getUserActiveRegistrations, getRegistrationDetails, getUserRegistrationHistory } = require('../src/services/registrations/readRegistration.service');
const { cancelRegistration } = require('../src/services/registrations/cancelRegistration.service');

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * GET /
 * Ver mis inscripciones activas
 */
app.get('/', async (req, res) => {
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
app.post('/', async (req, res) => {
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
 * GET /:id
 * Detalle de inscripción
 */
app.get('/:id', async (req, res) => {
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
app.delete('/:id', async (req, res) => {
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

/**
 * GET /history
 * Historial de inscripciones pasadas
 */
app.get('/history', async (req, res) => {
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

// Exportar como Cloud Function
module.exports = functions.https.onRequest(app);