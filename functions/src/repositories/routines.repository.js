const { db } = require('../utils/firebase');

// 🆕 Helper para remover undefined/null recursivamente
const cleanObject = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(item => cleanObject(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            const value = obj[key];
            if (value !== undefined && value !== null) {
                cleaned[key] = cleanObject(value);
            }
        }
        return cleaned;
    }
    
    return obj;
};

// Crear rutina en DB
const createRoutineInDB = async (data) => {
    console.log('REPO. Creando rutina en DB');
    
    const newRoutineRef = db.ref('routines').push();
    const routineId = newRoutineRef.key;
    
    // 🔥 Limpiar undefined antes de guardar
    const cleanedData = cleanObject(data);
    
    const fullData = {
        ...cleanedData,
        id: routineId,
        createdAt: Date.now(),
        isArchived: false
    };
    
    console.log('Datos limpios a guardar:', JSON.stringify(fullData, null, 2));
    
    await newRoutineRef.set(fullData);
    
    console.log(`REPO. Rutina creada con ID: ${routineId}`);
    
    return fullData;
};

// Actualizar rutina en DB
const updateRoutineInDB = async (routineId, data) => {
    console.log(`REPO. Actualizando rutina ${routineId}`);
    
    // 🔥 Limpiar undefined antes de actualizar
    const cleanedData = cleanObject(data);
    
    await db.ref(`routines/${routineId}`).update(cleanedData);
    
    console.log(`REPO. Rutina actualizada`);
};

// Obtener detalles de rutina
const getRoutineDetailsFromDB = async (routineId) => {
    console.log(`REPO. Obteniendo rutina ${routineId}`);
    
    const snapshot = await db.ref(`routines/${routineId}`).once('value');
    const routine = snapshot.val();
    
    if (!routine) {
        return null;
    }
    
    return routine;
};

// Obtener ID de rutina activa del usuario
const getUserActiveRoutineIdFromDB = async (userId) => {
    console.log(`REPO. Obteniendo rutina activa del usuario ${userId}`);
    
    const snapshot = await db.ref(`userRoutines/${userId}/activeRoutineId`).once('value');
    const routineId = snapshot.val();
    
    return routineId;
};

// Asignar rutina a usuario
const assignRoutineToUserInDB = async (userId, routineId) => {
    console.log(`REPO. Asignando rutina ${routineId} al usuario ${userId}`);
    
    await db.ref(`userRoutines/${userId}`).set({
        activeRoutineId: routineId,
        assignedAt: Date.now()
    });
    
    console.log(`REPO. Rutina asignada exitosamente`);
};

module.exports = {
    createRoutineInDB,
    updateRoutineInDB,
    getRoutineDetailsFromDB,
    getUserActiveRoutineIdFromDB,
    assignRoutineToUserInDB
};