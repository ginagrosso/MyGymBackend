
const { db, firebaseAdmin } = require('../utils/firebase');

// Crear usuario en Firebase Auth
const createUserAuth = async (email, password) => {
    console.log(`REPO. Creando el usuario en Firebase Auth: ${email}`);

    const userRecord = await firebaseAdmin.auth().createUser({email: email, password: password});

    console.log(`Usuario creado exitosamente. id: ${userRecord.uid}`);

    return userRecord;

};

// Guardar perfil en RTDB
const createUserProfileInDB = async (uid, data) => {
    console.log(`REPO. Creando el perfil del usuario ${uid}`);

    const perfilData = {
        ...data,
        uid: uid,
        createdAt: Date.now(),
        isActive: true,
        paymentStatus: 'inactive'
    };

    await db.ref(`users/${uid}`).set(perfilData);
    console.log("Perfil creado con exito")
    return perfilData;
};

// Leer perfil desde RTDB
const getUserProfileFromDB = async (uid) => {

    console.log(`REPO.Buscando el perfil del usuario ${uid}`)

    const userRef = db.ref(`users/${uid}`);
    const snapshot = await userRef.once('value');

    const userData = snapshot.val();
    console.log(`Perfil encontrado:`, userData);
    return userData;
};

// Actualizar perfil en RTDB
const updateUserProfileInDB = async (uid, data) => {

    console.log(`REPO.Actualizando el perfil del usuario ${uid}`);
    const userRef = db.ref(`users/${uid}`);

    await userRef.update(data);

    const updatedProfile = await getUserProfileFromDB(uid);

    console.log(`Perfil actualizado:`, updatedProfile);
    return updatedProfile;

};

// Buscar usuario por email en Auth
const findUserByEmailFromAuth = async (email) => {
    console.log(`REPO. Buscando el usuario con el email: ${email}`);

    const userRecord = await firebaseAdmin.auth().getUserByEmail(email);

    console.log(`Usuario encontrado: ${userRecord}`);
    return userRecord;
};

module.exports = {
    createUserAuth,
    createUserProfileInDB,
    getUserProfileFromDB,
    updateUserProfileInDB,
    findUserByEmailFromAuth
}