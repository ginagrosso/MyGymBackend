const express = require("express");
const cors = require("cors");
const paymentService = require("../src/services/payments.service");
const { processPaymentSchema } = require("../src/schemas/payment.schema");

const app = express();

app.use(cors({ origin: true })); 
app.use(express.json()); 


app.post("/process", async (req, res) => {
    try {
        // 1. Validar datos de entrada con Joi
        // .validate() devuelve un objeto con 'error' (si falla) y 'value' (los datos limpios)
        const { error, value } = processPaymentSchema.validate(req.body);

        if (error) {
            // Si el portero dice que no, detenemos todo aquí.
            // Devolver 400 (Bad Request) es el estándar para errores de validación.
            return res.status(400).json({
                success: false,
                message: error.details[0].message 
            });
        }

        // 2. Delegar al servicio
        // Nota: 'processNewPayment' aún no existe en tu service, lo crearemos en el paso 3.
        const result = await paymentService.processNewPayment(value);

        // 3. Responder al cliente
        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (err) {
        console.error("Error procesando pago:", err);
        // Devolver 500 (Internal Server Error) si algo explota en nuestro servidor
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor al procesar el pago."
        });
    }
});

/**
 * ENDPOINT: Historial de pagos
 * RUTA: GET /history
 * USO: /history?userId=usuario_test_01&year=2025
 */
app.get("/history", async (req, res) => {
    try {
        const { userId, year } = req.query;

        // Validar que userId esté presente (ya que por ahora es query param)
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Falta el parámetro userId (requerido en query)"
            });
        }

        // Delegar al servicio
        const history = await paymentService.getUserPaymentHistory(userId, year);

        return res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (err) {
        console.error("Error obteniendo historial:", err);
        return res.status(500).json({
            success: false,
            message: "Error interno al obtener el historial."
        });
    }
});

/**
 * ENDPOINT: Estado de Cuenta (¿Debe plata?)
 * RUTA: GET /status
 * USO: /status?userId=usuario_test_01
 */
app.get("/status", async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Falta el parámetro userId"
            });
        }

        const status = await paymentService.getUserPaymentStatus(userId);

        return res.status(200).json({
            success: true,
            data: status
        });

    } catch (err) {
        console.error("Error obteniendo estado:", err);
        return res.status(500).json({
            success: false,
            message: "Error interno al calcular el estado de cuenta."
        });
    }
});

/**
 * GET /methods
 * Query: userId
 */
app.get("/methods", async (req, res) => {
    try {
        const { userId } = req.query;
        const methods = await paymentService.getUserMethods(userId);
        return res.status(200).json({ success: true, data: methods });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /methods
 */
app.post("/methods", async (req, res) => {
    try {
        const result = await paymentService.addPaymentMethod(req.body);
        return res.status(201).json({ success: true, data: result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});

/**
 * DELETE /methods/:id
 * Query: userId (necesitamos saber de quién es para borrarlo de su ruta)
 */
app.delete("/methods/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        await paymentService.removePaymentMethod(userId, id);
        return res.status(200).json({ success: true, message: "Eliminado" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Exportar la app para que Firebase la use como Cloud Function
module.exports = app;