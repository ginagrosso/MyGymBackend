//source/services/payments.service.js
//Importar createMercadoPagoPreference desde ./payments/createPreference.service.js.
//Importar receiveMercadoPagoWebhook desde ./payments/receiveWebhook.service.js.
//Importar getUserPaymentStatus desde ./payments/getUserPaymentStatus.service.js.
//Exportar { ...createPreferenceService, ...receiveWebhookService, ...getUserPaymentStatusService }.

// Importamos los servicios individuales
const { createMercadoPagoPreference } = require('./payments/createPayment.service');
const { receiveMercadoPagoWebhook } = require('./payments/webhookPayment.service'); // Asumiendo que este es el nombre correcto basado en tus archivos
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