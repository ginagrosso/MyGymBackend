// functions/src/services/classes/waitlistClass.service.js
const classesRepository = require('../../repositories/classes.repository');
const { addToWaitlistSchema } = require('../../schemas/class.schema');
const { DataValidationError, ResourceNotFoundError, DatabaseError } = require('../../utils/httpStatusCodes');

/**
 * Obtener la lista de espera de una clase
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @returns {array} Lista de usuarios en espera
 */
const getWaitlist = async (gymId, classId) => {
    console.log(`SERVICIO: Obteniendo lista de espera de clase ${classId}`);
    
    // Verificar que la clase existe
    const clase = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!clase) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    const waitlist = await classesRepository.getWaitlistFromDB(classId);
    
    console.log(`SERVICIO: ${waitlist.length} usuarios en lista de espera para "${clase.nombre}"`);
    
    return {
        classId: classId,
        className: clase.nombre,
        waitlist: waitlist,
        count: waitlist.length
    };
};

/**
 * Agregar un usuario a la lista de espera
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @param {string} userId - ID del usuario a agregar
 * @returns {object} Resultado de la operación
 */
const addToWaitlist = async (gymId, classId, userId) => {
    console.log(`SERVICIO: Agregando usuario ${userId} a lista de espera de clase ${classId}`);
    
    // 1. Validar userId
    const { error } = addToWaitlistSchema.validate({ userId });
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Verificar que la clase existe
    const clase = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!clase) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    // 3. Verificar que el usuario no esté ya en la lista
    const yaEnLista = await classesRepository.isUserInWaitlistFromDB(classId, userId);
    if (yaEnLista) {
        throw new DatabaseError('El usuario ya está en la lista de espera');
    }
    
    // 4. Agregar a la lista de espera
    const result = await classesRepository.addToWaitlistInDB(classId, userId);
    
    console.log(`SERVICIO: Usuario agregado a lista de espera de "${clase.nombre}"`);
    
    return {
        message: `Usuario agregado a la lista de espera de "${clase.nombre}"`,
        classId: classId,
        userId: userId,
        addedAt: result.addedAt
    };
};

/**
 * Remover un usuario de la lista de espera
 * @param {string} gymId - ID del gimnasio
 * @param {string} classId - ID de la clase
 * @param {string} userId - ID del usuario a remover
 * @returns {object} Resultado de la operación
 */
const removeFromWaitlist = async (gymId, classId, userId) => {
    console.log(`SERVICIO: Removiendo usuario ${userId} de lista de espera de clase ${classId}`);
    
    // 1. Verificar que la clase existe
    const clase = await classesRepository.getClassByIdFromDB(gymId, classId);
    if (!clase) {
        throw new ResourceNotFoundError(`Clase con ID ${classId} no encontrada`);
    }
    
    // 2. Verificar que el usuario está en la lista
    const enLista = await classesRepository.isUserInWaitlistFromDB(classId, userId);
    if (!enLista) {
        throw new ResourceNotFoundError('El usuario no está en la lista de espera');
    }
    
    // 3. Remover de la lista
    await classesRepository.removeFromWaitlistInDB(classId, userId);
    
    console.log(`SERVICIO: Usuario removido de lista de espera de "${clase.nombre}"`);
    
    return {
        message: `Usuario removido de la lista de espera de "${clase.nombre}"`,
        classId: classId,
        userId: userId
    };
};

module.exports = {
    getWaitlist,
    addToWaitlist,
    removeFromWaitlist
};

