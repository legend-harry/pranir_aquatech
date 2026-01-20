import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, set, get, update } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK3LFTspDBFNNCL-T1sddV5jA24kQwO5U",
  authDomain: "pranir-b1aef.firebaseapp.com",
  databaseURL: "https://pranir-b1aef-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pranir-b1aef",
  storageBucket: "pranir-b1aef.firebasestorage.app",
  messagingSenderId: "841925895331",
  appId: "1:841925895331:web:7b2281710e70b44dda0b16",
  measurementId: "G-VZ5WG3FZ8Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication Functions
export const signInAnonymous = async () => {
  try {
    const result = await signInAnonymously(auth);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Save user data to database
    await saveUserData(result.user.uid, {
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      lastLogin: new Date().toISOString(),
      authProvider: 'google'
    });
    
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signUpWithEmail = async (email, password, additionalData = {}) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Save user data to database
    await saveUserData(result.user.uid, {
      email: result.user.email,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      authProvider: 'email',
      ...additionalData
    });
    
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login
    await updateUserData(result.user.uid, {
      lastLogin: new Date().toISOString()
    });
    
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Database Functions
export const saveUserData = async (userId, data) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserData = async (userId, data) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Save pond data
export const savePondData = async (userId, pondId, pondData) => {
  try {
    const pondRef = ref(database, `users/${userId}/ponds/${pondId}`);
    await set(pondRef, {
      ...pondData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all ponds for a user
export const getUserPonds = async (userId) => {
  try {
    const pondsRef = ref(database, `users/${userId}/ponds`);
    const snapshot = await get(pondsRef);
    
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: true, data: {} };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export { auth, database };
