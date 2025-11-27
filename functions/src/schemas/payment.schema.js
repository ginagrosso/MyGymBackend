const Joi = require('joi');

const processPaymentSchema = Joi.object({
    
    amount: Joi.number().positive().required().messages({
        'number.base': 'El monto debe ser un número',
        'number.positive': 'El monto debe ser mayor a cero',
        'any.required': 'El monto es obligatorio'
    }),

    method: Joi.string().required().messages({
        'any.required': 'El método de pago es obligatorio'
    }),

    token: Joi.string().required().messages({
        'any.required': 'El token de pago es obligatorio'
    }),

    userId: Joi.string().required(),
    gymId: Joi.string().required(),
    
    concept: Joi.string().optional()
});

module.exports = {
    processPaymentSchema
};