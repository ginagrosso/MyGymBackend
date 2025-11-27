const { db } = require('../utils/firebase');

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

const getExercisesByIdsFromDB = async (exerciseIds) => {
    console.log(`REPO. Buscando ${exerciseIds.length} ejercicios`);
    
    const promises = exerciseIds.map(id => getExerciseByIdFromDB(id));
    const exercises = await Promise.all(promises);
    
    return exercises.filter(ex => ex !== null);
};

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
    updateExerciseInDB,
    archiveExerciseInDB,
    getExerciseByIdFromDB,
    getExercisesByIdsFromDB,
    getAllExercisesFromDB
};