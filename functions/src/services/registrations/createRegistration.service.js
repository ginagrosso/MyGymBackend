const registrationsRepository = require('../../repositories/registrations.repository');
const { createRegistrationSchema } = require('../../schemas/registration.schema');

/**
 * Crear inscripción a una clase
 */
const createRegistration = async (data) => {
    try {
        // Validar datos
        const { error, value } = createRegistrationSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        // Verificar que el usuario no esté ya inscrito en esta clase
        const isRegistered = await registrationsRepository.isUserRegisteredInClass(
            value.userId,
            value.classId
        );
        
        if (isRegistered) {
            throw new Error('Ya estás inscrito en esta clase');
        }
        
        // TODO: Verificar que la clase existe y tiene cupo disponible
        // Esto requiere coordinación con Dominio 2 (Victor - Classes)
        // const classData = await classesRepository.getClassById(value.classId);
        // if (!classData) throw new Error('Clase no encontrada');
        // if (classData.inscriptos >= classData.cupoMaximo) throw new Error('Clase sin cupo');
        
        // Crear inscripción
        const registration = await registrationsRepository.createRegistrationInDB(value);
        
        // TODO: Actualizar contador de inscriptos en la clase
        // await classesRepository.incrementClassRegistrations(value.classId);
        
        return registration;
        
    } catch (error) {
        throw error;
    }
};

module.exports = { createRegistration };