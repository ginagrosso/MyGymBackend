//source/repository/streaks.repository.js
// Propósito: Registrar y leer los check-ins de asistencia.Importaciones: db (de ../utils/firebase).
// Función createCheckInInDB(userId, dateString):Usa db.ref(checkIns/${userId}/${dateString}).set(true). (El dateString debe ser formato YYYY-MM-DD).
// Función getAllUserCheckInsFromDB(userId):Usa db.ref(checkIns/${userId}).orderByKey().once('value'). (Ordena por fecha).Devuelve snapshot.val().
// Exportar: { createCheckInInDB, getAllUserCheckInsFromDB }.