const { db } = require('../utils/firebase');
const { cleanObject } = require('../utils/removeUndefined');


const createRoutineInDB = async (data) => {
    console.log('REPO. Creando rutina en DB');
    
    const newRoutineRef = db.ref('routines').push();
    const routineId = newRoutineRef.key;
    
    const cleanedData = cleanObject(data);
    
    const fullData = {
        ...cleanedData,
        id: routineId,
        createdAt: Date.now(),
        isArchived: false
    };
    
    await newRoutineRef.set(fullData);
    
    console.log(`REPO. Rutina creada con ID: ${routineId}`);
    
    return fullData;
};

const updateRoutineInDB = async (routineId, data) => {
    console.log(`REPO. Actualizando rutina ${routineId}`);
    
    const cleanedData = cleanObject(data);
    
    await db.ref(`routines/${routineId}`).update(cleanedData);
    
    console.log(`REPO. Rutina actualizada`);
};

const getRoutineDetailsFromDB = async (routineId) => {
    console.log(`REPO. Obteniendo rutina ${routineId}`);
    
    const snapshot = await db.ref(`routines/${routineId}`).once('value');
    const routine = snapshot.val();
    
    if (!routine) {
        return null;
    }
    
    return routine;
};

const getUserActiveRoutineIdFromDB = async (userId) => {
    console.log(`REPO. Obteniendo rutina activa del usuario ${userId}`);
    
    const snapshot = await db.ref(`userRoutines/${userId}/activeRoutineId`).once('value');
    const routineId = snapshot.val();
    
    return routineId;
};

const assignRoutineToUserInDB = async (userId, routineId) => {
    console.log(`REPO. Asignando rutina ${routineId} al usuario ${userId}`);
    
    await db.ref(`userRoutines/${userId}`).set({
        activeRoutineId: routineId,
        assignedAt: Date.now()
    });
    
    console.log(`REPO. Rutina asignada exitosamente`);
};

const saveProgressInDB = async (progressData) => {
    console.log('REPO. Guardando progreso en DB');
    
    const { userId, routineId, date } = progressData;
    
    const progressRef = db.ref(`progress/${userId}/${routineId}/${date}`);
    
    const cleanedData = cleanObject(progressData);
    
    await progressRef.set(cleanedData);
    
    console.log(`REPO. Progreso guardado en progress/${userId}/${routineId}/${date}`);
    
    return {
        progressId: `${userId}_${routineId}_${date}`,
        ...cleanedData
    };
};

module.exports = {
    createRoutineInDB,
    updateRoutineInDB,
    getRoutineDetailsFromDB,
    getUserActiveRoutineIdFromDB,
    assignRoutineToUserInDB,
    saveProgressInDB
};