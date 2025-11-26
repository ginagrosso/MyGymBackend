// functions/src/services/classes/updateClass.service.js
const classesRepository = require('../../repositories/classes.repository');
const { updateClassSchema, toggleStatusSchema, updateImageSchema } = require('../../schemas/class.schema');
const { DataValidationError, ResourceNotFoundError } = require('../../utils/httpStatusCodes');

/**
 * Actualizar una clase existente
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @param {object} data - Datos a actualizar
 * @returns {object} Clase actualizada
 */
const updateClass = async (gymId, classId, data) => {
    console.log(`SERVICIO: Actualizando clase ${classId} del gym ${gymId}`);
    
    // 1. Validar datos con Joi
    const { error, value } = updateClassSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Verificar que la clase existe
    const claseExistente = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!claseExistente) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    // 3. Actualizar la clase
    const claseActualizada = await classesRepository.updateClassInDB(gymId, classId, value);
    
    console.log(`SERVICIO: Clase "${claseActualizada.nombre}" actualizada exitosamente`);
    
    return claseActualizada;
};

/**
 * Cambiar el estado activa/inactiva de una clase
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @param {object} data - { activa: boolean }
 * @returns {object} Clase actualizada
 */
const toggleClassStatus = async (gymId, classId, data) => {
    console.log(`SERVICIO: Cambiando estado de clase ${classId}`);
    
    // 1. Validar datos
    const { error, value } = toggleStatusSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Verificar que la clase existe
    const claseExistente = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!claseExistente) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    // 3. Actualizar el estado
    const claseActualizada = await classesRepository.updateClassInDB(gymId, classId, {
        activa: value.activa
    });
    
    const estadoTexto = value.activa ? 'activada' : 'desactivada';
    console.log(`SERVICIO: Clase "${claseActualizada.nombre}" ${estadoTexto}`);
    
    return claseActualizada;
};

/**
 * Actualizar la imagen de una clase
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @param {object} data - { imageUrl: string }
 * @returns {object} Clase actualizada
 */
const updateClassImage = async (gymId, classId, data) => {
    console.log(`SERVICIO: Actualizando imagen de clase ${classId}`);
    
    // 1. Validar datos
    const { error, value } = updateImageSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Verificar que la clase existe
    const claseExistente = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!claseExistente) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    // 3. Actualizar la imagen
    const claseActualizada = await classesRepository.updateClassInDB(gymId, classId, {
        imagen: value.imageUrl
    });
    
    console.log(`SERVICIO: Imagen de clase "${claseActualizada.nombre}" actualizada`);
    
    return claseActualizada;
};

module.exports = {
    updateClass,
    toggleClassStatus,
    updateClassImage
};
