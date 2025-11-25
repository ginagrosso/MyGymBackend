const registrationsRepository = require('../../repositories/registrations.repository');

/**
 * Cancelar inscripción
 */
const cancelRegistration = async (registrationId) => {
    try {
        if (!registrationId) {
            throw new Error('registrationId es requerido');
        }
        
        // Verificar que la inscripción existe
        const registration = await registrationsRepository.getRegistrationDetailsFromDB(registrationId);
        
        if (!registration) {
            throw new Error('Inscripción no encontrada');
        }
        
        if (registration.status === 'cancelled') {
            throw new Error('Esta inscripción ya fue cancelada');
        }
        
        // Cancelar inscripción
        const result = await registrationsRepository.cancelRegistrationInDB(registrationId);
        
        // TODO: Decrementar contador de inscriptos en la clase
        // await classesRepository.decrementClassRegistrations(registration.classId);
        
        return result;
        
    } catch (error) {
        throw error;
    }
};

module.exports = { cancelRegistration };