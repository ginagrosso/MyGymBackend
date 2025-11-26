const Joi = require('joi');

const financeSettingsSchema = Joi.object({
  monthlyQuota: Joi.number().positive().required().messages({
    'any.required': 'El valor de la cuota mensual es obligatorio'
  }),
  expirationDays: Joi.number().integer().min(1).default(30).messages({
    'number.min': 'Los días de vencimiento deben ser al menos 1'
  }),
  surchargePercentage: Joi.number().min(0).default(0),
  currency: Joi.string().default('ARS')
});

module.exports = { financeSettingsSchema };