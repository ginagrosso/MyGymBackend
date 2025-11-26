//functions/modules/routines.js
//Importar express, cors, y el pasamano routineService.
//Crear la app de Express: const app = express();.
//Endpoint POST /: (Para crear rutinas) Llama a routineService.createRoutine(req.body).
//Endpoint PUT /:routineId: (Para editar rutinas) Llama a routineService.updateRoutine(req.params.routineId, req.body).
//Endpoint POST /assign: (Para entrenamiento.tsx) Llama a routineService.assignRoutine(req.body).
//Endpoint GET /user/:userId: (Para rutina.tsx) Llama a routineService.getUserRoutine(req.params.userId).
//Exportar app.

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { createRoutine } = require('../src/services/routines/createRoutine.service');
const { getRoutineDetails, getUserActiveRoutine } = require('../src/services/routines/readRoutine.service');
const { updateRoutine, archiveRoutine } = require('../src/services/routines/updateRoutine.service');
const { assignRoutine } = require('../src/services/routines/assignRoutine.service');
const { logProgress } = require('../src/services/routines/logProgress.service');

const app = express();

// Middlewares
//cors permite cualquier origen, cambiar en producción
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * POST /
 * Crear nueva rutina
 */
app.post('/create', async (req, res) => {
    console.log('=== POST /routines ===');
    console.log('Body recibido:', req.body);
    
    try {
        const routine = await createRoutine(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Rutina creada exitosamente',
            data: routine
        });
        
    } catch (error) {
        console.error('Error en POST /routines:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear rutina'
        });
    }
});

/**
 * GET /:routineId
 * Obtener detalles de una rutina
 */
app.get('/:routineId', async (req, res) => {
    console.log('=== GET /routines/:routineId ===');
    console.log('Params:', req.params);
    
    try {
        const { routineId } = req.params;
        const routine = await getRoutineDetails(routineId);
        
        res.status(200).json({
            success: true,
            data: routine
        });
        
    } catch (error) {
        console.error('Error en GET /routines/:routineId:', error.message);
        res.status(404).json({
            success: false,
            message: error.message || 'Error al obtener rutina'
        });
    }
});

/**
 * PUT /:routineId
 * Actualizar rutina
 */
app.put('/:routineId', async (req, res) => {
    console.log('=== PUT /routines/:routineId ===');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    try {
        const { routineId } = req.params;
        const updatedRoutine = await updateRoutine(routineId, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Rutina actualizada exitosamente',
            data: updatedRoutine
        });
        
    } catch (error) {
        console.error('Error en PUT /routines/:routineId:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar rutina'
        });
    }
});

/**
 * DELETE /:routineId
 * Archivar rutina (soft delete)
 */
app.delete('/:routineId', async (req, res) => {
    console.log('=== DELETE /routines/:routineId ===');
    console.log('Params:', req.params);
    
    try {
        const { routineId } = req.params;
        const result = await archiveRoutine(routineId);
        
        res.status(200).json({
            success: true,
            message: 'Rutina archivada exitosamente',
            data: result
        });
        
    } catch (error) {
        console.error('Error en DELETE /routines/:routineId:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al archivar rutina'
        });
    }
});

/**
 * POST /assign
 * Asignar rutina a un usuario
 */
app.post('/assign', async (req, res) => {
    console.log('=== POST /routines/assign ===');
    console.log('Body:', req.body);
    
    try {
        const assignment = await assignRoutine(req.body);
        
        res.status(200).json({
            success: true,
            message: 'Rutina asignada exitosamente',
            data: assignment
        });
        
    } catch (error) {
        console.error('Error en POST /routines/assign:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al asignar rutina'
        });
    }
});

/**
 * GET /user/:userId
 * Obtener rutina activa del usuario
 */
app.get('/user/:userId', async (req, res) => {
    console.log('=== GET /routines/user/:userId ===');
    console.log('Params:', req.params);
    
    try {
        const { userId } = req.params;
        const routine = await getUserActiveRoutine(userId);
        
        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Usuario sin rutina asignada'
            });
        }
        
        res.status(200).json({
            success: true,
            data: routine
        });
        
    } catch (error) {
        console.error('Error en GET /routines/user/:userId:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener rutina activa'
        });
    }
});

/**
 * POST /progress
 * Registrar progreso en la rutina
 */
app.post('/progress', async (req, res) => {
    console.log('=== POST /routines/progress ===');
    console.log('Body:', req.body);
    
    try {
        // En producción, obtener userId del token de autenticación
        // Por ahora lo tomamos del body y lo removemos antes de validar
        const { userId, ...progressData } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId es requerido'
            });
        }
        
        // Pasar solo los datos de progreso (sin userId)
        const progress = await logProgress(userId, progressData);
        
        res.status(201).json({
            success: true,
            message: 'Progreso registrado exitosamente',
            data: progress
        });
        
    } catch (error) {
        console.error('Error en POST /routines/progress:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al registrar progreso'
        });
    }
});

// Exportar como Cloud Function
module.exports = functions.https.onRequest(app);