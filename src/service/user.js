import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * 
 * @param {string} id 
 * @returns {{id: string, email: string, displayName: string|null, height: string|null, photoURL: string|null, weight: string|null, birthday: string|null, premium: string|null, gender: string|null, isAdmin: string|null,goal: string|null,premiumExpiry : string|null}}
 */
export async function getUserProfileById(id) {
    const snapshot = await getDoc(doc(db, `/users/${id}`));
    return {
        id,
        ...snapshot.data(),
    }
}

export async function getAllUserProfiles() {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
  
    const users = [];
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
  
    return users;
  }

export async function getUsers() {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return userList;
}

export async function deleteUser(userId) {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
}

/**
 * 
 * 
 * @param {string} id 
 * @param {{}} data 
 * @returns {Promise}
 */
export async function createUserProfile(id, data) {
  const userRef = doc(db, `/users/${id}`);
  return setDoc(userRef, {
      ...data,
      isAdmin: data.isAdmin || false,
      premium: data.premium || false,
      photoURL: data.photoURL || undefined,
  });
}


/**
 * 
 * 
 * @param {string} id 
 * @param {{displayName: string|null, height: string|null, photoURL: string|null,weight: string|null, birthday: string|null, premium: string|null, gender: string|null, isAdmin: string|null, goal: string|null,premiumExpiry : string|null}} data 
 * @param {string} newPremiumStatus
 * @returns {Promise}
 */
export async function editUserProfile(id, data) {
    try {
        if (id && data) {
            await updateDoc(
                doc(db, `/users/${id}`),
                { ...data }
            );
        } else {
            console.error("ID de usuario o datos indefinidos.");
        }
    } catch (error) {
        console.error("Error updating document: ", error);
        throw error;
    }
}


