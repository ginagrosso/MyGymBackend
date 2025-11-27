// Importamos los servicios individuales activos
const { getUserPaymentHistory, getUserPaymentStatus } = require('./payments/readPayment.service');
const { processNewPayment } = require('./payments/processPayment.service');
const { addPaymentMethod, getUserMethods, removePaymentMethod } = require('./payments/paymentMethods.service');

// Exportamos todo junto
module.exports = {
  getUserPaymentHistory,
  getUserPaymentStatus,
  processNewPayment,
  addPaymentMethod,
  getUserMethods,
  removePaymentMethod
};