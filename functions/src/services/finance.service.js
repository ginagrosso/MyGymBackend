const paymentsRepo = require('../repositories/payments.repository');
const financeRepo = require('../repositories/finance.repository');
const { financeSettingsSchema } = require('../schemas/financeSettings.schema');

/**
 * 1. Obtener transacciones (Filtradas por Gym)
 */
const getAllTransactions = async (gymId, preFetchedData = null) => {
    console.log(`SERVICIO: Obteniendo transacciones para gym: ${gymId}`);
    
    const allUsersPayments = preFetchedData || await paymentsRepo.getAllPaymentsDB();
    if (!allUsersPayments) return [];

    let globalTransactions = [];
    
    Object.entries(allUsersPayments).forEach(([userId, userPaymentsObj]) => {
        // FILTRO CRÍTICO: Solo incluimos pagos donde payment.gymId coincida con quien consulta
        const userPayments = Object.values(userPaymentsObj)
            .filter(payment => payment.gymId === gymId) // <--- ¡AQUÍ ESTÁ EL CANDADO! 🔒
            .map(payment => ({
                ...payment,
                userId: userId,
                dateFormatted: new Date(payment.createdAt).toISOString()
            }));
        
        if (userPayments.length > 0) {
            globalTransactions = [...globalTransactions, ...userPayments];
        }
    });

    return globalTransactions.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * 2. Obtener deudores (Filtrados por Gym)
 */
const getDebtorsList = async (gymId, preFetchedData = null) => {
    console.log(`SERVICIO: Calculando deudores para gym: ${gymId}`);
    
    const allUsersPayments = preFetchedData || await paymentsRepo.getAllPaymentsDB();
    if (!allUsersPayments) return [];

    const debtors = [];
    const today = new Date();

    Object.entries(allUsersPayments).forEach(([userId, userPaymentsObj]) => {
        // 1. Obtener pagos de ESTE usuario para ESTE gym
        const paymentsArray = Object.values(userPaymentsObj)
            .filter(payment => payment.gymId === gymId) // <--- FILTRO 🔒
            .sort((a, b) => b.createdAt - a.createdAt);
        
        // Si el usuario nunca pagó a ESTE gym, no podemos calcular deuda con esta lógica
        // (Se asume que solo clientes con historial cuentan)
        if (paymentsArray.length === 0) return; 

        const lastPayment = paymentsArray[0];
        const lastPaymentDate = new Date(lastPayment.createdAt);
        
        const expirationDate = new Date(lastPaymentDate);
        expirationDate.setDate(expirationDate.getDate() + 30); 

        if (today > expirationDate) {
            const diffTime = Math.abs(today - expirationDate);
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            debtors.push({
                userId: userId,
                lastPaymentDate: lastPaymentDate.toISOString(),
                daysOverdue: daysOverdue,
                status: 'overdue'
            });
        }
    });

    return debtors.sort((a, b) => b.daysOverdue - a.daysOverdue);
};

/**
 * 3. Registrar pago manual
 */
const registerManualPayment = async (gymId, data) => {
    const paymentRecord = {
        amount: data.amount,
        method: 'cash',
        gymId: gymId, // Se guarda quién cobró
        concept: data.concept,
        transactionToken: 'MANUAL_ENTRY',
        status: 'completed',
        createdAt: Date.now()
    };
    return await paymentsRepo.recordPaymentInDB(data.userId, paymentRecord);
};

/**
 * 4. Generar Dashboard (Ahora multi-tenant)
 */
const getDashboardData = async (gymId, period) => {
    console.log(`SERVICIO: Dashboard para gym ${gymId}, periodo ${period || 'Actual'}`);

    // Bajamos todo una vez, pero las funciones de abajo filtrarán lo que no es nuestro
    const allRawData = await paymentsRepo.getAllPaymentsDB();

    const now = new Date();
    let targetDate = period ? new Date(period.split('-')[0], period.split('-')[1] - 1, 1) : now;
    
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).getTime();
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).getTime();

    // Obtenemos SOLO las transacciones de ESTE gym
    const allTransactions = await getAllTransactions(gymId, allRawData);

    const monthlyTransactions = allTransactions.filter(t => {
        return t.createdAt >= startOfMonth && t.createdAt <= endOfMonth;
    });

    let totalRevenue = 0;
    let cashRevenue = 0;
    let digitalRevenue = 0;

    monthlyTransactions.forEach(t => {
        const amount = Number(t.amount) || 0;
        totalRevenue += amount;
        (t.method === 'cash' || t.method === 'efectivo') ? cashRevenue += amount : digitalRevenue += amount;
    });

    // Obtenemos SOLO los deudores de ESTE gym
    const debtorsList = await getDebtorsList(gymId, allRawData);

    return {
        period: period || `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
        summary: {
            totalRevenue,
            cashRevenue,
            digitalRevenue,
            debtorsCount: debtorsList.length
        },
        recentActivity: monthlyTransactions.slice(0, 5)
    };
};

// ... (getSettings y updateSettings quedan igual) ...
const getSettings = async (gymId) => {
    return await financeRepo.getFinanceSettingsFromDB(gymId);
};

const updateSettings = async (gymId, data) => {
    const { error, value } = financeSettingsSchema.validate(data);
    if (error) throw new Error(error.details[0].message);
    return await financeRepo.saveFinanceSettingsInDB(gymId, value);
};

/**
 * 7. Reporte Mensual (Filtrado)
 */
const getMonthlyReport = async (gymId, month, year) => {
    const allTransactions = await getAllTransactions(gymId); // Filtra por gymId
    
    const transactions = allTransactions.filter(t => {
        const date = new Date(t.createdAt);
        return (date.getMonth() + 1) === parseInt(month) && date.getFullYear() === parseInt(year);
    });

    const dailyBreakdown = {};
    let totalMonth = 0;

    transactions.forEach(t => {
        const day = new Date(t.createdAt).getDate();
        dailyBreakdown[day] = (dailyBreakdown[day] || 0) + (Number(t.amount) || 0);
        totalMonth += (Number(t.amount) || 0);
    });

    return { period: `${year}-${month}`, totalIncome: totalMonth, transactionCount: transactions.length, dailyBreakdown };
};

/**
 * 8. Detalle de Factura (Seguro)
 */
const getInvoiceDetails = async (gymId, paymentId) => {
    const allTransactions = await getAllTransactions(gymId); // Solo busca en MIS pagos
    const transaction = allTransactions.find(t => t.id === paymentId);

    if (!transaction) return null;

    return {
        invoiceId: transaction.id,
        issueDate: new Date(transaction.createdAt).toISOString(),
        customer: { id: transaction.userId, name: "Socio " + transaction.userId },
        items: [{ description: transaction.concept || "Cuota", amount: transaction.amount }],
        total: transaction.amount,
        paymentMethod: transaction.method,
        status: 'PAGADO'
    };
};

/**
 * 9. Recordatorios (Filtrados)
 */
const sendPaymentReminders = async (gymId, targetUserIds) => {
    const debtors = await getDebtorsList(gymId); // Solo mis deudores
    let recipients = targetUserIds && targetUserIds.length > 0 
        ? debtors.filter(d => targetUserIds.includes(d.userId))
        : debtors;

    return recipients.map(d => ({ userId: d.userId, emailSent: true, message: `Tu cuota venció hace ${d.daysOverdue} días.` }));
};

module.exports = {
    getAllTransactions,
    getDebtorsList,
    registerManualPayment,
    getDashboardData,
    getSettings,
    updateSettings,
    getMonthlyReport,
    getInvoiceDetails,
    sendPaymentReminders
};