const Joi = require('joi');

const createRoutineSchema = Joi.object({
    nombre: Joi.string().min(3).required().messages({
        'string.min': 'El nombre debe tener al menos 3 caracteres',
        'any.required': 'El nombre es obligatorio'
    }),
    descripcion: Joi.string().optional().allow(''),
    ejercicios: Joi.array().items(
        Joi.object({
            exerciseId: Joi.string().required(),
            sets: Joi.number().integer().min(1).required(),
            reps: Joi.number().integer().min(1).required(),
            weight: Joi.number().optional(),
            notes: Joi.string().optional()
        })
    ).min(1).required().messages({
        'array.min': 'Debe incluir al menos un ejercicio'
    })
});

const assignRoutineSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'El userId es obligatorio'
    }),
    routineId: Joi.string().required().messages({
        'any.required': 'El routineId es obligatorio'
    })
});

const logProgressSchema = Joi.object({
    exercises: Joi.array().items(
        Joi.object({
            exerciseId: Joi.string().required(),
            completedSets: Joi.number().integer().min(0).required(),
            completedReps: Joi.number().integer().min(0).optional(),
            weight: Joi.number().optional(),
            notes: Joi.string().optional().allow('')
        })
    ).min(1).required().messages({
        'array.min': 'Debe incluir al menos un ejercicio'
    }),
    notes: Joi.string().optional().allow('')
});

module.exports = {
    createRoutineSchema,
    assignRoutineSchema,
    logProgressSchema
};