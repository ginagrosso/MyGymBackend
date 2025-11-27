const routinesRepository = require('../../repositories/routines.repository');
const { assignRoutineSchema } = require('../../schemas/routine.schema');

const assignRoutine = async (data) => {
    console.log(`SERVICIO. Asignando rutina`);
    
    try {
        const { error, value } = assignRoutineSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        const routine = await routinesRepository.getRoutineDetailsFromDB(value.routineId);
        if (!routine) {
            throw new Error('Rutina no encontrada');
        }
        
        if (routine.isArchived) {
            throw new Error('No se puede asignar una rutina archivada');
        }
        
        const assignment = await routinesRepository.assignRoutineToUserInDB(
            value.userId,
            value.routineId
        );
        
        console.log(`Rutina asignada exitosamente`);
        return {
            ...assignment,
            routine
        };
        
    } catch (error) {
        console.log(`SERVICIO. Error asignando rutina:`, error.message);
        throw error;
    }
};

module.exports = { assignRoutine };