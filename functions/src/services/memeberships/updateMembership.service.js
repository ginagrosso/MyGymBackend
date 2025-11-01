//updateMembership.service.js:
//Función removeMemberFromGym(data): (Lógica: Llama a membershipsRepo.updateMembershipInDB(data.gymId, data.userId, { isActive: false, removedAt: Date.now() })).
//Exportar { removeMemberFromGym }.