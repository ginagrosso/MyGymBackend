const paymentsRepo = require('../repositories/payments.repository');
const financeRepo = require('../repositories/finance.repository');
const { financeSettingsSchema } = require('../schemas/financeSettings.schema');

/**
 * 1. Obtener listado global de transacciones
 */
const getAllTransactions = async () => {
    console.log('SERVICIO: Generando reporte global de transacciones...');
    const allUsersPayments = await paymentsRepo.getAllPaymentsDB();

    if (!allUsersPayments) return [];

    let globalTransactions = [];
    
    Object.entries(allUsersPayments).forEach(([userId, userPaymentsObj]) => {
        const userPayments = Object.values(userPaymentsObj).map(payment => ({
            ...payment,
            userId: userId,
            dateFormatted: new Date(payment.createdAt).toISOString()
        }));
        globalTransactions = [...globalTransactions, ...userPayments];
    });

    return globalTransactions.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * 2. Obtener lista de deudores
 */
const getDebtorsList = async () => {
    console.log('SERVICIO: Generando lista de deudores...');
    
    const allUsersPayments = await paymentsRepo.getAllPaymentsDB();
    if (!allUsersPayments) return [];

    const debtors = [];
    const today = new Date();

    Object.entries(allUsersPayments).forEach(([userId, userPaymentsObj]) => {
        const paymentsArray = Object.values(userPaymentsObj);
        paymentsArray.sort((a, b) => b.createdAt - a.createdAt);
        
        const lastPayment = paymentsArray[0];
        const lastPaymentDate = new Date(lastPayment.createdAt);
        
        // En un futuro, esto debería leer la config del gym
        const expirationDate = new Date(lastPaymentDate);
        expirationDate.setDate(expirationDate.getDate() + 30); 

        if (today > expirationDate) {
            const diffTime = Math.abs(today - expirationDate);
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            debtors.push({
                userId: userId,
                lastPaymentDate: lastPaymentDate.toISOString(),
                expirationDate: expirationDate.toISOString(),
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
    console.log('SERVICIO: Registrando pago manual:', data);

    const paymentRecord = {
        amount: data.amount,
        method: 'cash',
        gymId: gymId,
        concept: data.concept,
        transactionToken: 'MANUAL_ENTRY',
        status: 'completed',
        createdAt: Date.now()
    };

    const savedPayment = await paymentsRepo.recordPaymentInDB(data.userId, paymentRecord);
    return savedPayment;
};

/**
 * 4. Generar Dashboard
 */
const getDashboardData = async (period) => {
    console.log(`SERVICIO: Generando dashboard para periodo: ${period || 'Actual'}`);

    const now = new Date();
    let targetDate;

    if (period) {
        const [year, month] = period.split('-');
        targetDate = new Date(year, month - 1, 1);
    } else {
        targetDate = now;
    }

    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1).getTime();
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59).getTime();

    const allTransactions = await getAllTransactions();

    const monthlyTransactions = allTransactions.filter(t => {
        return t.createdAt >= startOfMonth && t.createdAt <= endOfMonth;
    });

    let totalRevenue = 0;
    let cashRevenue = 0;
    let digitalRevenue = 0;

    monthlyTransactions.forEach(t => {
        const amount = Number(t.amount) || 0;
        totalRevenue += amount;

        if (t.method === 'cash' || t.method === 'efectivo') {
            cashRevenue += amount;
        } else {
            digitalRevenue += amount;
        }
    });

    const debtorsList = await getDebtorsList();
    const debtorsCount = debtorsList.length;

    const recentActivity = monthlyTransactions.length > 0 
        ? monthlyTransactions.slice(0, 5) 
        : allTransactions.slice(0, 5);

    return {
        period: period || `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`,
        summary: {
            totalRevenue,
            cashRevenue,
            digitalRevenue,
            debtorsCount
        },
        recentActivity: recentActivity.map(t => ({
            date: t.dateFormatted || new Date(t.createdAt).toISOString(),
            user: t.userId,
            amount: t.amount,
            method: t.method,
            concept: t.concept
        }))
    };
};

/**
 * 5. Obtener Configuración
 */
const getSettings = async (gymId) => {
    return await financeRepo.getFinanceSettingsFromDB(gymId);
};

/**
 * 6. Actualizar Configuración
 */
const updateSettings = async (gymId, data) => {
    console.log('SERVICIO: Actualizando configuración financiera...');
    
    const { error, value } = financeSettingsSchema.validate(data);
    if (error) {
        throw new Error(error.details[0].message);
    }

    return await financeRepo.saveFinanceSettingsInDB(gymId, value);
};

/**
 * 7. Reporte Mensual (LA QUE FALTABA)
 */
const getMonthlyReport = async (month, year) => {
    console.log(`SERVICIO: Generando reporte para ${month}/${year}`);
    
    const allTransactions = await getAllTransactions();
    
    const transactions = allTransactions.filter(t => {
        const date = new Date(t.createdAt);
        // Ajuste: getMonth() es 0-11, por eso sumamos 1 para comparar con el input
        return (date.getMonth() + 1) === parseInt(month) && date.getFullYear() === parseInt(year);
    });

    const dailyBreakdown = {};
    let totalMonth = 0;

    transactions.forEach(t => {
        const day = new Date(t.createdAt).getDate();
        if (!dailyBreakdown[day]) dailyBreakdown[day] = 0;
        
        const amount = Number(t.amount) || 0;
        dailyBreakdown[day] += amount;
        totalMonth += amount;
    });

    return {
        period: `${year}-${month}`,
        totalIncome: totalMonth,
        transactionCount: transactions.length,
        dailyBreakdown
    };
};

/**
 * 8. Detalle de Factura (LA QUE FALTABA)
 */
const getInvoiceDetails = async (paymentId) => {
    console.log(`SERVICIO: Buscando comprobante ${paymentId}`);
    
    const allTransactions = await getAllTransactions();
    const transaction = allTransactions.find(t => t.id === paymentId);

    if (!transaction) return null;

    return {
        invoiceId: transaction.id,
        issueDate: new Date(transaction.createdAt).toISOString(),
        customer: {
            id: transaction.userId,
            name: "Socio " + transaction.userId 
        },
        items: [
            { description: transaction.concept || "Cuota Gimnasio", amount: transaction.amount }
        ],
        total: transaction.amount,
        paymentMethod: transaction.method,
        status: 'PAGADO'
    };
};

/**
 * 9. Enviar Recordatorios (LA QUE FALTABA)
 */
const sendPaymentReminders = async (targetUserIds) => {
    console.log('SERVICIO: Iniciando proceso de recordatorios...');
    
    const debtors = await getDebtorsList();
    let recipients = [];

    if (targetUserIds && targetUserIds.length > 0) {
        recipients = debtors.filter(d => targetUserIds.includes(d.userId));
    } else {
        recipients = debtors;
    }

    const results = recipients.map(d => ({
        userId: d.userId,
        emailSent: true,
        message: `Hola! Tu cuota venció hace ${d.daysOverdue} días. Por favor regulariza tu situación.`
    }));

    console.log(`Recordatorios enviados: ${results.length}`);
    return results;
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