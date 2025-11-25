//source/services/payments.service.js
//Importar createMercadoPagoPreference desde ./payments/createPreference.service.js.
//Importar receiveMercadoPagoWebhook desde ./payments/receiveWebhook.service.js.
//Importar getUserPaymentStatus desde ./payments/getUserPaymentStatus.service.js.
//Exportar { ...createPreferenceService, ...receiveWebhookService, ...getUserPaymentStatusService }.

// Importamos los servicios individuales
const { createMercadoPagoPreference } = require('./payments/createPayment.service');
const { receiveMercadoPagoWebhook } = require('./payments/webhookPayment.service'); // Asumiendo que este es el nombre correcto basado en tus archivos
const { getUserPaymentStatus } = require('./payments/readPayment.service');
// AGREGAMOS ESTA LÍNEA:
const { processNewPayment } = require('./payments/processPayment.service');

// Exportamos todo junto
module.exports = {
    createMercadoPagoPreference,
    receiveMercadoPagoWebhook,
    getUserPaymentStatus,
    processNewPayment // <--- Importante agregarlo aquí
};