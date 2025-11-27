const exercisesRepository = require('../../repositories/exercises.repository');
const { createExerciseSchema } = require('../../schemas/exercise.schema');

const createExercise = async (data) => {
    
    try {
        const { error, value } = createExerciseSchema.validate(data);
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        const exercise = await exercisesRepository.createExerciseInDB(value);
        
        console.log(`Ejercicio creado exitosamente`);
        return exercise;
        
    } catch (error) {
        throw new Error(`Error creando ejercicio: ${error.message}`);
    }
};

module.exports = { createExercise };