const exercisesRepository = require('../../repositories/exercises.repository');
const { createExerciseSchema } = require('../../schemas/exercise.schema');

const updateExercise = async (gymId, exerciseId, data) => {
    console.log(`SERVICIO. Actualizando ejercicio ${exerciseId}`);
    
    try {
        // Verificar que el ejercicio existe
        const existingExercise = await exercisesRepository.getExerciseDetailsFromDB(gymId, exerciseId);
        if (!existingExercise) {
            throw new Error('Ejercicio no encontrado');
        }
        
        if (existingExercise.isArchived) {
            throw new Error('No se puede actualizar un ejercicio archivado');
        }
        
        // Validar datos (parcial)
        const { error, value } = createExerciseSchema.validate(data, { allowUnknown: true });
        if (error) {
            throw new Error(error.details[0].message);
        }
        
        // Actualizar ejercicio
        const updatedExercise = await exercisesRepository.updateExerciseInDB(gymId, exerciseId, value);
        
        console.log(`Ejercicio actualizado exitosamente`);
        return updatedExercise;
        
    } catch (error) {
        console.log(`SERVICIO. Error actualizando ejercicio:`, error.message);
        throw error;
    }
};

const archiveExercise = async (gymId, exerciseId) => {
    console.log(`SERVICIO. Archivando ejercicio ${exerciseId}`);
    
    try {
        // Verificar que el ejercicio existe
        const existingExercise = await exercisesRepository.getExerciseDetailsFromDB(gymId, exerciseId);
        if (!existingExercise) {
            throw new Error('Ejercicio no encontrado');
        }
        
        // Archivar (soft delete)
        await exercisesRepository.archiveExerciseInDB(gymId, exerciseId);
        
        console.log(`Ejercicio archivado exitosamente`);
        return { success: true, message: 'Ejercicio archivado' };
        
    } catch (error) {
        console.log(`SERVICIO. Error archivando ejercicio:`, error.message);
        throw error;
    }
};

module.exports = { updateExercise, archiveExercise };