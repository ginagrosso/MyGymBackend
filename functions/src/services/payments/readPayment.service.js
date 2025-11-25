const paymentsRepo = require('../../repositories/payments.repository');
const financeRepo = require('../../repositories/finance.repository');

/**
 * Obtener historial de pagos de un usuario.
 * Opcional: Filtrar por año.
 */
const getUserPaymentHistory = async (userId, year) => {
    console.log(`SERVICIO: Consultando historial para ${userId} (Año: ${year || 'Todos'})`);

    // 1. Obtener datos crudos del repositorio
    const rawPayments = await paymentsRepo.getPaymentsByUserFromDB(userId);

    if (!rawPayments) {
        return []; // Retornar array vacío si no hay datos
    }

    // 2. Transformar Objeto de Firebase a Array
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
 * MEJORA: Usa la configuración real del gimnasio para calcular vencimientos.
 */
const getUserPaymentStatus = async (userId) => {
    console.log(`SERVICIO: Calculando estado de cuenta para ${userId}`);

    // 1. Obtener historial
    const history = await getUserPaymentHistory(userId);
    
    // 2. Obtener configuración del gimnasio (Usamos ID fijo o lo sacamos del user)
    const gymId = "gym_admin_test"; 
    const settings = await financeRepo.getFinanceSettingsFromDB(gymId);
    
    // Usamos el valor configurado o 30 por defecto si falla la carga
    const daysToExpire = settings.expirationDays || 30;

    if (!history || history.length === 0) {
        return {
            status: 'overdue',
            message: 'No se registran pagos. Cuota pendiente.',
            daysOverdue: null,
            lastPaymentDate: null
        };
    }

    const lastPayment = history[0]; 
    const lastPaymentDate = new Date(lastPayment.createdAt);
    const today = new Date();

    // 3. CALCULO DINÁMICO USANDO SETTINGS
    const expirationDate = new Date(lastPaymentDate);
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);

    if (today > expirationDate) {
        // VENCIDO
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
        // AL DÍA
        const diffTime = Math.abs(expirationDate - today);
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            status: 'active',
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