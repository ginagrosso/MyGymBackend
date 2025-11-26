// functions/src/services/classes/scheduleClass.service.js
const classesRepository = require('../../repositories/classes.repository');
const { diasHorariosSchema } = require('../../schemas/class.schema');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

/**
 * Obtener los horarios de una clase
 * Los horarios están embebidos en el objeto de la clase (diasHorarios)
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @returns {object} Horarios de la clase
 */
const getClassSchedule = async (gymId, classId) => {
    console.log(`SERVICIO: Obteniendo horarios de clase ${classId}`);
    
    // Obtener la clase
    const clase = await classesRepository.getClassByIdFromDB(gymId, classId);
    
    if (!clase) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    const schedule = {
        classId: classId,
        className: clase.nombre,
        diasHorarios: clase.diasHorarios || {},
        activa: clase.activa
    };
    
    console.log(`SERVICIO: Horarios obtenidos para "${clase.nombre}"`);
    
    return schedule;
};

/**
 * Actualizar los horarios de una clase
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @param {object} diasHorarios - Objeto con los nuevos horarios
 * @returns {object} Clase con horarios actualizados
 */
const updateClassSchedule = async (gymId, classId, diasHorarios) => {
    console.log(`SERVICIO: Actualizando horarios de clase ${classId}`);
    
    // 1. Validar el formato de los horarios
    const { error, value } = diasHorariosSchema.validate(diasHorarios);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Verificar que la clase existe
    const claseExistente = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!claseExistente) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    // 3. Actualizar los horarios
    const claseActualizada = await classesRepository.updateClassInDB(gymId, classId, {
        diasHorarios: value
    });
    
    console.log(`SERVICIO: Horarios de "${claseActualizada.nombre}" actualizados`);
    
    return {
        classId: classId,
        className: claseActualizada.nombre,
        diasHorarios: claseActualizada.diasHorarios,
        updatedAt: claseActualizada.updatedAt
    };
};

module.exports = {
    getClassSchedule,
    updateClassSchedule
};

