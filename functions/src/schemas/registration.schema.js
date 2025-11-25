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
    scheduleInfo: Joi.object({
        dia: Joi.string().valid('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo').required(),
        hora: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
            'string.pattern.base': 'La hora debe estar en formato HH:MM'
        })
    }).required()
});

module.exports = {
    createRegistrationSchema
};