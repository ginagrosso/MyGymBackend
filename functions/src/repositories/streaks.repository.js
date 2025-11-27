const { db } = require('../utils/firebase');

const createCheckInInDB = async (userId, dateString) => {
    console.log(`REPO. Registrando check-in para usuario ${userId} en fecha ${dateString}`);
    
    await db.ref(`checkIns/${userId}/${dateString}`).set({
        timestamp: Date.now(),
        date: dateString
    });
    
    console.log(`Check-in registrado exitosamente`);
    return { userId, dateString, timestamp: Date.now() };
};

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