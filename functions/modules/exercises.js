const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const { createExercise } = require('../src/services/exercises/createExercise.service');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const {getExerciseById, getAllExercises } = require('../src/services/exercises/readExercise.service');
const { updateExercise, archiveExercise } = require('../src/services/exercises/updateExercise.service');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');

const app = express();

app.use(cors({
    origin:'https://ginagrosso.github.io',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/', validateFirebaseIdToken, async (req, res) => {
    try {
        const exercises = await getAllExercises();
        res.status(200).json(getSuccessResponseObject(exercises));
    } catch (error) {
        console.error('Error en GET /exercises:', error);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.post('/create', validateFirebaseIdToken, async (req, res) => {
    try {
        const exercise = await createExercise(req.body);
        res.status(201).json(getSuccessResponseObject(exercise, 'Ejercicio creado exitosamente'));
    } catch (error) {
        console.error('Error en POST /exercises/create:', error);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});


app.get('/:exerciseId', validateFirebaseIdToken, async (req, res) => {
    try {
        const exercise = await getExerciseById(req.params.exerciseId);
        res.status(200).json(getSuccessResponseObject(exercise));
    } catch (error) {
        console.error('Error en GET /exercises/:exerciseId:', error);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 404).json(errorResponse);
    }
});


app.put('/:exerciseId', validateFirebaseIdToken, async (req, res) => {
    try {
        const exercise = await updateExercise(req.params.exerciseId, req.body);
        res.status(200).json(getSuccessResponseObject(exercise, 'Ejercicio actualizado exitosamente'));
    } catch (error) {
        console.error('Error en PUT /exercises:', error);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});


app.delete('/:exerciseId', validateFirebaseIdToken, async (req, res) => {
    try {
        await archiveExercise(req.params.exerciseId);
        res.status(200).json(getSuccessResponseObject(null, 'Ejercicio archivado exitosamente'));
    } catch (error) {
        console.error('Error en DELETE /exercises:', error);
        const errorResponse = getErrorResponseObject(error);
        res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

module.exports = functions.https.onRequest(app);