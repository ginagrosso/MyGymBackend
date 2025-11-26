

const { db } = require('../utils/firebase');


const recordPaymentInDB = async (userId, paymentData) => {
  console.log(`REPO: Registrando pago para el usuario ${userId}`);

  const newPaymentRef = db.ref(`userPayments/${userId}`).push();

  const paymentWithMeta = {
    ...paymentData,
    id: newPaymentRef.key,
    createdAt: Date.now(),
    status: 'completed'
  };

  await newPaymentRef.set(paymentWithMeta);

  console.log(`REPO: Pago registrado con ID: ${newPaymentRef.key}`);
  return paymentWithMeta;
};


const getPaymentsByUserFromDB = async (userId) => {
  console.log(`REPO: Buscando pagos para el usuario ${userId}`);

  const ref = db.ref(`userPayments/${userId}`);
  const snapshot = await ref.orderByChild('createdAt').once('value');

  return snapshot.val();
};


const getAllPaymentsDB = async () => {
  console.log('REPO: Obteniendo TODAS las transacciones globales');
  const ref = db.ref('userPayments');
  const snapshot = await ref.once('value');
  return snapshot.val();
};

module.exports = {
  recordPaymentInDB,
  getPaymentsByUserFromDB,
  getAllPaymentsDB
};