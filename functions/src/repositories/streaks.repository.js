//source/repository/streaks.repository.js
// Propósito: Registrar y leer los check-ins de asistencia.Importaciones: db (de ../utils/firebase).
// Función createCheckInInDB(userId, dateString):Usa db.ref(checkIns/${userId}/${dateString}).set(true). (El dateString debe ser formato YYYY-MM-DD).
// Función getAllUserCheckInsFromDB(userId):Usa db.ref(checkIns/${userId}).orderByKey().once('value'). (Ordena por fecha).Devuelve snapshot.val().
// Exportar: { createCheckInInDB, getAllUserCheckInsFromDB }.

const { db } = require('../utils/firebase');

// Registrar un check-in de asistencia
const createCheckInInDB = async (userId, dateString) => {
    console.log(`REPO. Registrando check-in para usuario ${userId} en fecha ${dateString}`);
    
    await db.ref(`checkIns/${userId}/${dateString}`).set({
        timestamp: Date.now(),
        date: dateString
    });
    
    console.log(`Check-in registrado exitosamente`);
    return { userId, dateString, timestamp: Date.now() };
};

// Obtener todos los check-ins de un usuario
const getAllUserCheckInsFromDB = async (userId) => {
    console.log(`REPO. Obteniendo check-ins del usuario ${userId}`);
    
    const checkInsRef = db.ref(`checkIns/${userId}`);
    const snapshot = await checkInsRef.orderByKey().once('value');
    
    const checkIns = snapshot.val();
    return checkIns || {};
};

module.exports = {
    createCheckInInDB,
    getAllUserCheckInsFromDB
};