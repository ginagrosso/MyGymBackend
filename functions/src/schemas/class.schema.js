// functions/src/schemas/class.schema.js
const Joi = require('joi');

// Días válidos de la semana (sin tildes para compatibilidad)
const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

// Esquema para horarios por día: { "lunes": ["08:00-10:00", "14:00-16:00"], ... }
// Formato de horario: HH:MM-HH:MM
const diasHorariosSchema = Joi.object().pattern(
    Joi.string().valid(...diasValidos),
    Joi.array().items(
        Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).messages({
            'string.pattern.base': 'El formato de horario debe ser HH:MM-HH:MM (ej: 08:00-10:00)'
        })
    ).min(1)
);

// Esquema para crear clase (compatible con frontend)
const createClassSchema = Joi.object({
    nombre: Joi.string().min(2).max(100).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede superar 100 caracteres',
        'any.required': 'El nombre de la clase es obligatorio'
    }),
    descripcion: Joi.string().max(500).allow('').optional().messages({
        'string.max': 'La descripción no puede superar 500 caracteres'
    }),
    cupoMaximo: Joi.number().integer().min(1).max(200).required().messages({
        'number.base': 'El cupo máximo debe ser un número',
        'number.integer': 'El cupo máximo debe ser un número entero',
        'number.min': 'El cupo debe ser al menos 1',
        'number.max': 'El cupo no puede superar 200',
        'any.required': 'El cupo máximo es obligatorio'
    }),
    diasHorarios: diasHorariosSchema.required().messages({
        'any.required': 'Los horarios son obligatorios'
    }),
    imagen: Joi.string().uri().allow('', null).optional().messages({
        'string.uri': 'La imagen debe ser una URL válida'
    }),
    categoriaId: Joi.string().allow('', null).optional()
});

// Esquema para actualizar clase (todos los campos opcionales, mínimo 1)
const updateClassSchema = Joi.object({
    nombre: Joi.string().min(2).max(100).messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede superar 100 caracteres'
    }),
    descripcion: Joi.string().max(500).allow('').messages({
        'string.max': 'La descripción no puede superar 500 caracteres'
    }),
    cupoMaximo: Joi.number().integer().min(1).max(200).messages({
        'number.base': 'El cupo máximo debe ser un número',
        'number.integer': 'El cupo máximo debe ser un número entero',
        'number.min': 'El cupo debe ser al menos 1',
        'number.max': 'El cupo no puede superar 200'
    }),
    diasHorarios: diasHorariosSchema,
    imagen: Joi.string().uri().allow('', null).messages({
        'string.uri': 'La imagen debe ser una URL válida'
    })
}).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
});

// Esquema para toggle estado activa/inactiva
const toggleStatusSchema = Joi.object({
    activa: Joi.boolean().required().messages({
        'any.required': 'El estado activa es obligatorio',
        'boolean.base': 'El campo activa debe ser true o false'
    })
});

// Esquema para actualizar solo la imagen
const updateImageSchema = Joi.object({
    imageUrl: Joi.string().uri().required().messages({
        'string.uri': 'La URL de la imagen debe ser válida',
        'any.required': 'La URL de la imagen es obligatoria'
    })
});

// Esquema para crear categoría
const createCategorySchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede superar 50 caracteres',
        'any.required': 'El nombre de la categoría es obligatorio'
    }),
    description: Joi.string().max(200).allow('').optional().messages({
        'string.max': 'La descripción no puede superar 200 caracteres'
    })
});

// Esquema para agregar usuario a lista de espera
const addToWaitlistSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'El ID del usuario es obligatorio'
    })
});

module.exports = {
    createClassSchema,
    updateClassSchema,
    toggleStatusSchema,
    updateImageSchema,
    createCategorySchema,
    addToWaitlistSchema,
    diasHorariosSchema,
    diasValidos
};

