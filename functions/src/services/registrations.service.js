//source/services/memberships.service.js
//Importar getMembersByGym desde ./memberships/getMembersByGym.service.js.
//Importar addMemberToGym desde ./memberships/addMemberToGym.service.js.
//Importar removeMemberFromGym desde ./memberships/removeMemberFromGym.service.js.
//Exportar { ...getMembersByGymService, ...addMemberToGymService, ...removeMemberFromGymService }.

const { createRegistration } = require('./registrations/createRegistration.service');
const { getUserActiveRegistrations, getRegistrationDetails, getUserRegistrationHistory } = require('./registrations/readRegistration.service');
const { cancelRegistration } = require('./registrations/cancelRegistration.service');