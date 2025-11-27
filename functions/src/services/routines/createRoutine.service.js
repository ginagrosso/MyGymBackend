const { createRoutineSchema } = require('../../schemas/routine.schema');
const routinesRepository = require('../../repositories/routines.repository');
const exercisesRepository = require('../../repositories/exercises.repository');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const createRoutine = async (data) => {
    console.log('SERVICIO. Iniciando creación de rutina');
    
    const { error, value } = createRoutineSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    const exerciseIds = value.ejercicios.map(ej => ej.exerciseId);
    console.log(`Validando existencia de ${exerciseIds.length} ejercicios`);
    
    const existingExercises = await exercisesRepository.getExercisesByIdsFromDB(exerciseIds);
    
    if (existingExercises.length !== exerciseIds.length) {
        const foundIds = existingExercises.map(ex => ex.exerciseId);
        const missingIds = exerciseIds.filter(id => !foundIds.includes(id));
        throw new ResourceNotFoundError(
            `Los siguientes ejercicios no existen: ${missingIds.join(', ')}`
        );
    }
    
    const routineData = {
        nombre: value.nombre,
        descripcion: value.descripcion || '',
        ejercicios: value.ejercicios.map(ej => ({
            exerciseId: ej.exerciseId,    
            sets: ej.sets,                
            reps: ej.reps,
            weight: ej.weight,
            notes: ej.notes
        }))
    };

    const newRoutine = await routinesRepository.createRoutineInDB(routineData);
    
    console.log(`Rutina creada exitosamente con ID: ${newRoutine.id}`);
    
    return newRoutine;
};

module.exports = { createRoutine };