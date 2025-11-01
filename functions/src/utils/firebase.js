const {initializeApp, getApp, getApps, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");

require("dotenv").config(); // Carga el .env directamente aquí

let firebaseAdmin;

if (getApps().length === 0) {
    firebaseAdmin = initializeApp({
        credential: cert(`./permissions/${process.env.CREDENTIAL_FILE_NAME}`),
        databaseURL: process.env.REAL_TIME_DATABASE_FIREBASE_DATABASE_URL,
    });
} else {
    firebaseAdmin = getApp();
}

// Obtener la instancia de la base de datos que será usada por el Repositorio
const db = getDatabase(firebaseAdmin); 
module.exports = { firebaseAdmin, db };