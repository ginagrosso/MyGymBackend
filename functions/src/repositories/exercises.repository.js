const { db } = require('../utils/firebase');

const createExerciseInDB = async (data) => {
    
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

const getExerciseDetailsFromDB = async (exerciseId) => {

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

const getExerciseByIdFromDB = async (exerciseId) => {

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
    
    const promises = exerciseIds.map(id => getExerciseByIdFromDB(id));
    const exercises = await Promise.all(promises);
    
    return exercises.filter(ex => ex !== null);
};

const getAllExercisesFromDB = async () => {

    
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

const updateExerciseInDB = async (exerciseId, data) => {;
    
    const updates = {
        ...data,
        updatedAt: Date.now()
    };
    
    await db.ref(`exercises/${exerciseId}`).update(updates);
    console.log(`Ejercicio actualizado`);
    
    return await getExerciseDetailsFromDB( exerciseId);
};

const archiveExerciseInDB = async (exerciseId) => {
    
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
    getAllExercisesFromDB,
    getExerciseDetailsFromDB
};