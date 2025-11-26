const {initializeApp, getApp, getApps, cert } = require("firebase-admin/app");
const { getDatabase } = require("firebase-admin/database");
const path = require('path');

if (!process.env.CREDENTIAL_FILE_NAME) {
 const dotenvPath = path.resolve(__dirname, '../../.env');
 require("dotenv").config({ path: dotenvPath });
}

let firebaseAdmin;

try {
    if (getApps().length === 0) {
        const credentialPath = path.resolve(
            __dirname, 
            '../../permissions', 
            process.env.CREDENTIAL_FILE_NAME || 'mygym-912d1-firebase-adminsdk-fbsvc-5101a7172c.json'
        );

        firebaseAdmin = initializeApp({
            credential: cert(credentialPath),
            databaseURL: process.env.REAL_TIME_DATABASE_FIREBASE_DATABASE_URL,
        });
    } else {
        firebaseAdmin = getApp();
    }
} catch (error) {
    console.error('ERROR INICIALIZANDO FIREBASE:', error);
    throw error;
}

// Obtener la instancia de la base de datos que será usada por el Repositorio
const db = getDatabase(firebaseAdmin); 
module.exports = { firebaseAdmin, db };