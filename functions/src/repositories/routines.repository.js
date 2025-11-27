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
    
    return fullData;
};

const updateRoutineInDB = async (routineId, data) => {
    
    const cleanedData = cleanObject(data);
    
    await db.ref(`routines/${routineId}`).update(cleanedData);
    
};

const getRoutineDetailsFromDB = async (routineId) => {
    
    const snapshot = await db.ref(`routines/${routineId}`).once('value');
    const routine = snapshot.val();
    
    if (!routine) {
        return null;
    }
    
    return routine;
};

const getUserActiveRoutineIdFromDB = async (userId) => {
    
    const snapshot = await db.ref(`userRoutines/${userId}/activeRoutineId`).once('value');
    const routineId = snapshot.val();
    
    return routineId;
};

const assignRoutineToUserInDB = async (userId, routineId) => {
    
    await db.ref(`userRoutines/${userId}`).set({
        activeRoutineId: routineId,
        assignedAt: Date.now()
    });
    
};

const saveProgressInDB = async (progressData) => {
    
    const { userId, routineId, date } = progressData;
    
    const progressRef = db.ref(`progress/${userId}/${routineId}/${date}`);
    
    const cleanedData = cleanObject(progressData);
    
    await progressRef.set(cleanedData);
    
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