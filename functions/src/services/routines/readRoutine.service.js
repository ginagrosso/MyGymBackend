//readRoutine.service.js:

//Función getUserRoutine(userId): (Lógica: Llama a routinesRepo.getUserActiveRoutineIdFromDB, luego con ese ID llama a routinesRepo.getRoutineDetailsFromDB).

//Exportar { getUserRoutine }.

const routinesRepository = require('../../repositories/routines.repository');

const getRoutineDetails = async (routineId) => {
    console.log(`SERVICIO. Obteniendo detalles de rutina ${routineId}`);
    
    try {
        const routine = await routinesRepository.getRoutineDetailsFromDB(routineId);
        
        if (!routine) {
            throw new Error('Rutina no encontrada');
        }
        
        if (routine.isArchived) {
            throw new Error('Rutina archivada');
        }
        
        console.log(`Rutina obtenida exitosamente`);
        return routine;
        
    } catch (error) {
        console.log(`SERVICIO. Error obteniendo rutina:`, error.message);
        throw error;
    }
};

const getUserActiveRoutine = async (userId) => {
    console.log(`SERVICIO. Obteniendo rutina activa del usuario ${userId}`);
    
    try {
        const routineId = await routinesRepository.getUserActiveRoutineIdFromDB(userId);
        
        if (!routineId) {
            return null; // Usuario sin rutina asignada
        }
        
        const routine = await routinesRepository.getRoutineDetailsFromDB(routineId);
        
        console.log(`Rutina activa obtenida exitosamente`);
        return routine;
        
    } catch (error) {
        console.log(`SERVICIO. Error obteniendo rutina activa:`, error.message);
        throw error;
    }
};

module.exports = { getRoutineDetails, getUserActiveRoutine };