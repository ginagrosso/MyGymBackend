//createExercise.service.js:

//Función createCustomExercise(data): (Lógica: Llama a exercisesRepo.createCustomExerciseInDB(data.gymId, data.exerciseData)).

//Exportar { createCustomExercise }.

const exercisesRepository = require('../../repositories/exercises.repository');
const { createExerciseSchema } = require('../../schemas/exercise.schema');

const createCustomExercise = async (gymId, data) => {
    
    try {
        // Validar datos
        const { error, value } = createExerciseSchema.validate(data);
        if (error) {
            console.log(`SERVICIO. Error validando datos:`, error.details[0].message);
            throw new Error(error.details[0].message);
        }
        
        // Crear ejercicio
        const exercise = await exercisesRepository.createCustomExerciseInDB(gymId, value);
        
        console.log(`Ejercicio creado exitosamente`);
        return exercise;
        
    } catch (error) {
        console.log(`SERVICIO. Error creando ejercicio:`, error.message);
        throw error;
    }
};

module.exports = { createCustomExercise };