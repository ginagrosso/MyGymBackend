const paymentsRepo = require('../../repositories/payments.repository');

/**
 * Lógica de negocio para procesar un nuevo pago.
 * Aquí es donde en el futuro conectarías con Mercado Pago real.
 */
const processNewPayment = async (data) => {
    console.log('SERVICIO: Iniciando procesamiento de pago', data);

    // 1. Aquí iría la lógica de validación con la pasarela de pago (Mercado Pago)
    // Por ahora, simularemos que el token es válido y el pago fue exitoso.
    const isPaymentApproved = true; // Simulación

    if (!isPaymentApproved) {
        throw new Error("El pago fue rechazado por la entidad financiera.");
    }

    // 2. Preparar datos para guardar (sanitización)
    const paymentRecord = {
        amount: data.amount,
        method: data.method,
        gymId: data.gymId,
        concept: data.concept || 'Pago mensual',
        transactionToken: data.token // Guardamos referencia del token (o ID de transacción)
    };

    // 3. Guardar en base de datos usando el repositorio
    const savedPayment = await paymentsRepo.recordPaymentInDB(data.userId, paymentRecord);

    return savedPayment;
};

module.exports = {
    processNewPayment
};