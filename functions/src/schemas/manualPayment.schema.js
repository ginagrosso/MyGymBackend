const Joi = require('joi');

const manualPaymentSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'El ID del usuario es obligatorio'
    }),
    amount: Joi.number().positive().required().messages({
        'number.base': 'El monto debe ser un número',
        'number.positive': 'El monto debe ser mayor a cero'
    }),
    concept: Joi.string().optional().allow('').default('Pago en efectivo')
});

module.exports = { manualPaymentSchema };