//updateClass.service.js:
//Función updateClass(classId, data): (Lógica: Llama a classesRepo.updateClassInDB(classId, data)).
//Función enrollUser(data): (Lógica: Llama a classesRepo.getClassDetailsFromDB para ver cupos, luego classesRepo.getEnrolledUsersCount. Si hay lugar, llama a classesRepo.enrollUserToClassInDB).
//Función unenrollUser(data): (Lógica: Llama a classesRepo.unenrollUserFromClassInDB).
//Exportar { updateClass, enrollUser, unenrollUser }.