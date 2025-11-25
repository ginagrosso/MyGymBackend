//source/repository/memberships.repository.jsPropósito: Manejar la relación entre gimnasios y socios (miembros).
// Importaciones: db (de ../utils/firebase).Función addMemberToGymInDB(gymId, userId, data):
// Define fullData = { ...data, userId, addedAt: Date.now(), isActive: true }.
// Define const p1 = db.ref(gymMembers/${gymId}/${userId}).set(fullData).
// Define const p2 = db.ref(userMemberships/${userId}/${gymId}).set(true).Usa return Promise.all([p1, p2]).
// Función updateMembershipInDB(gymId, userId, data):Usa db.ref(gymMembers/${gymId}/${userId}).update(data). 
// (Se usa para el soft delete seteando isActive: false).Función getMembersByGymFromDB(gymId):
// Usa db.ref(gymMembers/${gymId}).orderByChild('isActive').equalTo(true).once('value').Devuelve snapshot.val(). 
// (Esto filtra automáticamente los socios eliminados).Exportar: 
// Todas las funciones (addMemberToGymInDB, updateMembershipInDB, getMembersByGymFromDB).

const { db } = require('../utils/firebase');

/**
 * Crear inscripción
 */
const createRegistrationInDB = async (data) => {
    const registrationRef = db.ref('registrations').push();
    
    const fullData = {
        ...data,
        id: registrationRef.key,
        status: 'active', // active, cancelled, completed
        createdAt: Date.now()
    };
    
    await registrationRef.set(fullData);
    return fullData;
};

/**
 * Obtener inscripciones activas de un usuario
 */
const getUserActiveRegistrationsFromDB = async (userId) => {
    const snapshot = await db.ref('registrations')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
    
    const registrations = snapshot.val();
    
    if (!registrations) {
        return [];
    }
    
    // Filtrar solo las activas
    return Object.entries(registrations)
        .filter(([_, reg]) => reg.status === 'active')
        .map(([key, value]) => ({ id: key, ...value }));
};

/**
 * Obtener detalles de una inscripción
 */
const getRegistrationDetailsFromDB = async (registrationId) => {
    const snapshot = await db.ref(`registrations/${registrationId}`).once('value');
    return snapshot.val();
};

/**
 * Cancelar inscripción (soft delete)
 */
const cancelRegistrationInDB = async (registrationId) => {
    await db.ref(`registrations/${registrationId}`).update({
        status: 'cancelled',
        cancelledAt: Date.now()
    });
    
    return { id: registrationId, status: 'cancelled' };
};

/**
 * Obtener historial de inscripciones de un usuario
 */
const getUserRegistrationHistoryFromDB = async (userId, limit = 50, offset = 0) => {
    const snapshot = await db.ref('registrations')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
    
    const registrations = snapshot.val();
    
    if (!registrations) {
        return [];
    }
    
    // Convertir a array, ordenar por fecha y aplicar paginación
    const allRegistrations = Object.entries(registrations)
        .map(([key, value]) => ({ id: key, ...value }))
        .sort((a, b) => b.createdAt - a.createdAt);
    
    return allRegistrations.slice(offset, offset + limit);
};

/**
 * Verificar si usuario ya está inscrito en una clase específica
 */
const isUserRegisteredInClass = async (userId, classId) => {
    const snapshot = await db.ref('registrations')
        .orderByChild('userId')
        .equalTo(userId)
        .once('value');
    
    const registrations = snapshot.val();
    
    if (!registrations) {
        return false;
    }
    
    // Verificar si hay alguna inscripción activa para esta clase
    return Object.values(registrations).some(
        reg => reg.classId === classId && reg.status === 'active'
    );
};

module.exports = {
    createRegistrationInDB,
    getUserActiveRegistrationsFromDB,
    getRegistrationDetailsFromDB,
    cancelRegistrationInDB,
    getUserRegistrationHistoryFromDB,
    isUserRegisteredInClass
};