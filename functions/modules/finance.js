const express = require("express");
const cors = require("cors");
const financeService = require("../src/services/finance.service");
const { manualPaymentSchema } = require('../src/schemas/manualPayment.schema');
const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.use(validateFirebaseIdToken);

// --- CONFIGURACIÓN ---
app.get("/settings", async (req, res) => {
    try {
        const gymId = req.user.uid; 
        const settings = await financeService.getSettings(gymId);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(settings));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.put("/settings", async (req, res) => {
    try {
        const gymId = req.user.uid;
        const settings = await financeService.updateSettings(gymId, req.body);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(settings, "Configuración actualizada"));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

// --- DASHBOARD Y REPORTES (AHORA CON FILTRO DE ID) ---

app.get("/dashboard", async (req, res) => {
    try {
        const { period } = req.query;
        const gymId = req.user.uid; // <--- PASAMOS EL ID DEL USUARIO
        const dashboard = await financeService.getDashboardData(gymId, period);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(dashboard));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/transactions", async (req, res) => {
    try {
        const gymId = req.user.uid; // <--- PASAMOS EL ID
        const transactions = await financeService.getAllTransactions(gymId);
        
        const response = getSuccessResponseObject(transactions);
        response.count = transactions.length;
        return res.status(httpStatusCodes.ok).json(response);
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/reports/monthly", async (req, res) => {
    try {
        const { month, year } = req.query;
        const gymId = req.user.uid; // <--- PASAMOS EL ID

        if (!month || !year) {
            return res.status(httpStatusCodes.badRequest).json({ success: false, message: "Faltan datos" });
        }
        const report = await financeService.getMonthlyReport(gymId, month, year);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(report));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/invoices/:id", async (req, res) => {
    try {
        const gymId = req.user.uid; // <--- PASAMOS EL ID PARA VERIFICAR PROPIEDAD
        const invoice = await financeService.getInvoiceDetails(gymId, req.params.id);
        if (!invoice) {
            return res.status(httpStatusCodes.notFound).json({ success: false, message: "No encontrado" });
        }
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(invoice));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

// --- DEUDA Y PAGOS ---

app.get("/debtors", async (req, res) => {
    try {
        const gymId = req.user.uid; // <--- PASAMOS EL ID
        const debtors = await financeService.getDebtorsList(gymId);
        const response = getSuccessResponseObject(debtors);
        response.count = debtors.length;
        return res.status(httpStatusCodes.ok).json(response);
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.post("/reminders", async (req, res) => {
    try {
        const { userIds } = req.body;
        const gymId = req.user.uid; // <--- PASAMOS EL ID
        const result = await financeService.sendPaymentReminders(gymId, userIds);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(result, `Se enviaron recordatorios.`));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.post("/manual-payment", async (req, res) => {
    try {
        const { error, value } = manualPaymentSchema.validate(req.body);
        if (error) return res.status(httpStatusCodes.badRequest).json({ success: false, message: error.details[0].message });
        
        const gymId = req.user.uid; // El usuario logueado cobra
        const result = await financeService.registerManualPayment(gymId, value);
        
        return res.status(httpStatusCodes.created).json(getSuccessResponseObject(result, "Pago registrado"));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

module.exports = app;