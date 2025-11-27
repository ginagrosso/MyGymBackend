const registrationsRepository = require('../../repositories/registrations.repository');

const cancelRegistration = async (registrationId) => {
    try {
        if (!registrationId) {
            throw new Error('registrationId es requerido');
        }
        
        const registration = await registrationsRepository.getRegistrationDetailsFromDB(registrationId);
        
        if (!registration) {
            throw new Error('Inscripción no encontrada');
        }
        
        if (registration.status === 'cancelled') {
            throw new Error('Esta inscripción ya fue cancelada');
        }
        
        const result = await registrationsRepository.cancelRegistrationInDB(registrationId);
         
        return result;
        
    } catch (error) {
        throw error;
    }
};

module.exports = { cancelRegistration };