// functions/index.js
const functions = require("firebase-functions");

// Exportar módulos como Cloud Functions
exports.auth = require('./modules/auth');
exports.users = require('./modules/users');
exports.gyms = require('./modules/gyms');
//exports.memberships = require('./modules/mermberships');
//exports.payments = require('./modules/payments');
//exports.exercises = require('./modules/exercises');
//exports.routines = require('./modules/routines');
//exports.streaks = require('./modules/streaks');
//exports.classes = require('./modules/classes');

// Nota sobre Memberships: Hubo un conflicto de renombrado/borrado. 
// Si decides usarlo, descomenta la siguiente línea:
// exports.memberships = functions.https.onRequest(require('./modules/memberships'));