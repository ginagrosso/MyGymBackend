//createRoutine.service.js:

//Función createRoutine(data): (Lógica: Llama a routinesRepo.createRoutineInDB(data)).

//Exportar { createRoutine }.

const routinesRepository = require('../../repositories/routines.repository');
const { createRoutineSchema } = require('../../schemas/routine.schema');

const createRoutine = async (data) => {
    console.log(`SERVICIO. Creando rutina`);
    
    try {
        // Validar datos
        const { error, value } = createRoutineSchema.validate(data);
        if (error) {
            console.log(`SERVICIO. Error validando datos:`, error.details[0].message);
            throw new Error(error.details[0].message);
        }
        
        // Crear rutina
        const routine = await routinesRepository.createRoutineInDB(value);
        
        console.log(`Rutina creada exitosamente`);
        return routine;
        
    } catch (error) {
        console.log(`SERVICIO. Error creando rutina:`, error.message);
        throw error;
    }
};

module.exports = { createRoutine };