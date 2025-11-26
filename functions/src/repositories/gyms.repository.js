
const admin = require("firebase-admin");
const { firebaseAdmin } = require('../utils/firebase');


const db = admin.database();

// Crear usuario en Firebase Auth
const createGymAuth = async (email, password) => {
    console.log(`REPO. Creando el usuario en Firebase Auth: ${email}`);

    const userRecord = await admin.auth().createUser({email: email, password: password});

    console.log(`Usuario creado exitosamente. id: ${userRecord.uid}`);

    return userRecord;

};

// Guardar perfil en RTDB
const createGymProfileInDB = async (uid, data) => {
    console.log(`REPO. Creando el perfil del gimnasio`);

    const perfilData = {
        ...data,
        uid: uid,
        createdAt: Date.now(),
        isActive: true,
    };

    await db.ref(`gyms/${uid}`).set(perfilData);
    console.log("Gimnasio creado con exito")
    return perfilData;
};

// Leer perfil desde RTDB
const getGymProfileFromDB = async (uid) => {

    console.log(`REPO.Buscando el perfil del gimnasio ${uid}`)

    const userRef = db.ref(`gyms/${uid}`);
    const snapshot = await userRef.once('value');

    const userData = snapshot.val();
    console.log(`Perfil encontrado:`, userData);
    return userData;
};

const getAllGymsFromDB = async () => {
    console.log(`REPO. Buscando todos los gimnasios`);
    const gymsRef = db.ref('gyms');
    const snapshot = await gymsRef.once('value');
    const gymsData = snapshot.val();
    console.log(`Gimnasios encontrados:`, gymsData);
    return gymsData;
};

// Actualizar perfil en RTDB
const updateGymProfileInDB = async (uid, data) => {

    console.log(`REPO.Actualizando el perfil del gimnasio ${uid}`);
    const userRef = db.ref(`gyms/${uid}`);

    await userRef.update(data);

    const updatedProfile = await getGymProfileFromDB(uid);

    console.log(`Perfil actualizado:`, updatedProfile);
    return updatedProfile;

};

// Buscar usuario por email en Auth
const findGymByEmailFromAuth = async (email) => {
    console.log(`REPO. Buscando el gimnasio con el email: ${email}`);

    const gymRecord = await admin.auth().getUserByEmail(email);

    console.log(`Gimnasio encontrado: ${gymRecord}`);
    return gymRecord;
};

module.exports = {
    createGymAuth,
    createGymProfileInDB,
    getGymProfileFromDB,
    getAllGymsFromDB,
    updateGymProfileInDB,
    findGymByEmailFromAuth
}