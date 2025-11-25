const registrationsRepository = require('../../repositories/registrations.repository');

/**
 * Obtener inscripciones activas del usuario
 */
const getUserActiveRegistrations = async (userId) => {
    try {
        if (!userId) {
            throw new Error('userId es requerido');
        }
        
        const registrations = await registrationsRepository.getUserActiveRegistrationsFromDB(userId);
        
        // TODO: Enriquecer con datos de la clase
        // Para cada inscripción, obtener detalles de la clase desde Dominio 2
        
        return registrations;
        
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener detalles de una inscripción
 */
const getRegistrationDetails = async (registrationId) => {
    try {
        if (!registrationId) {
            throw new Error('registrationId es requerido');
        }
        
        const registration = await registrationsRepository.getRegistrationDetailsFromDB(registrationId);
        
        if (!registration) {
            throw new Error('Inscripción no encontrada');
        }
        
        return { id: registrationId, ...registration };
        
    } catch (error) {
        throw error;
    }
};

/**
 * Obtener historial de inscripciones
 */
const getUserRegistrationHistory = async (userId, limit = 50, offset = 0) => {
    try {
        if (!userId) {
            throw new Error('userId es requerido');
        }
        
        const history = await registrationsRepository.getUserRegistrationHistoryFromDB(
            userId,
            limit,
            offset
        );
        
        return history;
        
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getUserActiveRegistrations,
    getRegistrationDetails,
    getUserRegistrationHistory
};