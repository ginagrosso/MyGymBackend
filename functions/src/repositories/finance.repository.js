const { db } = require('../utils/firebase');

const saveFinanceSettingsInDB = async (gymId, settings) => {
  console.log(`REPO: Guardando configuración financiera para gym ${gymId}`);
  await db.ref(`gymSettings/${gymId}/finance`).set(settings);
  return settings;
};

const getFinanceSettingsFromDB = async (gymId) => {
  const snapshot = await db.ref(`gymSettings/${gymId}/finance`).once('value');
  const settings = snapshot.val();

  if (!settings) {
    return {
      monthlyQuota: 0,
      expirationDays: 30,
      currency: 'ARS'
    };
  }
  return settings;
};

module.exports = {
  saveFinanceSettingsInDB,
  getFinanceSettingsFromDB
};