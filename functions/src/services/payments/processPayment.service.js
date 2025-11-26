const paymentsRepo = require('../../repositories/payments.repository');

const processNewPayment = async (data) => {
    console.log('SERVICIO: Iniciando procesamiento de pago', data);

    const isPaymentApproved = true;

    if (!isPaymentApproved) {
        throw new Error("El pago fue rechazado por la entidad financiera.");
    }

    const paymentRecord = {
        amount: data.amount,
        method: data.method,
        gymId: data.gymId,
        concept: data.concept || 'Pago mensual',
        transactionToken: data.token
    };

    const savedPayment = await paymentsRepo.recordPaymentInDB(data.userId, paymentRecord);

    return savedPayment;
};

module.exports = {
    processNewPayment
};