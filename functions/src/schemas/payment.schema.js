const Joi = require('joi');

const processPaymentSchema = Joi.object({
    // Validar que sea un número positivo.
    // Nota: Usar enteros (centavos) en sistemas reales para evitar errores de redondeo.
    // Restringir valor mínimo a 1 para evitar montos nulos o negativos.
    amount: Joi.number().positive().required().messages({
        'number.base': 'El monto debe ser un número',
        'number.positive': 'El monto debe ser mayor a cero',
        'any.required': 'El monto es obligatorio'
    }),

    // Requerir método de pago como cadena de texto.
    method: Joi.string().required().messages({
        'any.required': 'El método de pago es obligatorio'
    }),

    // Requerir token de la pasarela de pago.
    token: Joi.string().required().messages({
        'any.required': 'El token de pago es obligatorio'
    }),

    // Vincular transacción al usuario y gimnasio (IDs de Firebase).
    userId: Joi.string().required(),
    gymId: Joi.string().required(),
    
    // Incluir concepto o descripción (opcional).
    concept: Joi.string().optional()
});

module.exports = {
    processPaymentSchema
};