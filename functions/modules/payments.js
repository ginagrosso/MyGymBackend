//functions/modules/payments.js
//Importar express, cors, y el pasamano paymentService.
//Crear la app de Express: const app = express();.
//Endpoint POST /create-preference: (Para MetodoDePago.tsx) Llama a paymentService.createMercadoPagoPreference(req.body).
//Endpoint POST /webhook: (Requerido por Mercado Pago) Llama a paymentService.receiveMercadoPagoWebhook(req.body).
//Endpoint GET /status/:userId: (Para cuota.tsx) Llama a paymentService.getUserPaymentStatus(req.params.userId).
//Exportar app.

const express = require("express");
const cors = require("cors");
// Importamos el servicio (lógica de negocio)
const paymentService = require("../src/services/payments.service");
// Importamos tu esquema de validación (el "portero")
const { processPaymentSchema } = require("../src/schemas/payment.schema");

const app = express();

// Middleware automáticos
app.use(cors({ origin: true })); // Permitir peticiones de cualquier origen (útil para desarrollo)
app.use(express.json()); // Parsear automáticamente el cuerpo de las peticiones a JSON

/**
 * ENDPOINT: Procesar un nuevo pago
 * RUTA: POST /process (Se convierte en /payments/process al desplegar)
 */
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

// Exportar la app para que Firebase la use como Cloud Function
module.exports = app;