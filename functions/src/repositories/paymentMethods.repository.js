const { db } = require('../utils/firebase');

const savePaymentMethodInDB = async (userId, methodData) => {
  console.log(`REPO: Guardando método de pago para ${userId}`);
  const ref = db.ref(`userPaymentMethods/${userId}`).push();

  const methodWithId = {
    ...methodData,
    id: ref.key,
    createdAt: Date.now()
  };

  await ref.set(methodWithId);
  return methodWithId;
};

const getUserPaymentMethodsFromDB = async (userId) => {
  const snapshot = await db.ref(`userPaymentMethods/${userId}`).once('value');
  return snapshot.val();
};

const deletePaymentMethodFromDB = async (userId, methodId) => {
  console.log(`REPO: Eliminando método ${methodId} de usuario ${userId}`);
  await db.ref(`userPaymentMethods/${userId}/${methodId}`).remove();
  return true;
};

module.exports = {
  savePaymentMethodInDB,
  getUserPaymentMethodsFromDB,
  deletePaymentMethodFromDB
};