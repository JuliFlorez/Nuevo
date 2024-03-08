import { addDoc, collection, doc, DocumentReference, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./firebase";

const chatDocsCache = {};

/**
 * 
 * @param {{user1: string, user2: string}} users
 * @param {() => {}} callback 
 * @returns {Promise<import("firebase/auth").Unsubscribe>}
 */
export async function subscribeToPrivateChat({user1, user2}, callback) {
    const chatDoc = await getPrivateChatDocument({user1, user2});

    const q = query(
        collection(db, `private-chats/${chatDoc.id}/messages`), 
        orderBy('created_at')
    );

    return onSnapshot(q, snapshot => {
        const docs = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                userId: doc.data().userId,
                message: doc.data().message,
                created_at: doc.data().created_at?.toDate(),
            }
        });

        callback(docs);
    });
}

/**
 * 
 * @param {{sender: string, receiver: string, message: string}} data
 * @returns {Promise}
 */
export async function sendPrivateChatMessage({
    sender,
    receiver,
    message,
}) {
    const document = await getPrivateChatDocument({user1: sender, user2: receiver});

    const messagesRef = collection(db, `private-chats/${document.id}/messages`);
    const response = await addDoc(messagesRef, {
        userId: sender,
        message,
        created_at: serverTimestamp(),
    });
    return {
        id: response.id,
    }
}

/**
 * 
 * @param {{user1: string, user2: string}} data 
 * @returns {Promise}
 */
async function getPrivateChatDocument({user1, user2}) {
    const doc = getFromDocsCache({user1, user2});

    if(doc) {
        return doc;
    }

    const users = {
        [user1]: true,
        [user2]: true,
    }
    const chatRef = collection(db, 'private-chats');
    const q = query(chatRef, where('users', '==', users));
    const snapshot = await getDocs(q);
    let chatDoc = null;

    if(snapshot.empty) {
        chatDoc = await createPrivateChatDocument({user1, user2});
    } else {
        chatDoc = snapshot.docs[0];
    }

    addToDocsCache({user1, user2}, chatDoc);
    return chatDoc;
}

/**
 * 
 * @param {{user1: string, user2: string}} data
 * @returns {Promise}
 */
async function createPrivateChatDocument({user1, user2}) {
    return addDoc(collection(db, `private-chats`), {
        users: {
            [user1]: true,
            [user2]: true,
        }
    })
}

/**
 * 
 * @param {{user1: string, user2:string}} keyData
 * @returns {DocumentReference|null}
 */
function getFromDocsCache({user1, user2}) {
    const key = getDocsCacheKey({user1, user2});
    return chatDocsCache[key] || null;
}

/**
 * 
 * @param {{user1: string, user2: string}} keyData
 * @param {DocumentReference} doc
 */
function addToDocsCache({user1, user2}, doc) {
    const key = getDocsCacheKey({user1, user2});
    chatDocsCache[key] = doc;
}

/**
 * 
 * @param {{user1: string, user2: string}} users
 * @returns {string}
 */
function getDocsCacheKey({user1, user2}) {
    return user1 > user2 ?
        user1 + user2 :
        user2 + user1;
}