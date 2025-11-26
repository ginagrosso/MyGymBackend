const { createRoutineSchema } = require('../../schemas/routine.schema');
const routinesRepository = require('../../repositories/routines.repository');
const exercisesRepository = require('../../repositories/exercises.repository');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const createRoutine = async (data) => {
    console.log('SERVICIO. Iniciando creación de rutina');
    
    // 1. Validar datos con Joi (strip unknown para eliminar undefined)
    const { error, value } = createRoutineSchema.validate(data, { 
        stripUnknown: true,
        convert: true 
    });
    
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
    
    // 4. Limpiar ejercicios removiendo undefined y null
    const ejerciciosLimpios = value.ejercicios.map(ej => {
        const ejercicio = {
            exerciseId: ej.exerciseId,
            sets: ej.sets,
            reps: ej.reps
        };
        
        // Solo agregar weight si existe
        if (ej.weight !== undefined && ej.weight !== null) {
            ejercicio.weight = ej.weight;
        }
        
        // Solo agregar notes si existe y no está vacío
        if (ej.notes !== undefined && ej.notes !== null && ej.notes.trim() !== '') {
            ejercicio.notes = ej.notes;
        }
        
        return ejercicio;
    });
    
    // 5. Preparar datos finales
    const routineData = {
        nombre: value.nombre,
        descripcion: value.descripcion || '',
        ejercicios: ejerciciosLimpios
    };
    
    console.log('Datos a guardar:', JSON.stringify(routineData, null, 2));
    
    // 6. Guardar en BD
    const newRoutine = await routinesRepository.createRoutineInDB(routineData);
    
    console.log(`Rutina creada exitosamente con ID: ${newRoutine.id}`);
    
    return newRoutine;
};

module.exports = { createRoutine };