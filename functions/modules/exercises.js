//functions/modules/exercises.js
//Importar express, cors, y el pasamano exerciseService.
//Crear la app de Express: const app = express();.
//Endpoint GET /external: (Proxy para ExRxAPI.ts y ExerciseAPI.ts) Llama a exerciseService.getExternalExercises(req.query).
//Endpoint POST /custom: (Para que el gym cree ejercicios) Llama a exerciseService.createCustomExercise(req.body).
//Endpoint GET /custom/:gymId: (Para biblioteca-ejercicios.tsx) Llama a exerciseService.getCustomExercises(req.params.gymId).
//Exportar app.

const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { createCustomExercise } = require('../src/services/exercises/createExercise.service');
const { getGymExercises, getExerciseDetails } = require('../src/services/exercises/readExercise.service');
const { updateExercise, archiveExercise } = require('../src/services/exercises/updateExercise.service');

const app = express();

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());

/**
 * POST /
 * Crear ejercicio personalizado
 */
app.post('/', async (req, res) => {
    console.log('=== POST /exercises ===');
    console.log('Body recibido:', req.body);
    
    try {
        const { gymId, ...exerciseData } = req.body;
        
        if (!gymId) {
            return res.status(400).json({
                success: false,
                message: 'El gymId es requerido'
            });
        }
        
        const exercise = await createCustomExercise(gymId, exerciseData);
        
        res.status(201).json({
            success: true,
            message: 'Ejercicio creado exitosamente',
            data: exercise
        });
        
    } catch (error) {
        console.error('Error en POST /exercises:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al crear ejercicio'
        });
    }
});

/**
 * GET /gym/:gymId
 * Obtener todos los ejercicios de un gym
 */
app.get('/gym/:gymId', async (req, res) => {
    console.log('=== GET /exercises/gym/:gymId ===');
    console.log('Params:', req.params);
    
    try {
        const { gymId } = req.params;
        const exercises = await getGymExercises(gymId);
        
        res.status(200).json({
            success: true,
            data: exercises,
            count: exercises.length
        });
        
    } catch (error) {
        console.error('Error en GET /exercises/gym/:gymId:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al obtener ejercicios'
        });
    }
});

/**
 * GET /:gymId/:exerciseId
 * Obtener detalles de un ejercicio específico
 */
app.get('/:gymId/:exerciseId', async (req, res) => {
    console.log('=== GET /exercises/:gymId/:exerciseId ===');
    console.log('Params:', req.params);
    
    try {
        const { gymId, exerciseId } = req.params;
        const exercise = await getExerciseDetails(gymId, exerciseId);
        
        res.status(200).json({
            success: true,
            data: exercise
        });
        
    } catch (error) {
        console.error('Error en GET /exercises/:gymId/:exerciseId:', error.message);
        res.status(404).json({
            success: false,
            message: error.message || 'Error al obtener ejercicio'
        });
    }
});

/**
 * PUT /:gymId/:exerciseId
 * Actualizar ejercicio
 */
app.put('/:gymId/:exerciseId', async (req, res) => {
    console.log('=== PUT /exercises/:gymId/:exerciseId ===');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    try {
        const { gymId, exerciseId } = req.params;
        const updatedExercise = await updateExercise(gymId, exerciseId, req.body);
        
        res.status(200).json({
            success: true,
            message: 'Ejercicio actualizado exitosamente',
            data: updatedExercise
        });
        
    } catch (error) {
        console.error('Error en PUT /exercises/:gymId/:exerciseId:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar ejercicio'
        });
    }
});

/**
 * DELETE /:gymId/:exerciseId
 * Archivar ejercicio (soft delete)
 */
app.delete('/:gymId/:exerciseId', async (req, res) => {
    console.log('=== DELETE /exercises/:gymId/:exerciseId ===');
    console.log('Params:', req.params);
    
    try {
        const { gymId, exerciseId } = req.params;
        const result = await archiveExercise(gymId, exerciseId);
        
        res.status(200).json({
            success: true,
            message: 'Ejercicio archivado exitosamente',
            data: result
        });
        
    } catch (error) {
        console.error('Error en DELETE /exercises/:gymId/:exerciseId:', error.message);
        res.status(400).json({
            success: false,
            message: error.message || 'Error al archivar ejercicio'
        });
    }
});

// Exportar como Cloud Function
module.exports = functions.https.onRequest(app);