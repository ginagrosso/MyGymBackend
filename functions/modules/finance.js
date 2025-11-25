const express = require("express");
const cors = require("cors");
const financeService = require("../src/services/finance.service");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ==========================================
// ⚙️ CONFIGURACIÓN (SETTINGS)
// ==========================================

/**
 * GET /settings
 * Obtener la configuración financiera del gimnasio
 */
app.get("/settings", async (req, res) => {
    try {
        // TODO: En producción, obtener gymId del token del usuario autenticado
        const gymId = "gym_admin_test"; 
        const settings = await financeService.getSettings(gymId);
        return res.status(200).json({ success: true, data: settings });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * PUT /settings
 * Actualizar reglas de negocio (valor cuota, vencimiento, etc.)
 */
app.put("/settings", async (req, res) => {
    try {
        const gymId = "gym_admin_test";
        const settings = await financeService.updateSettings(gymId, req.body);
        return res.status(200).json({ success: true, message: "Configuración actualizada correctamente", data: settings });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
});






// ==========================================
// 📊 DASHBOARD Y REPORTES
// ==========================================

/**
 * GET /dashboard
 * Resumen de KPIs financieros (Ingresos, Deudas, Actividad reciente)
 * Query: ?period=YYYY-MM (Opcional)
 */
app.get("/dashboard", async (req, res) => {
    try {
        const { period } = req.query;
        const dashboard = await financeService.getDashboardData(period);
        return res.status(200).json({ success: true, data: dashboard });
    } catch (err) {
        console.error("Error en dashboard:", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * ENDPOINT: Listado Global de Transacciones
 * RUTA: GET /transactions
 * USO: /transactions
 * DESCRIPCIÓN: Muestra todos los pagos de todos los usuarios.
 */
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await financeService.getAllTransactions();

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });

  } catch (err) {
    console.error("Error en reporte de transacciones:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno obteniendo las transacciones."
    });
  }
});

/**
 * GET /reports/monthly
 * Reporte detallado día por día para contabilidad
 * Query: ?month=11&year=2025
 */
app.get("/reports/monthly", async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res.status(400).json({ success: false, message: "Faltan los parámetros month o year" });
        }
        const report = await financeService.getMonthlyReport(month, year);
        return res.status(200).json({ success: true, data: report });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /invoices/:id
 * Detalle de un pago específico para comprobante
 */
app.get("/invoices/:id", async (req, res) => {
    try {
        const invoice = await financeService.getInvoiceDetails(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Comprobante no encontrado" });
        }
        return res.status(200).json({ success: true, data: invoice });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ==========================================
// 🚨 GESTIÓN DE DEUDA Y PAGOS MANUALES
// ==========================================

/**
 * GET /debtors
 * Lista de usuarios con cuota vencida
 */
app.get("/debtors", async (req, res) => {
    try {
        const debtors = await financeService.getDebtorsList();
        return res.status(200).json({ success: true, count: debtors.length, data: debtors });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /reminders
 * Enviar recordatorios a deudores
 * Body: { "userIds": ["uid1", "uid2"] } (Opcional, si no se envía, manda a todos)
 */
app.post("/reminders", async (req, res) => {
    try {
        const { userIds } = req.body;
        const result = await financeService.sendPaymentReminders(userIds);
        return res.status(200).json({ 
            success: true, 
            message: `Se enviaron ${result.length} recordatorios exitosamente.`, 
            details: result 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * POST /manual-payment
 * Registrar pago en efectivo/mostrador
 * Body: { "userId": "...", "amount": 5000, "concept": "..." }
 */
app.post("/manual-payment", async (req, res) => {
    try {
        const { error, value } = manualPaymentSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        
        const gymId = "gym_admin_test";
        const result = await financeService.registerManualPayment(gymId, value);
        
        return res.status(201).json({ 
            success: true, 
            message: "Pago manual registrado correctamente", 
            data: result 
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});


module.exports = app;