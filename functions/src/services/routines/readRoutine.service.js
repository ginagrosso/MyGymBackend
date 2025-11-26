//readRoutine.service.js:

//Función getUserRoutine(userId): (Lógica: Llama a routinesRepo.getUserActiveRoutineIdFromDB, luego con ese ID llama a routinesRepo.getRoutineDetailsFromDB).

//Exportar { getUserRoutine }.

const routinesRepository = require('../../repositories/routines.repository');
const exercisesRepository = require('../../repositories/exercises.repository');
const { ResourceNotFoundError } = require('../../utils/httpStatusCodes');

// Obtener detalles completos de una rutina
const getRoutineDetails = async (routineId) => {
    console.log(`SERVICIO. Obteniendo detalles de rutina ${routineId}`);
    
    // 1. Obtener la rutina
    const routine = await routinesRepository.getRoutineDetailsFromDB(routineId);
    
    if (!routine) {
        throw new ResourceNotFoundError('Rutina no encontrada');
    }
    
    // 2. Obtener IDs de ejercicios
    const exerciseIds = routine.ejercicios.map(ej => ej.exerciseId);
    
    // 3. Obtener datos completos de los ejercicios
    const exercises = await exercisesRepository.getExercisesByIdsFromDB(exerciseIds);
    
    // 4. Combinar datos: rutina + ejercicios
    const enrichedEjercicios = routine.ejercicios.map(ejercicioRutina => {
        const ejercicioDB = exercises.find(ex => ex.exerciseId === ejercicioRutina.exerciseId);
        
        return {
            // Datos del ejercicio (de la BD)
            exerciseId: ejercicioDB.exerciseId,
            nombre: ejercicioDB.nombre,
            descripcion: ejercicioDB.descripcion,
            categoria: ejercicioDB.categoria,
            grupoMuscular: ejercicioDB.grupoMuscular,
            equipamiento: ejercicioDB.equipamiento,
            videoUrl: ejercicioDB.videoUrl,
            imagenUrl: ejercicioDB.imagenUrl,
            // Parámetros de la rutina
            sets: ejercicioRutina.sets,
            reps: ejercicioRutina.reps,
            weight: ejercicioRutina.weight,
            notes: ejercicioRutina.notes
        };
    });
    
    return {
        ...routine,
        ejercicios: enrichedEjercicios
    };
};

// Obtener rutina activa del usuario
const getUserActiveRoutine = async (userId) => {
    console.log(`SERVICIO. Obteniendo rutina activa del usuario ${userId}`);
    
    // 1. Obtener ID de rutina activa
    const activeRoutineId = await routinesRepository.getUserActiveRoutineIdFromDB(userId);
    
    if (!activeRoutineId) {
        throw new ResourceNotFoundError('Usuario sin rutina asignada');
    }
    
    // 2. Obtener detalles completos
    return await getRoutineDetails(activeRoutineId);
};

module.exports = {
    getRoutineDetails,
    getUserActiveRoutine
};