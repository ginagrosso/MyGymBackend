const exercisesRepository = require('../../repositories/exercises.repository');

/**
 * Obtener todos los ejercicios de un gimnasio
 */
const getGymExercises = async (gymId) => {
    console.log(`SERVICE. Obteniendo ejercicios del gym ${gymId}`);
    
    try {
        if (!gymId) {
            throw new Error('El gymId es requerido');
        }
        
        const exercisesObj = await exercisesRepository.getGymExercisesFromDB(gymId);
        
        // Si no hay ejercicios, retornar array vacío
        if (!exercisesObj || Object.keys(exercisesObj).length === 0) {
            console.log(`SERVICE. No se encontraron ejercicios para el gym ${gymId}`);
            return [];
        }
        
        // Convertir objeto a array
        const exercisesArray = Object.entries(exercisesObj).map(([key, value]) => ({
            id: key,
            ...value
        }));
        
        console.log(`SERVICE. Se encontraron ${exercisesArray.length} ejercicios`);
        
        return exercisesArray;
        
    } catch (error) {
        console.error(`SERVICE. Error obteniendo ejercicios:`, error.message);
        throw error;
    }
};

/**
 * Obtener detalles de un ejercicio específico
 */
const getExerciseDetails = async (gymId, exerciseId) => {
    console.log(`SERVICE. Obteniendo ejercicio ${exerciseId} del gym ${gymId}`);
    
    try {
        if (!gymId || !exerciseId) {
            throw new Error('gymId y exerciseId son requeridos');
        }
        
        const exercise = await exercisesRepository.getExerciseDetailsFromDB(gymId, exerciseId);
        
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

// 🆕 AGREGAR: Obtener ejercicio por ID (para rutinas)
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

// 🆕 AGREGAR: Obtener todos los ejercicios
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
    getGymExercises,
    getExerciseDetails,
    getExerciseById,      // 🆕
    getAllExercises       // 🆕
};