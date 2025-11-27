const exercisesRepository = require('../../repositories/exercises.repository');

/**
 * Obtener detalles de un ejercicio específico
 */
const getExerciseDetails = async (exerciseId) => {

    try {
        if ( !exerciseId) {
            throw new Error('exerciseId es requerido');
        }
        
        const exercise = await exercisesRepository.getExerciseDetailsFromDB(exerciseId);
        
        if (!exercise) {
            throw new Error('Ejercicio no encontrado');
        }
        
        if (exercise.isArchived) {
            throw new Error('Ejercicio archivado');
        }
        
        console.log(`SERVICE. Ejercicio encontrado`);
        return { id: exerciseId, ...exercise };
        
    } catch (error) {
        console.error(`SERVICE. Error obteniendo ejercicio:`, error.message);
        throw error;
    }
};

const getExerciseById = async (exerciseId) => {
    console.log(`SERVICE. Obteniendo ejercicio ${exerciseId}`);
    
    try {
        const exercise = await exercisesRepository.getExerciseByIdFromDB(exerciseId);
        
        if (!exercise) {
            throw new Error(`Ejercicio ${exerciseId} no encontrado`);
        }
        
        return exercise;
        
    } catch (error) {
        console.error(`SERVICE. Error obteniendo ejercicio:`, error.message);
        throw error;
    }
};

const getAllExercises = async () => {
    console.log('SERVICE. Obteniendo todos los ejercicios');
    
    try {
        const exercises = await exercisesRepository.getAllExercisesFromDB();
        return exercises;
    } catch (error) {
        console.error('SERVICE. Error obteniendo ejercicios:', error.message);
        throw error;
    }
};

module.exports = {
    getExerciseDetails,
    getExerciseById,     
    getAllExercises       
};