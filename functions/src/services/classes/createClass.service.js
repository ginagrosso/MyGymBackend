// functions/src/services/classes/createClass.service.js
const classesRepository = require('../../repositories/classes.repository');
const { createClassSchema } = require('../../schemas/class.schema');
const { DataValidationError } = require('../../utils/httpStatusCodes');

/**
 * Crear una nueva clase para un gimnasio
 * @param {string} gymId - ID del gimnasio
 * @param {object} data - Datos de la clase
 * @returns {object} Clase creada
 */
const createClass = async (gymId, data) => {
    console.log(`SERVICIO: Creando clase para gym ${gymId}`);
    
    // 1. Validar datos con Joi
    const { error, value } = createClassSchema.validate(data);
    if (error) {
        throw new DataValidationError(error.details[0].message);
    }
    
    // 2. Crear la clase en la base de datos
    const nuevaClase = await classesRepository.createClassInDB(gymId, value);
    
    console.log(`SERVICIO: Clase "${nuevaClase.nombre}" creada exitosamente`);
    
    return nuevaClase;
};

module.exports = { createClass };
