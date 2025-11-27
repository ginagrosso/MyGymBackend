const exercisesRepository = require('../../repositories/exercises.repository');
const { createExerciseSchema } = require('../../schemas/exercise.schema');

const updateExercise = async ( exerciseId, data) => {
 
    try {
        const existingExercise = await exercisesRepository.getExerciseDetailsFromDB(exerciseId);
        if (!existingExercise) {
            throw new Error('Ejercicio no encontrado');
        }
        
        if (existingExercise.isArchived) {
            throw new Error('No se puede actualizar un ejercicio archivado');
        }
        
        const { error, value } = createExerciseSchema.validate(data, { allowUnknown: true });
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        const updatedExercise = await exercisesRepository.updateExerciseInDB(gymId, exerciseId, value);
        
        console.log(`Ejercicio actualizado exitosamente`);
        return updatedExercise;
        
    } catch (error) {
        throw new Error(`Error actualizando ejercicio: ${error.message}`);
    }
};

const archiveExercise = async ( exerciseId) => {
    console.log(`SERVICIO. Archivando ejercicio ${exerciseId}`);
    
    try {
        const existingExercise = await exercisesRepository.getExerciseDetailsFromDB(exerciseId);
        if (!existingExercise) {
            throw new Error('Ejercicio no encontrado');
        }

        await exercisesRepository.archiveExerciseInDB(exerciseId);
        
        console.log(`Ejercicio archivado exitosamente`);
        return { success: true, message: 'Ejercicio archivado' };
        
    } catch (error) {
        throw new Error(`Error archivando ejercicio: ${error.message}`);
    }
};

module.exports = { updateExercise, archiveExercise };