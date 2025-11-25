// //source/repository/routines.repository.js
// Propósito: Manejar la creación y asignación de rutinas.
// 
// Importaciones: db (de ../utils/firebase).
// 
// Función createRoutineInDB(data):
// 
// Define const newRoutineRef = db.ref('routines').push().
// 
// Define fullData = { ...data, id: newRoutineRef.key, createdAt: Date.now(), isArchived: false }.
// 
// Usa newRoutineRef.set(fullData).
// 
// Devuelve fullData.
// 
// Función updateRoutineInDB(routineId, data):
// 
// Usa db.ref(routines/${routineId}).update(data). (Se usa para soft delete seteando isArchived: true).
// 
// Función assignRoutineToUserInDB(userId, routineId):
// 
// Usa db.ref(userRoutines/${userId}).set({ activeRoutineId: routineId }).
// 
// Función getUserActiveRoutineIdFromDB(userId):
// 
// Usa db.ref(userRoutines/${userId}/activeRoutineId).once('value').
// 
// Devuelve snapshot.val().
// 
// Función getRoutineDetailsFromDB(routineId):
// 
// Usa db.ref(routines/${routineId}).once('value').
// 
// Devuelve snapshot.val().
// 
// Exportar: Todas las funciones (createRoutineInDB, updateRoutineInDB, assignRoutineToUserInDB, getUserActiveRoutineIdFromDB, getRoutineDetailsFromDB).

const { db } = require('../utils/firebase');

// Crear una nueva rutina
const createRoutineInDB = async (data) => {
    console.log(`REPO. Creando rutina`);
    
    const newRoutineRef = db.ref('routines').push();
    const fullData = {
        ...data,
        id: newRoutineRef.key,
        createdAt: Date.now(),
        isArchived: false
    };
    
    await newRoutineRef.set(fullData);
    console.log(`Rutina creada con ID: ${newRoutineRef.key}`);
    return fullData;
};

// Actualizar una rutina (incluye soft delete)
const updateRoutineInDB = async (routineId, data) => {
    console.log(`REPO. Actualizando rutina ${routineId}`);
    
    await db.ref(`routines/${routineId}`).update(data);
    console.log(`Rutina actualizada`);
    
    return await getRoutineDetailsFromDB(routineId);
};

// Asignar rutina a un usuario
const assignRoutineToUserInDB = async (userId, routineId) => {
    console.log(`REPO. Asignando rutina ${routineId} al usuario ${userId}`);
    
    await db.ref(`userRoutines/${userId}`).set({
        activeRoutineId: routineId,
        assignedAt: Date.now()
    });
    
    console.log(`Rutina asignada exitosamente`);
    return { userId, routineId };
};

// Registrar progreso
const logProgressInDB = async (userId, routineId, progressData) => {
    console.log(`REPO. Registrando progreso para usuario ${userId}`);
    
    const dateString = new Date().toISOString().split('T')[0];
    const progressRef = db.ref(`progress/${userId}/${dateString}`).push();
    
    const fullData = {
        id: progressRef.key,
        userId,
        routineId,
        ...progressData,
        timestamp: Date.now(),
        date: dateString
    };
    
    await progressRef.set(fullData);
    console.log(`Progreso registrado con ID: ${progressRef.key}`);
    return fullData;
};

// Obtener ID de rutina activa de un usuario
const getUserActiveRoutineIdFromDB = async (userId) => {
    console.log(`REPO. Obteniendo rutina activa del usuario ${userId}`);
    
    const snapshot = await db.ref(`userRoutines/${userId}/activeRoutineId`).once('value');
    const routineId = snapshot.val();
    
    return routineId;
};

// Obtener detalles de una rutina
const getRoutineDetailsFromDB = async (routineId) => {
    console.log(`REPO. Obteniendo detalles de la rutina ${routineId}`);
    
    const snapshot = await db.ref(`routines/${routineId}`).once('value');
    const routine = snapshot.val();
    
    console.log(`Rutina encontrada:`, routine);
    return routine;
};

module.exports = {
    createRoutineInDB,
    updateRoutineInDB,
    assignRoutineToUserInDB,
    getUserActiveRoutineIdFromDB,
    getRoutineDetailsFromDB,
    logProgressInDB
};