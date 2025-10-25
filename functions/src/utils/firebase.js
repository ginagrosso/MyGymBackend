const {initializeApp, getApp, getApps, cert } = require("firebase-admin/app");

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
module.exports = { firebaseAdmin };