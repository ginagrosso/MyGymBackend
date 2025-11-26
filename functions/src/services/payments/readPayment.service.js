const paymentsRepo = require('../../repositories/payments.repository');
const financeRepo = require('../../repositories/finance.repository');

const getUserPaymentHistory = async (userId, year) => {
    console.log(`SERVICIO: Consultando historial para ${userId} (Año: ${year || 'Todos'})`);

    const rawPayments = await paymentsRepo.getPaymentsByUserFromDB(userId);

    if (!rawPayments) {
        return [];
    }

    const paymentsList = Object.keys(rawPayments).map(key => ({
        id: key,
        ...rawPayments[key]
    }));

    if (year) {
        return paymentsList.filter(payment => {
            const paymentDate = new Date(payment.createdAt);
            return paymentDate.getFullYear().toString() === year.toString();
        });
    }

    return paymentsList.reverse();
};

const getUserPaymentStatus = async (userId) => {
    console.log(`SERVICIO: Calculando estado de cuenta para ${userId}`);

    const history = await getUserPaymentHistory(userId);
    
    const gymId = "gym_admin_test"; 
    const settings = await financeRepo.getFinanceSettingsFromDB(gymId);
    
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

    const expirationDate = new Date(lastPaymentDate);
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);

    if (today > expirationDate) {
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