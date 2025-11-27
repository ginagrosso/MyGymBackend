const registrationsRepository = require('../../repositories/registrations.repository');

const getUserActiveRegistrations = async (userId) => {
    try {
        if (!userId) {
            throw new Error('userId es requerido');
        }
        
        const registrations = await registrationsRepository.getUserActiveRegistrationsFromDB(userId);
        
        return registrations;
        
    } catch (error) {
        throw error;
    }
};

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