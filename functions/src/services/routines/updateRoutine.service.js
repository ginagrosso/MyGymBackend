const routinesRepository = require('../../repositories/routines.repository');
const { createRoutineSchema } = require('../../schemas/routine.schema');

const updateRoutine = async (routineId, data) => {

    try {
        const existingRoutine = await routinesRepository.getRoutineDetailsFromDB(routineId);
        if (!existingRoutine) {
            throw new Error('Rutina no encontrada');
        }
        
        if (existingRoutine.isArchived) {
            throw new Error('No se puede actualizar una rutina archivada');
        }
        
        const { error, value } = createRoutineSchema.validate(data, { allowUnknown: true });
        if (error) {
            throw new Error(error.details[0].message);
        }

        const updatedRoutine = await routinesRepository.updateRoutineInDB(routineId, value);
        
        return updatedRoutine;
        
    } catch (error) {
        throw error;
    }
};

const archiveRoutine = async (routineId) => {
    
    try {
        const existingRoutine = await routinesRepository.getRoutineDetailsFromDB(routineId);
        if (!existingRoutine) {
            throw new Error('Rutina no encontrada');
        }
    
        await routinesRepository.updateRoutineInDB(routineId, { 
            isArchived: true,
            archivedAt: Date.now()
        });
        
        return { success: true, message: 'Rutina archivada' };
        
    } catch (error) {
        throw error;
    }
};

module.exports = { updateRoutine, archiveRoutine };