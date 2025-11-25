//readExercise.service.js:

///Función getExternalExercises(queryParams): (Lógica de Proxy: Llama a la API externa de ejercicios con axios y devuelve los datos).

//Función getCustomExercises(gymId): (Lógica: Llama a exercisesRepo.getCustomExercisesFromDB(gymId)).

//Exportar { getExternalExercises, getCustomExercises }

const exercisesRepository = require('../../repositories/exercises.repository');

const getGymExercises = async (gymId) => {
    console.log(`SERVICIO. Obteniendo ejercicios del gym ${gymId}`);
    
    try {
        const exercises = await exercisesRepository.getGymExercisesFromDB(gymId);
        
        console.log(`Ejercicios obtenidos exitosamente`);
        return exercises;
        
    } catch (error) {
        console.log(`SERVICIO. Error obteniendo ejercicios:`, error.message);
        throw error;
    }
};

const getExerciseDetails = async (gymId, exerciseId) => {
    console.log(`SERVICIO. Obteniendo detalles del ejercicio ${exerciseId}`);
    
    try {
        const exercise = await exercisesRepository.getExerciseDetailsFromDB(gymId, exerciseId);
        
        if (!exercise) {
            throw new Error('Ejercicio no encontrado');
        }
        
        if (exercise.isArchived) {
            throw new Error('Ejercicio archivado');
        }
        
        console.log(`Ejercicio obtenido exitosamente`);
        return exercise;
        
    } catch (error) {
        console.log(`SERVICIO. Error obteniendo ejercicio:`, error.message);
        throw error;
    }
};

module.exports = { getGymExercises, getExerciseDetails };