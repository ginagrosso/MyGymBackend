const Joi = require('joi');

/**
 * Schema para crear inscripción
 */
const createRegistrationSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'El userId es obligatorio',
        'string.empty': 'El userId no puede estar vacío'
    }),
    classId: Joi.string().required().messages({
        'any.required': 'El classId es obligatorio',
        'string.empty': 'El classId no puede estar vacío'
    }),
    gymId: Joi.string().required().messages({
        'any.required': 'El gymId es obligatorio',
        'string.empty': 'El gymId no puede estar vacío'
    }),
});

module.exports = {
    createRegistrationSchema
};