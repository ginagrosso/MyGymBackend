const { db } = require('../utils/firebase');

/**
 * Guardar configuración financiera del gimnasio.
 * Ruta: gymSettings/{gymId}/finance
 */
const saveFinanceSettingsInDB = async (gymId, settings) => {
  console.log(`REPO: Guardando configuración financiera para gym ${gymId}`);
  await db.ref(`gymSettings/${gymId}/finance`).set(settings);
  return settings;
};

/**
 * Obtener configuración financiera.
 * Si no existe, devuelve valores por defecto.
 */
const getFinanceSettingsFromDB = async (gymId) => {
  const snapshot = await db.ref(`gymSettings/${gymId}/finance`).once('value');
  const settings = snapshot.val();

  // Valores por defecto si no hay config guardada
  if (!settings) {
    return {
      monthlyQuota: 0,
      expirationDays: 30, // Default estándar
      currency: 'ARS'
    };
  }
  return settings;
};

module.exports = {
  saveFinanceSettingsInDB,
  getFinanceSettingsFromDB
};