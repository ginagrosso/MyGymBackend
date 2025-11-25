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

const { db } = require('../utils/firebase');

/**
 * Registrar un nuevo pago en la base de datos del usuario.
 * Ruta en DB: userPayments/{userId}/{paymentId}
 */
const recordPaymentInDB = async (userId, paymentData) => {
    console.log(`REPO: Registrando pago para el usuario ${userId}`);

    // Crear una referencia con una nueva clave única (push)
    const newPaymentRef = db.ref(`userPayments/${userId}`).push();
    
    // Agregar timestamps para ordenamiento
    const paymentWithMeta = {
        ...paymentData,
        id: newPaymentRef.key,
        createdAt: Date.now(),
        status: 'completed' // Por defecto completado para esta prueba
    };

    // Guardar en la base de datos
    await newPaymentRef.set(paymentWithMeta);

    console.log(`REPO: Pago registrado con ID: ${newPaymentRef.key}`);
    return paymentWithMeta;
};

module.exports = {
    recordPaymentInDB
};