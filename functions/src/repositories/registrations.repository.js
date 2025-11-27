const { db } = require('../utils/firebase');


const createRegistrationInDB = async (data) => {
    const registrationRef = db.ref('registrations').push();
    
    const fullData = {
        ...data,
        id: registrationRef.key,
        status: 'active',
        createdAt: Date.now()
    };
    
    await registrationRef.set(fullData);
    return fullData;
};

const getUserActiveRegistrationsFromDB = async (userId) => {
    const snapshot = await db.ref('registrations')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
    
    const registrations = snapshot.val();
    
    if (!registrations) {
        return [];
    }
    
    return Object.entries(registrations)
        .filter(([_, reg]) => reg.status === 'active')
        .map(([key, value]) => ({ id: key, ...value }));
};

const getRegistrationDetailsFromDB = async (registrationId) => {
    const snapshot = await db.ref(`registrations/${registrationId}`).once('value');
    return snapshot.val();
};


const cancelRegistrationInDB = async (registrationId) => {
    await db.ref(`registrations/${registrationId}`).update({
        status: 'cancelled',
        cancelledAt: Date.now()
    });
    
    return { id: registrationId, status: 'cancelled' };
};

const getUserRegistrationHistoryFromDB = async (userId, limit = 50, offset = 0) => {
    const snapshot = await db.ref('registrations')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
    
    const registrations = snapshot.val();
    
    if (!registrations) {
        return [];
    }
    
    const allRegistrations = Object.entries(registrations)
        .map(([key, value]) => ({ id: key, ...value }))
        .sort((a, b) => b.createdAt - a.createdAt);
    
    return allRegistrations.slice(offset, offset + limit);
};

module.exports = {
    createRegistrationInDB,
    getUserActiveRegistrationsFromDB,
    getRegistrationDetailsFromDB,
    cancelRegistrationInDB,
    getUserRegistrationHistoryFromDB
};