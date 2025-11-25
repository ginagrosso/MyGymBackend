////source/repository/exercises.repository.js
//Propósito: Manejar los ejercicios personalizados del gimnasio.
//
//Importaciones: db (de ../utils/firebase).
//
//Función createCustomExerciseInDB(gymId, data):
//
//Define const newExRef = db.ref(customExercises/${gymId}).push().
//
//Define fullData = { ...data, id: newExRef.key, isArchived: false }.
//
//Usa newExRef.set(fullData).
//
//Devuelve fullData.
//
//Función getCustomExercisesFromDB(gymId):
//
//Usa db.ref(customExercises/${gymId}).orderByChild('isArchived').equalTo(false).once('value').
//
//Devuelve snapshot.val().
//
//Exportar: { createCustomExerciseInDB, getCustomExercisesFromDB }.

const { db } = require('../utils/firebase');

// Crear un ejercicio personalizado
const createCustomExerciseInDB = async (gymId, data) => {
    console.log(`REPO. Creando ejercicio personalizado para gym ${gymId}`);
    
    const newExerciseRef = db.ref(`customExercises/${gymId}`).push();
    const fullData = {
        ...data,
        id: newExerciseRef.key,
        gymId,
        createdAt: Date.now(),
        isArchived: false
    };
    
    await newExerciseRef.set(fullData);
    console.log(`Ejercicio creado con ID: ${newExerciseRef.key}`);
    return fullData;
};

// Obtener todos los ejercicios de un gym
const getGymExercisesFromDB = async (gymId) => {
    console.log(`REPO. Obteniendo ejercicios del gym ${gymId}`);
    
     try {
        const snapshot = await db.ref(`customExercises/${gymId}`)
            .orderByChild('isArchived')
            .equalTo(false)
            .once('value');
        
        const exercises = snapshot.val();
        return exercises || {};
        
    } catch (error) {
        console.error(`REPO. Error obteniendo ejercicios:`, error.message);
        throw error;
    }
};

// Obtener detalles de un ejercicio específico
const getExerciseDetailsFromDB = async (gymId, exerciseId) => {
    console.log(`REPO. Obteniendo detalles del ejercicio ${exerciseId}`);
    
    const snapshot = await db.ref(`customExercises/${gymId}/${exerciseId}`).once('value');
    const exercise = snapshot.val();
    
    if (!exercise) {
        throw new Error('Ejercicio no encontrado');
    }
    
    return exercise;
};

// Actualizar un ejercicio
const updateExerciseInDB = async (gymId, exerciseId, data) => {
    console.log(`REPO. Actualizando ejercicio ${exerciseId}`);
    
    const updates = {
        ...data,
        updatedAt: Date.now()
    };
    
    await db.ref(`customExercises/${gymId}/${exerciseId}`).update(updates);
    console.log(`Ejercicio actualizado`);
    
    return await getExerciseDetailsFromDB(gymId, exerciseId);
};

// Archivar ejercicio (soft delete)
const archiveExerciseInDB = async (gymId, exerciseId) => {
    console.log(`REPO. Archivando ejercicio ${exerciseId}`);
    
    await db.ref(`customExercises/${gymId}/${exerciseId}`).update({
        isArchived: true,
        archivedAt: Date.now()
    });
    
    console.log(`Ejercicio archivado`);
    return { success: true, exerciseId };
};

module.exports = {
    createCustomExerciseInDB,
    getGymExercisesFromDB,
    getExerciseDetailsFromDB,
    updateExerciseInDB,
    archiveExerciseInDB
};