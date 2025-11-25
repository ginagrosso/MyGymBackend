const functions = require("firebase-functions");

/**
 * Exportar Módulos como Cloud Functions
 * * Cada export convierte tu aplicación Express (definida en /modules)
 * en una función HTTPS de Firebase.
 */

// 1. Módulo de Pagos (Dominio Financiero - Esteban)
// Usamos 'functions.https.onRequest' para envolver la app de Express
exports.payments = functions.https.onRequest(require('./modules/payments'));

// 2. Otros módulos (Descomentar a medida que se implementen realmente)
// Nota: Si los archivos solo tienen comentarios y no código real, darán error al descomentarlos.
// Por ahora los dejamos comentados para que el emulador no falle.

// exports.users = functions.https.onRequest(require('./modules/users'));
// exports.gyms = functions.https.onRequest(require('./modules/gyms'));
// exports.memberships = functions.https.onRequest(require('./modules/memberships')); // Recuerda renombrar el archivo primero
// exports.exercises = functions.https.onRequest(require('./modules/exercises'));
// exports.routines = functions.https.onRequest(require('./modules/routines'));
// exports.streaks = functions.https.onRequest(require('./modules/streaks'));
// exports.classes = functions.https.onRequest(require('./modules/classes'));