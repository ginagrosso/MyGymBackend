const routinesRepository = require('../../repositories/routines.repository');
const { logProgressSchema } = require('../../schemas/routine.schema');

const logProgress = async (userId, data) => {
    console.log(`SERVICIO. Registrando progreso para usuario ${userId}`);
    
    try {
        // Validar datos
        const { error, value } = logProgressSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        // Obtener rutina activa del usuario
        const routineId = await routinesRepository.getUserActiveRoutineIdFromDB(userId);
        
        if (!routineId) {
            throw new Error('Usuario sin rutina asignada');
        }
        
        // Registrar progreso
        const progress = await routinesRepository.logProgressInDB(
            userId,
            routineId,
            value
        );
        
        console.log(`Progreso registrado exitosamente`);
        return progress;
        
    } catch (error) {
        console.log(`SERVICIO. Error registrando progreso:`, error.message);
        throw error;
    }
};

module.exports = { logProgress };