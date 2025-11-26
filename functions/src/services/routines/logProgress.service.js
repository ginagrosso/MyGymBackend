const { logProgressSchema } = require('../../schemas/routine.schema');
const routinesRepository = require('../../repositories/routines.repository');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const logProgress = async (userId, data) => {
    console.log(`SERVICIO. Registrando progreso para usuario ${userId}`);
    
    // 1. Validar datos con Joi (sin userId ni routineId)
    const { error, value } = logProgressSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Obtener la rutina activa del usuario
    const routineId = await routinesRepository.getUserActiveRoutineIdFromDB(userId);
    
    if (!routineId) {
        throw new ResourceNotFoundError('Usuario sin rutina asignada. Asigna una rutina primero.');
    }
    
    console.log(`Usando rutina activa: ${routineId}`);
    
    // 3. Establecer fecha si no viene
    const date = value.date || new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    
    // 4. Preparar datos del progreso
    const progressData = {
        userId,
        routineId,
        date,
        exercises: value.exercises,
        notes: value.notes || '',
        timestamp: Date.now(),
        totalExercises: value.exercises.length,
        completedExercises: value.exercises.filter(ex => ex.completedSets > 0).length
    };
    
    // 5. Calcular tasa de completitud
    const totalSetsPlanned = value.exercises.reduce((sum, ex) => sum + (ex.completedSets || 0), 0);
    const totalSetsCompleted = value.exercises.reduce((sum, ex) => sum + ex.completedSets, 0);
    progressData.completionRate = totalSetsPlanned > 0 ? 
        parseFloat((totalSetsCompleted / totalSetsPlanned).toFixed(2)) : 0;
    
    // 6. Guardar en BD
    const savedProgress = await routinesRepository.saveProgressInDB(progressData);
    
    console.log(`Progreso guardado exitosamente para ${userId} en rutina ${routineId}`);
    
    return savedProgress;
};

module.exports = { logProgress };