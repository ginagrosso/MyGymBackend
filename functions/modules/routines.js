const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { createRoutine } = require('../src/services/routines/createRoutine.service');
const { getRoutineDetails, getUserActiveRoutine } = require('../src/services/routines/readRoutine.service');
const { updateRoutine, archiveRoutine } = require('../src/services/routines/updateRoutine.service');
const { assignRoutine } = require('../src/services/routines/assignRoutine.service');
const { logProgress } = require('../src/services/routines/logProgress.service');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');

const app = express();


app.use(cors({
    origin:'https://ginagrosso.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.post('/create', validateFirebaseIdToken, async (req, res) => {
    console.log('=== POST /routines ===');
    console.log('Body recibido:', req.body);
    try {
        const routine = await createRoutine(req.body);
        res.status(201).json(getSuccessResponseObject(routine, 'Rutina creada exitosamente'));
    } catch (error) {
        console.error('Error en POST /routines:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

app.get('/:routineId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /routines/:routineId ===');
    console.log('Params:', req.params);
    try {
        const { routineId } = req.params;
        const routine = await getRoutineDetails(routineId);
        res.status(200).json(getSuccessResponseObject(routine));
    } catch (error) {
        console.error('Error en GET /routines/:routineId:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 404).json(errorResponse);
    }
});

app.put('/:routineId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== PUT /routines/:routineId ===');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    try {
        const { routineId } = req.params;
        const updatedRoutine = await updateRoutine(routineId, req.body);
        res.status(200).json(getSuccessResponseObject(updatedRoutine, 'Rutina actualizada exitosamente'));
    } catch (error) {
        console.error('Error en PUT /routines/:routineId:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

app.delete('/:routineId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== DELETE /routines/:routineId ===');
    console.log('Params:', req.params);
    try {
        const { routineId } = req.params;
        const result = await archiveRoutine(routineId);
        res.status(200).json(getSuccessResponseObject(result, 'Rutina archivada exitosamente'));
    } catch (error) {
        console.error('Error en DELETE /routines/:routineId:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

app.post('/assign', validateFirebaseIdToken, async (req, res) => {
    console.log('=== POST /routines/assign ===');
    console.log('Body:', req.body);
    try {
        const assignment = await assignRoutine(req.body);
        res.status(200).json(getSuccessResponseObject(assignment, 'Rutina asignada exitosamente'));
    } catch (error) {
        console.error('Error en POST /routines/assign:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

app.get('/user/:userId', validateFirebaseIdToken, async (req, res) => {
    console.log('=== GET /routines/user/:userId ===');
    console.log('Params:', req.params);
    try {
        const { userId } = req.params;
        const routine = await getUserActiveRoutine(userId);
        if (!routine) {
            const error = new Error('Usuario sin rutina asignada');
            const errorResponse = getErrorResponseObject(error);
            return res.status(errorResponse.statusCode || 404).json(errorResponse);
        }
        res.status(200).json(getSuccessResponseObject(routine));
    } catch (error) {
        console.error('Error en GET /routines/user/:userId:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});


app.post('/progress', validateFirebaseIdToken, async (req, res) => {
    try {
        const { userId, ...progressData } = req.body;
        if (!userId) {
            const error = new Error('userId es requerido');
            const errorResponse = getErrorResponseObject(error);
            return res.status(errorResponse.statusCode || 400).json(errorResponse);
        }
        const progress = await logProgress(userId, progressData);
        res.status(201).json(getSuccessResponseObject(progress, 'Progreso registrado exitosamente'));
    } catch (error) {
        console.error('Error en POST /routines/progress:', error.message);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

module.exports = functions.https.onRequest(app);