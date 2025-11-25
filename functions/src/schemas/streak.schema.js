const Joi = require('joi');

const checkInSchema = Joi.object({
    userId: Joi.string().required().messages({
        'any.required': 'El userId es obligatorio'
    }),
    gymId: Joi.string().optional(),
    classId: Joi.string().optional(),
    code: Joi.string().optional()
});

module.exports = {
    checkInSchema
};