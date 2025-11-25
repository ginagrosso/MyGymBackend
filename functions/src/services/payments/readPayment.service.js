const paymentsRepo = require('../../repositories/payments.repository');

/**
 * Obtener historial de pagos de un usuario.
 * Opcional: Filtrar por año.
 */
const getUserPaymentHistory = async (userId, year) => {
    console.log(`SERVICIO: Consultando historial para ${userId} (Año: ${year || 'Todos'})`);

    // 1. Obtener datos crudos del repositorio
    const rawPayments = await paymentsRepo.getPaymentsByUserFromDB(userId);

    if (!rawPayments) {
        return []; // Retornar array vacío si no hay datos (buena práctica UX)
    }

    // 2. Transformar Objeto de Firebase a Array
    // Firebase devuelve: { "id1": {data}, "id2": {data} }
    // Queremos: [ {id: "id1", ...data}, {id: "id2", ...data} ]
    const paymentsList = Object.keys(rawPayments).map(key => ({
        id: key,
        ...rawPayments[key]
    }));

    // 3. Filtrar por año si se solicitó
    if (year) {
        return paymentsList.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate.getFullYear().toString() === year.toString();
        });
    }

    // Si no hay filtro, retornar todo (invertir para mostrar el más reciente primero)
    return paymentsList.reverse();
};

/**
 * Obtener estado de cuenta actual del socio.
 * (Placeholder para futura implementación de deuda)
 */
const getUserPaymentStatus = async (userId) => {
    // TODO: Implementar lógica real de deuda
    return { status: 'active', message: 'Al día (Simulado)' }; 
};

module.exports = { 
    getUserPaymentHistory,
    getUserPaymentStatus 
};