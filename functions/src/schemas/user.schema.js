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
    }),
    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
        'any.only': 'El género debe ser male, female u other'
    }),
    avatarUri: Joi.string().uri().optional().messages({
        'string.uri': 'La URL de la imagen debe ser válida'
    }),
    phone: Joi.string().optional().messages({
        'string.base': 'El teléfono debe ser un texto'
    }),
    weight: Joi.number().min(20).max(300).optional().messages({
        'number.base': 'El peso debe ser un número',
        'number.min': 'El peso debe ser al menos 20kg',
        'number.max': 'El peso no puede superar 300kg'
    }),
    height: Joi.number().min(100).max(250).optional().messages({
        'number.base': 'La altura debe ser un número',
        'number.min': 'La altura debe ser al menos 100cm',
        'number.max': 'La altura no puede superar 250cm'
    })
});

// Esquema para registrar GIMNASIOS
const registerGymSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es obligatoria'
    }),
    businessName: Joi.string().min(2).required().messages({
        'string.min': 'El nombre del gimnasio debe tener al menos 2 caracteres',
        'any.required': 'El nombre del gimnasio es obligatorio'
    }),
    address: Joi.string().required().messages({
        'any.required': 'La dirección es obligatoria'
    }),
    phone: Joi.string().optional().messages({
        'string.phone': 'El teléfono debe tener un formato válido'
    }),
    avatarUri: Joi.string().uri().optional().messages({
        'string.uri': 'La URL de la imagen debe ser válida'
    })
});

const updateGymSchema = Joi.object({
    businessName: Joi.string().min(2).optional().messages({
        'string.min': 'El nombre del gimnasio debe tener al menos 2 caracteres'
    }),
    address: Joi.string().optional().messages({
        'any.required': 'La dirección es obligatoria'
    }),
    phone: Joi.string().optional().messages({
        'string.phone': 'El teléfono debe tener un formato válido'
    }),
    avatarUri: Joi.string().uri().optional().messages({
        'string.uri': 'La URL de la imagen debe ser válida'
    })
});

// Esquema para actualizar perfil
const updateUserSchema = Joi.object({
    name: Joi.string().min(2).optional().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres'
    }),
    gender: Joi.string().valid('male', 'female', 'other').optional().messages({
        'any.only': 'El género debe ser male, female u other'
    }),
    phone: Joi.string().optional().messages({
        'string.phone': 'El teléfono debe tener un formato válido'
    }),
    avatarUri: Joi.string().uri().optional().messages({
        'string.uri': 'La URL de la imagen debe ser válida'
    }),
    height: Joi.number().optional().messages({
        'number.base': 'La altura debe ser un número'
    }),
    weight: Joi.number().optional().messages({
        'number.base': 'El peso debe ser un número'
    })
}).min(1);

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().required().messages({
        'any.required': 'La contraseña es obligatoria'
    })
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().messages({
        'any.required': 'La contraseña actual es obligatoria'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
        'any.required': 'La nueva contraseña es obligatoria'
    })
});

module.exports = {
    registerClientSchema,
    registerGymSchema,
    updateGymSchema,
    updateUserSchema,
    loginSchema,
    changePasswordSchema
};