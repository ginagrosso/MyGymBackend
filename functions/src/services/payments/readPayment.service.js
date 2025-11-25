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
 * Calcula si está "Al día" o "Vencido" basándose en su último pago.
 */
const getUserPaymentStatus = async (userId) => {
    console.log(`SERVICIO: Calculando estado de cuenta para ${userId}`);

    // 1. Obtener historial completo
    // (Reutilizamos la función que ya creamos para no repetir código)
    const history = await getUserPaymentHistory(userId);

    // 2. Si no hay pagos, es un usuario nuevo o moroso histórico
    if (!history || history.length === 0) {
        return {
            status: 'overdue', // Vencido
            message: 'No se registran pagos. Cuota pendiente.',
            daysOverdue: null,
            lastPaymentDate: null
        };
    }

    // 3. Buscar el pago más reciente (El historial ya viene ordenado del más nuevo al más viejo)
    const lastPayment = history[0]; 
    const lastPaymentDate = new Date(lastPayment.createdAt);
    const today = new Date();

    // 4. Regla de Negocio: La cuota dura 30 días
    // Calculamos la fecha de vencimiento (Fecha pago + 30 días)
    const expirationDate = new Date(lastPaymentDate);
    expirationDate.setDate(expirationDate.getDate() + 30);

    // 5. Comparar fechas
    if (today > expirationDate) {
        // Si hoy es mayor que el vencimiento -> Está VENCIDO
        const diffTime = Math.abs(today - expirationDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        return {
            status: 'overdue',
            message: `Tu cuota venció hace ${diffDays} días.`,
            daysOverdue: diffDays,
            lastPaymentDate: lastPaymentDate.toISOString(),
            expirationDate: expirationDate.toISOString()
        };
    } else {
        // Si hoy es menor -> Está AL DÍA
        const diffTime = Math.abs(expirationDate - today);
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            status: 'active', // Al día
            message: `Cuota activa. Vence en ${daysRemaining} días.`,
            daysRemaining: daysRemaining,
            lastPaymentDate: lastPaymentDate.toISOString(),
            expirationDate: expirationDate.toISOString()
        };
    }
};

module.exports = { 
    getUserPaymentHistory,
    getUserPaymentStatus 
};