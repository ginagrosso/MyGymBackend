//updateRoutine.service.js:
//Función updateRoutine(routineId, data): (Lógica: Llama a routinesRepo.updateRoutineInDB(routineId, data)).
//Función assignRoutine(data): (Lógica: Llama a routinesRepo.assignRoutineToUserInDB(data.userId, data.routineId)).
//Exportar { updateRoutine, assignRoutine }.

const routinesRepository = require('../../repositories/routines.repository');
const { createRoutineSchema } = require('../../schemas/routine.schema');

const updateRoutine = async (routineId, data) => {
    console.log(`SERVICIO. Actualizando rutina ${routineId}`);
    
    try {
        // Verificar que la rutina existe
        const existingRoutine = await routinesRepository.getRoutineDetailsFromDB(routineId);
        if (!existingRoutine) {
            throw new Error('Rutina no encontrada');
        }
        
        if (existingRoutine.isArchived) {
            throw new Error('No se puede actualizar una rutina archivada');
        }
        
        // Validar datos (parcial)
        const { error, value } = createRoutineSchema.validate(data, { allowUnknown: true });
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        // Actualizar rutina
        const updatedRoutine = await routinesRepository.updateRoutineInDB(routineId, value);
        
        console.log(`Rutina actualizada exitosamente`);
        return updatedRoutine;
        
    } catch (error) {
        console.log(`SERVICIO. Error actualizando rutina:`, error.message);
        throw error;
    }
};

const archiveRoutine = async (routineId) => {
    console.log(`SERVICIO. Archivando rutina ${routineId}`);
    
    try {
        // Verificar que la rutina existe
        const existingRoutine = await routinesRepository.getRoutineDetailsFromDB(routineId);
        if (!existingRoutine) {
            throw new Error('Rutina no encontrada');
        }
        
        // Archivar (soft delete)
        await routinesRepository.updateRoutineInDB(routineId, { 
            isArchived: true,
            archivedAt: Date.now()
        });
        
        console.log(`Rutina archivada exitosamente`);
        return { success: true, message: 'Rutina archivada' };
        
    } catch (error) {
        console.log(`SERVICIO. Error archivando rutina:`, error.message);
        throw error;
    }
};

module.exports = { updateRoutine, archiveRoutine };