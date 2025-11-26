const methodsRepo = require('../../repositories/paymentMethods.repository');
const { addPaymentMethodSchema } = require('../../schemas/paymentMethod.schema');

const addPaymentMethod = async (data) => {
  const { error, value } = addPaymentMethodSchema.validate(data);
  if (error) throw new Error(error.details[0].message);

  return await methodsRepo.savePaymentMethodInDB(value.userId, value);
};

const getUserMethods = async (userId) => {
  if (!userId) throw new Error("UserId requerido");

  const methods = await methodsRepo.getUserPaymentMethodsFromDB(userId);
  if (!methods) return [];

  return Object.keys(methods).map(key => ({
    id: key,
    ...methods[key]
  }));
};

const removePaymentMethod = async (userId, methodId) => {
  if (!userId || !methodId) throw new Error("Datos incompletos");
  return await methodsRepo.deletePaymentMethodFromDB(userId, methodId);
};

module.exports = {
  addPaymentMethod,
  getUserMethods,
  removePaymentMethod
};