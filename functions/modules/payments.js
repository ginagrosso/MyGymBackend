const express = require("express");
const cors = require("cors");
const paymentService = require("../src/services/payments.service");
const { processPaymentSchema } = require("../src/schemas/payment.schema");

const { validateFirebaseIdToken } = require('../src/middlewares/auth.middleware');
const { getSuccessResponseObject, getErrorResponseObject } = require('../src/utils/responseHelpers');
const { httpStatusCodes } = require('../src/utils/httpStatusCodes');

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.use(validateFirebaseIdToken);

app.post("/process", async (req, res) => {
    try {
        const dataToValidate = {
            ...req.body,
            userId: req.user.uid 
        };

        const { error, value } = processPaymentSchema.validate(dataToValidate);

        if (error) {
            return res.status(httpStatusCodes.badRequest).json({
                success: false,
                message: error.details[0].message 
            });
        }

        const result = await paymentService.processNewPayment(value);

        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(result, "Pago procesado con éxito"));

    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/history", async (req, res) => {
    try {
        const userId = req.user.uid;
        const { year } = req.query;

        const history = await paymentService.getUserPaymentHistory(userId, year);

        const response = getSuccessResponseObject(history);
        response.count = history.length;

        return res.status(httpStatusCodes.ok).json(response);

    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/status", async (req, res) => {
    try {
        const userId = req.user.uid;

        const status = await paymentService.getUserPaymentStatus(userId);

        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(status));

    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.get("/methods", async (req, res) => {
    try {
        const userId = req.user.uid;
        const methods = await paymentService.getUserMethods(userId);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(methods));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

app.post("/methods", async (req, res) => {
    try {
        const data = { ...req.body, userId: req.user.uid };
        
        const result = await paymentService.addPaymentMethod(data);
        return res.status(httpStatusCodes.created).json(getSuccessResponseObject(result, "Método agregado"));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 400).json(errorResponse);
    }
});

app.delete("/methods/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;
        
        await paymentService.removePaymentMethod(userId, id);
        return res.status(httpStatusCodes.ok).json(getSuccessResponseObject(null, "Eliminado"));
    } catch (err) {
        const errorResponse = getErrorResponseObject(err);
        return res.status(errorResponse.statusCode || 500).json(errorResponse);
    }
});

module.exports = app;