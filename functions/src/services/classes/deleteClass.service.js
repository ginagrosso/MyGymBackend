// functions/src/services/classes/deleteClass.service.js
const classesRepository = require('../../repositories/classes.repository');
const { ResourceNotFoundError } = require('../../utils/httpStatusCodes');

/**
 * Eliminar (soft delete) una clase
 * Marca la clase como inactiva en lugar de eliminarla físicamente
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @returns {object} Resultado de la operación
 */
const deleteClass = async (gymId, classId) => {
    console.log(`SERVICIO: Eliminando (soft delete) clase ${classId} del gym ${gymId}`);
    
    // 1. Verificar que la clase existe
    const claseExistente = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!claseExistente) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    // 2. Realizar soft delete
    await classesRepository.softDeleteClassInDB(gymId, classId);
    
    console.log(`SERVICIO: Clase "${claseExistente.nombre}" archivada exitosamente`);
    
    return {
        message: `Clase "${claseExistente.nombre}" archivada correctamente`,
        classId: classId,
        archivedAt: Date.now()
    };
};

module.exports = { deleteClass };
