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

// Crear un ejercicio
const createExerciseInDB = async (data) => {
    console.log(`REPO. Creando ejercicio: ${data.nombre}`);
    
    const newExerciseRef = db.ref('exercises').push();
    const exerciseId = newExerciseRef.key;
    
    const fullData = {
        ...data,
        exerciseId,
        createdAt: Date.now(),
        isActive: true
    };
    
    await newExerciseRef.set(fullData);
    console.log(`Ejercicio creado con ID: ${exerciseId}`);
    
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

// Obtener un ejercicio por ID
const getExerciseByIdFromDB = async (exerciseId) => {
    console.log(`REPO. Buscando ejercicio ${exerciseId}`);
    
    const snapshot = await db.ref(`exercises/${exerciseId}`).once('value');
    const exercise = snapshot.val();
    
    if (!exercise) {
        return null;
    }
    
    return {
        exerciseId,
        ...exercise
    };
};

// Obtener múltiples ejercicios por IDs
const getExercisesByIdsFromDB = async (exerciseIds) => {
    console.log(`REPO. Buscando ${exerciseIds.length} ejercicios`);
    
    const promises = exerciseIds.map(id => getExerciseByIdFromDB(id));
    const exercises = await Promise.all(promises);
    
    return exercises.filter(ex => ex !== null);
};

// Obtener todos los ejercicios
const getAllExercisesFromDB = async () => {
    console.log('REPO. Obteniendo todos los ejercicios');
    
    const snapshot = await db.ref('exercises').once('value');
    const exercises = snapshot.val();
    
    if (!exercises) {
        return [];
    }
    
    return Object.keys(exercises).map(key => ({
        exerciseId: key,
        ...exercises[key]
    }));
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
    createExerciseInDB,
    getGymExercisesFromDB,
    updateExerciseInDB,
    archiveExerciseInDB,
    getExerciseByIdFromDB,
    getExercisesByIdsFromDB,
    getAllExercisesFromDB
};