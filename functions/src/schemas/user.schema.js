// functions/src/schemas/user.schema.js
const Joi = require('joi');

// Esquema para registrar CLIENTES
const registerClientSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es obligatoria'
    }),
    name: Joi.string().min(2).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'any.required': 'El nombre es obligatorio'
    }),
    dni: Joi.string().required().messages({
        'any.required': 'El DNI es obligatorio'
    }),
    birthDate: Joi.string().required().messages({
        'any.required': 'La fecha de nacimiento es obligatoria'
    })
});

// Esquema para registrar GIMNASIOS
const registerGymSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    businessName: Joi.string().min(2).required().messages({
        'any.required': 'El nombre del gimnasio es obligatorio'
    }),
    address: Joi.string().required().messages({
        'any.required': 'La dirección es obligatoria'
    }),
    phone: Joi.string().required().messages({
        'any.required': 'El teléfono es obligatorio'
    })
});

// Esquema para actualizar perfil
const updateUserSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    phone: Joi.string().optional(),
    avatarUri: Joi.string().uri().optional(),
    height: Joi.number().min(100).max(300).optional(),
    weight: Joi.number().min(20).max(300).optional()
}).min(1);

module.exports = {
    registerClientSchema,
    registerGymSchema,
    updateUserSchema
};