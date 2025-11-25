const Joi = require('joi');

const createExerciseSchema = Joi.object({
    nombre: Joi.string().min(3).required().messages({
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'any.required': 'El nombre es obligatorio'
    }),
    descripcion: Joi.string().optional().allow(''),
    categoria: Joi.string().valid('fuerza', 'cardio', 'flexibilidad', 'otro').required().messages({
        'any.required': 'La categoría es obligatoria',
        'any.only': 'Categoría inválida. Debe ser: fuerza, cardio, flexibilidad u otro'
    }),
    grupoMuscular: Joi.string().optional().allow(''),
    equipamiento: Joi.string().optional().allow(''),
    videoUrl: Joi.string().uri().optional().allow('').messages({
        'string.uri': 'La URL del video no es válida'
    }),
    imagenUrl: Joi.string().uri().optional().allow('').messages({
        'string.uri': 'La URL de la imagen no es válida'
    }),
    instrucciones: Joi.string().optional().allow('')
});

module.exports = {
    createExerciseSchema
};