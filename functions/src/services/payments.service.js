const { createMercadoPagoPreference } = require('./payments/createPayment.service');
const { receiveMercadoPagoWebhook } = require('./payments/webhookPayment.service');
const { getUserPaymentHistory, getUserPaymentStatus } = require('./payments/readPayment.service');
const { processNewPayment } = require('./payments/processPayment.service');
const { addPaymentMethod, getUserMethods, removePaymentMethod } = require('./payments/paymentMethods.service');

module.exports = {
  createMercadoPagoPreference,
  receiveMercadoPagoWebhook,
  getUserPaymentHistory,
  getUserPaymentStatus,
  processNewPayment,
  addPaymentMethod,
  getUserMethods,
  removePaymentMethod
};