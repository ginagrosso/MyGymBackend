const functions = require("firebase-functions");

/**
 * Exportar Módulos como Cloud Functions
 */

// --- DOMINIO FINANCIERO (Tus módulos - Esteban) ---
// Usamos 'functions.https.onRequest' para envolver la app de Express
exports.payments = functions.https.onRequest(require('./modules/payments'));
exports.finance = functions.https.onRequest(require('./modules/finance'));

// --- OTROS DOMINIOS (Traídos de la rama develop) ---
// Adaptamos la sintaxis para que funcionen como Cloud Functions HTTP

// Módulos activos en develop:
// Nota: Si alguno de estos archivos no existe en tu carpeta modules, coméntalo.
exports.registrations = functions.https.onRequest(require('./modules/registrations'));
exports.exercises = functions.https.onRequest(require('./modules/exercises'));
exports.routines = functions.https.onRequest(require('./modules/routines'));
exports.streaks = functions.https.onRequest(require('./modules/streaks'));

// Módulos que venían comentados o inactivos en develop:
// exports.users = functions.https.onRequest(require('./modules/users'));
// exports.gyms = functions.https.onRequest(require('./modules/gyms'));
// exports.classes = functions.https.onRequest(require('./modules/classes'));

// Nota sobre Memberships: Hubo un conflicto de renombrado/borrado. 
// Si decides usarlo, descomenta la siguiente línea:
// exports.memberships = functions.https.onRequest(require('./modules/memberships'));