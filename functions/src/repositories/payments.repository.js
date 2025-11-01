//source/repository/payments.repository.js
//Propósito: Guardar un historial de transacciones.
// 
//Importaciones: db (de ../utils/firebase).
// 
//Función recordPaymentInDB(userId, paymentData):
// 
//Usa db.ref(userPayments/${userId}).push(paymentData).
// 
//Devuelve el paymentData.
// 
//Exportar: { recordPaymentInDB }.