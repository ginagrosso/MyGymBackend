const routinesRepository = require('../../repositories/routines.repository');
const exercisesRepository = require('../../repositories/exercises.repository');
const { ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const getRoutineDetails = async (routineId) => {

    const routine = await routinesRepository.getRoutineDetailsFromDB(routineId);
    
    if (!routine) {
        throw new ResourceNotFoundError('Rutina no encontrada');
    }
    
    const exerciseIds = routine.ejercicios.map(ej => ej.exerciseId);
    const exercises = await exercisesRepository.getExercisesByIdsFromDB(exerciseIds);
    
    const enrichedEjercicios = routine.ejercicios.map(ejercicioRutina => {
        const ejercicioDB = exercises.find(ex => ex.exerciseId === ejercicioRutina.exerciseId);
        
        return {
            exerciseId: ejercicioDB.exerciseId,
            nombre: ejercicioDB.nombre,
            descripcion: ejercicioDB.descripcion,
            categoria: ejercicioDB.categoria,
            grupoMuscular: ejercicioDB.grupoMuscular,
            equipamiento: ejercicioDB.equipamiento,
            videoUrl: ejercicioDB.videoUrl,
            imagenUrl: ejercicioDB.imagenUrl,
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

const getUserActiveRoutine = async (userId) => {

    const activeRoutineId = await routinesRepository.getUserActiveRoutineIdFromDB(userId);
    
    if (!activeRoutineId) {
        throw new ResourceNotFoundError('Usuario sin rutina asignada');
    }
 
    return await getRoutineDetails(activeRoutineId);
};

const getAllRoutines = async () => {
    return await routinesRepository.getAllRoutinesFromDB();
};

module.exports = {
    getRoutineDetails,
    getUserActiveRoutine,
    getAllRoutines
};