// //source/repository/gyms.repository.js
// Propósito: Manejar los perfiles públicos de los gimnasios.
// 
// Importaciones: db (de ../utils/firebase).
// 
// Función createGymProfileInDB(uid, data):
// 
// Define fullData = { ...data, uid, createdAt: Date.now(), isActive: true }.
// 
// Usa db.ref(gyms/${uid}).set(fullData).
// 
// Devuelve fullData.
// 
// Función getGymProfileFromDB(uid):
// 
// Usa db.ref(gyms/${uid}).once('value').
// 
// Devuelve snapshot.val().
// 
// Función updateGymProfileInDB(uid, data):
// 
// Usa db.ref(gyms/${uid}).update(data).
// 
// Devuelve el resultado de getGymProfileFromDB(uid) para obtener el objeto actualizado.
// 
// Exportar: Todas las funciones (createGymProfileInDB, getGymProfileFromDB, updateGymProfileInDB).

const { db } = require('../utils/firebase');

// Crear perfil de gimnasio en la base de datos
const createGymProfileInDB = async (useId, data) => {
    
}