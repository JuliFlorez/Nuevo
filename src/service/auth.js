import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { getFileURL, uploadFile } from "./file-storage";
import { auth } from "./firebase"
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase"; 
import { getUserProfileById } from "./user";

let userData = {
    id: null,
    email: null,
    displayName: null,
    photoURL: null,
    height: null,
    weight: null,
    birthday: null,
    premium: null,
    premiumExpiry: null,
    gender: null,
    goal: null,
    isAdmin: null,
    fullProfileLoaded: false,
}
let observers = [];

if(localStorage.getItem('userData')) {
    updateUserData(JSON.parse(localStorage.getItem('userData')));
}

onAuthStateChanged(auth, async user => {
    if (user) {
        updateUserData({
            id: user.uid,
            email: user.email,
            photoURL: user.photoURL,
        });

        const fullProfile = await getUserProfileById(user.uid);
        updateUserData({
            displayName: fullProfile.displayName,
            weight: fullProfile.weight,
            height: fullProfile.height,
            birthday: fullProfile.birthday,
            isAdmin: fullProfile.isAdmin,
            premium: fullProfile.premium,
            premiumExpiry: fullProfile.premiumExpiry,
            gender: fullProfile.gender,
            goal: fullProfile.goal,
            fullProfileLoaded: true,
        });

        if (fullProfile && fullProfile.premiumExpiry) {
            const premiumExpiryDate = fullProfile.premiumExpiry.toDate();

            if (premiumExpiryDate < new Date()) {
                // Si ha pasado, actualiza premium a false
                await editUserProfile(user.uid, { premium: false });
                updateUserData({ premium: false });
                console.log("La membresía ha caducado. premium se ha establecido en false.");
            } else {
                console.log("Fecha de caducidad de la membresía:", premiumExpiryDate.toLocaleDateString());
                console.log("Fecha de caducidad de la membresía válida.");
            }
        } else {
            console.log("El perfil completo o la fecha de vencimiento de la membresía no están definidos.");
        }
    }
    });


/**
 * @param {{email: string, password: string, displayName: string, height: string, weight: string, birthday: string, gender: string, goal: string}} user
 * @returns {Promise}
 */
export async function register({ email, password, displayName, height, weight, birthday, gender, goal }) {
    try {

        const userCredentials = await createUserWithEmailAndPassword(auth, email, password);

        const userDocRef = doc(db, 'users', userCredentials.user.uid);
        const userProfileData = {
            displayName: displayName,
            email,
            height,
            weight,
            birthday,
            gender,
            goal,
            isAdmin: false,
            premium: false,
        };

        await setDoc(userDocRef, userProfileData);

        await updateProfile(userCredentials.user, {
            displayName: displayName,
        });

        await updateUserData({
            id: userCredentials.user.uid,
            email: userCredentials.user.email,
            displayName: userCredentials.user.displayName,
            photoURL: userCredentials.user.photoURL,
            weight: userProfileData.weight,
            height: userProfileData.height,
            birthday: userProfileData.birthday,
            isAdmin: userProfileData.isAdmin,
            premium: userProfileData.premium,
            premiumExpiry: userProfileData.premiumExpiry,
            gender: userProfileData.gender,
            goal: userProfileData.goal,
            fullProfileLoaded: true,
        });

        console.log("Usuario registrado en Firebase:", userCredentials.user);

        console.log("Datos del perfil almacenados en Firestore:", userProfileData);

        return userCredentials.user;

    } catch (error) {
        console.error("[auth.js register] Error al registrar: ", error);
        throw error;
    }
}



/**
 * 
 * 
 * @param {{email: string, password: string}} user
 * @returns {Promise}
 */
export function login({ email, password }) {
    return signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            return userData;
        })
        .catch(error => {
            console.error("[auth.js login] Error al autenticar: ", error); 
            throw error;
        });
}

/**
 * 
 * @returns {Promise}
 */
export function logout() {
    clearUserData();
    return signOut(auth);
}

/**
 * @param {{displayName: string|null, height: string|null, weight: string|null, birthday: string|null, gender: string|null, goal: string|null}} data
 * @return {Promise}
 */
export async function editUser({ displayName, height, weight, birthday, gender, goal }) {
    try {
        const data = {};
        if (displayName != null) data.displayName = displayName; 
        if (height != null) data.height = height;
        if (weight != null) data.weight = weight;
        if (birthday != null) data.birthday = birthday;
        if (gender != null) data.gender = gender;
        if (goal != null) data.goal = goal;

        console.log("Datos a actualizar:", JSON.stringify(data));

        const promiseAuth = updateProfile(auth.currentUser, data);
        const promiseProfile = editUserProfile(userData.id, data);

        updateUserData(data);

        return Promise.all([promiseAuth, promiseProfile]);
    } catch (error) {
        throw error;
    }
}

/**
 * 
 * @param {File} file 
 * @return {Promise}
 */
export async function editUserImage(file) {
    const filePath = `users/${userData.id}/avatar`;
    await uploadFile(filePath, file);

    const photoURL = await getFileURL(filePath);

    return editUser({
        photoURL,
    });
}

/**
 * 
 * 
 * @param {({id: string, email: string}) => void} callback 
 * @returns {() => void} 
 */
export function subscribeToAuth(callback) {
    observers.push(callback);

    notify(callback);

    return () => {
        observers = observers.filter(obs => obs !== callback)
    };
}

function notify(callback) {
    callback({
        ...userData,
    });
}

function notifyAll() {
    observers.forEach(callback => notify(callback));
}



/**
 * 
 * 
 * @param {{id: string|null, email: string|null, displayName: string|null, career: string|null, fullProfileLoaded: boolean, weight: string|null, birthday: string|null, premium: string|null, gender: string|null,isAdmin: string|null,goal: string|null,premiumExpiry : string|null}} newData 
 */
function updateUserData(newData) {
    userData = {
        ...userData,
        ...newData,
    }
    localStorage.setItem('userData', JSON.stringify(userData));
    notifyAll();
}

function clearUserData() {
    userData = {
        id: null,
        email: null,
        displayName: null,
        photoURL: null,
        height: null,
        weight: null,
        birthday: null,
        isAdmin: null,
        premium: null,
        premiumExpiry : null,
        gender: null,
        goal: null,
        fullProfileLoaded: false,
    }
    localStorage.removeItem('userData');
    notifyAll();
}