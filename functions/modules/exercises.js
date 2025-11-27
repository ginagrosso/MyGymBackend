const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { createExercise } = require('../src/services/exercises/createExercise.service');
const { getGymExercises, getExerciseDetails, getExerciseById, getAllExercises } = require('../src/services/exercises/readExercise.service');
const { updateExercise, archiveExercise } = require('../src/services/exercises/updateExercise.service');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');

const app = express();

app.use(cors({
    origin:'https://ginagrosso.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

/**
 * POST /create
 * Crear ejercicio personalizado
 */
app.post('/create', validateFirebaseIdToken, async (req, res) => {
    console.log('=== POST /exercises/create ===');
    console.log('Body recibido:', req.body);
    
    try {
        const exercise = await createExercise(req.body);
        
        res.status(201).json({
            success: true,
            message: 'Ejercicio creado exitosamente',
            data: exercise
        });
        
    } catch (error) {
        console.error('Error en POST /exercises/create:', error);
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || 'Error al crear ejercicio'
        });
    }
});

/**
 * 🆕 GET /
 * Obtener todos los ejercicios (global)
 */
app.get('/', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /exercises ===');
    
    try {
        const exercises = await getAllExercises();
        
        res.status(200).json({
            success: true,
            data: exercises
        });
        
    } catch (error) {
        console.error('Error en GET /exercises:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener ejercicios'
        });
    }
});

/**
 * 🆕 GET /:exerciseId
 * Obtener un ejercicio por ID (global)
 */
app.get('/:exerciseId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /exercises/:exerciseId ===');
    console.log('Params:', req.params);
    
    try {
        const exercise = await getExerciseById(req.params.exerciseId);
        
        res.status(200).json({
            success: true,
            data: exercise
        });
        
    } catch (error) {
        console.error('Error en GET /exercises/:exerciseId:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Error al obtener ejercicio'
        });
    }
});

/**
 * GET /gym/:gymId
 * Obtener todos los ejercicios de un gym
 */
app.get('/gym/:gymId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /exercises/gym/:gymId ===');
    
    try {
        const exercises = await getGymExercises(req.params.gymId);
        
        res.status(200).json({
            success: true,
            data: exercises
        });
        
    } catch (error) {
        console.error('Error en GET /exercises/gym/:gymId:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener ejercicios del gym'
        });
    }
});

/**
 * GET /gym/:gymId/:exerciseId
 * Obtener detalles de un ejercicio específico del gym
 */
app.get('/gym/:gymId/:exerciseId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /exercises/gym/:gymId/:exerciseId ===');
    
    try {
        const exercise = await getExerciseDetails(req.params.gymId, req.params.exerciseId);
        
        res.status(200).json({
            success: true,
            data: exercise
        });
        
    } catch (error) {
        console.error('Error en GET /exercises/gym/:gymId/:exerciseId:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Error al obtener ejercicio'
        });
    }
});

/**
 * PUT /gym/:gymId/:exerciseId
 * Actualizar ejercicio
 */
app.put('/gym/:gymId/:exerciseId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== PUT /exercises/gym/:gymId/:exerciseId ===');
    
    try {
        const exercise = await updateExercise(req.params.gymId, req.params.exerciseId, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Ejercicio actualizado exitosamente',
            data: exercise
        });
        
    } catch (error) {
        console.error('Error en PUT /exercises:', error);
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || 'Error al actualizar ejercicio'
        });
    }
});

/**
 * DELETE /gym/:gymId/:exerciseId
 * Archivar ejercicio (soft delete)
 */
app.delete('/gym/:gymId/:exerciseId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== DELETE /exercises/gym/:gymId/:exerciseId ===');
    
    try {
        await archiveExercise(req.params.gymId, req.params.exerciseId);
        
        res.status(200).json({
            success: true,
            message: 'Ejercicio archivado exitosamente'
        });
        
    } catch (error) {
        console.error('Error en DELETE /exercises:', error);
        res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || 'Error al archivar ejercicio'
        });
    }
});

// Exportar como Cloud Function
module.exports = functions.https.onRequest(app);