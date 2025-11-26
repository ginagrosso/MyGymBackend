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

app.get("/settings", async (req, res) => {
    try {
        const gymId = req.user.uid; 
        const settings = await financeService.getSettings(gymId);
        
        const response = getSuccessResponseObject(settings);
        return res.status(httpStatusCodes.ok).json(response);
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.put("/settings", async (req, res) => {
    try {
        const gymId = req.user.uid;
        const settings = await financeService.updateSettings(gymId, req.body);
        
        const response = getSuccessResponseObject(settings, "Configuración actualizada correctamente");
        return res.status(httpStatusCodes.ok).json(response);
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

app.get("/dashboard", async (req, res) => {
    try {
        const { period } = req.query;
        const dashboard = await financeService.getDashboardData(period);
        
        const response = getSuccessResponseObject(dashboard);
        return res.status(httpStatusCodes.ok).json(response);
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/transactions", async (req, res) => {
    try {
        const transactions = await financeService.getAllTransactions();
        
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
        if (!month || !year) {
            return res.status(httpStatusCodes.badRequest).json({ 
                success: false, 
                message: "Faltan los parámetros month o year" 
            });
        }
        const report = await financeService.getMonthlyReport(month, year);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(report));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/invoices/:id", async (req, res) => {
    try {
        const invoice = await financeService.getInvoiceDetails(req.params.id);
        if (!invoice) {
            return res.status(httpStatusCodes.notFound).json({ success: false, message: "Comprobante no encontrado" });
        }
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(invoice));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/debtors", async (req, res) => {
    try {
        const debtors = await financeService.getDebtorsList();
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
        const result = await financeService.sendPaymentReminders(userIds);
        
        const response = getSuccessResponseObject(result, `Se enviaron ${result.length} recordatorios exitosamente.`);
        return res.status(httpStatusCodes.ok).json(response);
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.post("/manual-payment", async (req, res) => {
    try {
        const { error, value } = manualPaymentSchema.validate(req.body);
        if (error) {
            return res.status(httpStatusCodes.badRequest).json({ success: false, message: error.details[0].message });
        }
        
        const gymId = req.user.uid;
        
        const result = await financeService.registerManualPayment(gymId, value);
        
        return res.status(httpStatusCodes.created).json(getSuccessResponseObject(result, "Pago manual registrado correctamente"));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

module.exports = app;