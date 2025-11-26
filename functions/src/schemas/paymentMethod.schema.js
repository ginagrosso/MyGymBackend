const Joi = require('joi');

const addPaymentMethodSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'El userId es obligatorio'
    }),
    token: Joi.string().required().messages({
        'any.required': 'El token de la tarjeta es obligatorio'
    }),
    lastFourDigits: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
    brand: Joi.string().required(),
    expiryMonth: Joi.number().min(1).max(12).required(),
    expiryYear: Joi.number().min(2024).required()
});

module.exports = { addPaymentMethodSchema };