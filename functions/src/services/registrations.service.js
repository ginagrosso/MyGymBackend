const { createRegistration } = require('./registrations/createRegistration.service');
const { getUserActiveRegistrations, getRegistrationDetails, getUserRegistrationHistory } = require('./registrations/readRegistration.service');
const { cancelRegistration } = require('./registrations/cancelRegistration.service');

module.exports = {
    createRegistration,
    getUserActiveRegistrations,
    getRegistrationDetails,
    getUserRegistrationHistory,
    cancelRegistration
};