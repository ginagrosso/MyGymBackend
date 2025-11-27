const { logProgressSchema } = require('../../schemas/routine.schema');
const routinesRepository = require('../../repositories/routines.repository');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const logProgress = async (userId, data) => {
    
    const { error, value } = logProgressSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    const routineId = await routinesRepository.getUserActiveRoutineIdFromDB(userId);
    
    if (!routineId) {
        throw new ResourceNotFoundError('Usuario sin rutina asignada. Asigna una rutina primero.');
    }

    const date = value.date || new Date().toISOString().split('T')[0]; 
    
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
    
    const totalSetsPlanned = value.exercises.reduce((sum, ex) => sum + (ex.completedSets || 0), 0);
    const totalSetsCompleted = value.exercises.reduce((sum, ex) => sum + ex.completedSets, 0);
    progressData.completionRate = totalSetsPlanned > 0 ? parseFloat((totalSetsCompleted / totalSetsPlanned).toFixed(2)) : 0;

    const savedProgress = await routinesRepository.saveProgressInDB(progressData);
    
    return savedProgress;
};

module.exports = { logProgress };