const Joi = require('joi');

const addPaymentMethodSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'El userId es obligatorio'
    }),
    // En un escenario real con MP, el frontend te manda un 'token'
    token: Joi.string().required().messages({
        'any.required': 'El token de la tarjeta es obligatorio'
    }),
    // Guardamos datos no sensibles para mostrar en la UI
    lastFourDigits: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
    brand: Joi.string().required(), // ej: 'visa', 'mastercard'
    expiryMonth: Joi.number().min(1).max(12).required(),
    expiryYear: Joi.number().min(2024).required()
});

module.exports = { addPaymentMethodSchema };