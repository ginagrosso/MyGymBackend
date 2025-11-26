const paymentsRepo = require('../../repositories/payments.repository');
// 1. Importamos el repositorio de tus compañeros
const gymsRepo = require('../../repositories/gyms.repository'); 
const usersRepo = require('../../repositories/users.repository');
const { ResourceNotFoundError } = require('../../utils/httpStatusCodes');

const processNewPayment = async (data) => {
    console.log('SERVICIO: Iniciando procesamiento de pago', data);

    // 2. VALIDACIÓN REAL: Verificar que el gimnasio exista
    const gymExists = await gymsRepo.getGymProfileFromDB(data.gymId);
    if (!gymExists) {
        throw new ResourceNotFoundError("El gimnasio indicado no existe o no es válido.");
    }

    // Simulación de pago aprobado
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

    // 2. INTEGRACIÓN: Actualizar el perfil del usuario para reflejar el pago
    try {
        await usersRepo.updateUserProfileInDB(data.userId, {
            paymentStatus: 'active',
            lastPaymentDate: Date.now()
        });
        console.log(`Perfil de usuario ${data.userId} actualizado a 'active'`);
    } catch (error) {
        // No fallamos todo el proceso si esto falla, pero lo logueamos
        console.error("Advertencia: No se pudo actualizar el estado del usuario", error);
    }
    return savedPayment;
};

module.exports = { processNewPayment };