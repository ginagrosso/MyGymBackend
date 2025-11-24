const Joi = require('joi');

const createUserSchema = Joi.object({
    email : Joi.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es obligatorio'
    }),
    password : Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es obligatoria'
    }),
    nombre: Joi.string().min(2).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'any.required': 'El nombre es obligatorio'
    }),
    //opcionales
    fotoUrl: Joi.string().uri().optional(),
    peso: Joi.number().min(20).max(300).optional(),
    altura: Joi.number().min(100).max(300).optional(),
    fechaNacimiento: Joi.string().optional(),  //formato "YYYY-MM-DD"
});

const updateUserSchema = Joi.object({
    nombre: Joi.string().min(2).optional(),
    fotoUrl: Joi.string().uri().optional(),
    peso: Joi.number().min(20).max(300).optional(),
    altura: Joi.number().min(100).max(300).optional(),
    fechaNacimiento: Joi.string().optional()
}).min(1); // al menos 1 campo debe ser enviado.

module.exports = {
    createUserSchema,
    updateUserSchema
};