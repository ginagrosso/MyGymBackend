//createRoutine.service.js:

//Función createRoutine(data): (Lógica: Llama a routinesRepo.createRoutineInDB(data)).

//Exportar { createRoutine }.

const { createRoutineSchema } = require('../../schemas/routine.schema');
const routinesRepository = require('../../repositories/routines.repository');
const exercisesRepository = require('../../repositories/exercises.repository');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const createRoutine = async (data) => {
    console.log('SERVICIO. Iniciando creación de rutina');
    
    // 1. Validar datos con Joi
    const { error, value } = createRoutineSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Extraer IDs de ejercicios
    const exerciseIds = value.ejercicios.map(ej => ej.exerciseId);
    console.log(`Validando existencia de ${exerciseIds.length} ejercicios`);
    
    // 3. Verificar que todos los ejercicios existan
    const existingExercises = await exercisesRepository.getExercisesByIdsFromDB(exerciseIds);
    
    if (existingExercises.length !== exerciseIds.length) {
        const foundIds = existingExercises.map(ex => ex.exerciseId);
        const missingIds = exerciseIds.filter(id => !foundIds.includes(id));
        throw new ResourceNotFoundError(
            `Los siguientes ejercicios no existen: ${missingIds.join(', ')}`
        );
    }
    
    // 4. Guardar solo referencias y parámetros de rutina (NO duplicar datos)
    const routineData = {
        nombre: value.nombre,
        descripcion: value.descripcion || '',
        ejercicios: value.ejercicios.map(ej => ({
            exerciseId: ej.exerciseId,    // Solo la referencia
            sets: ej.sets,                // Parámetros de la rutina
            reps: ej.reps,
            weight: ej.weight,
            notes: ej.notes
        }))
    };
    
    // 5. Guardar en BD
    const newRoutine = await routinesRepository.createRoutineInDB(routineData);
    
    console.log(`Rutina creada exitosamente con ID: ${newRoutine.id}`);
    
    return newRoutine;
};

module.exports = { createRoutine };