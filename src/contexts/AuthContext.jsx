import { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    async function register(email, password, name, role, skills = []) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        if (role === 'helper') {
            await setDoc(doc(db, 'helpers', uid), {
                helperId: uid,
                name,
                email,
                skills,
                rating: 4.5,
                totalRatings: 0,
                status: 'available',
                location: { latitude: 0, longitude: 0 },
                createdAt: new Date().toISOString()
            });
        }

        await setDoc(doc(db, 'users', uid), {
            userId: uid,
            name,
            email,
            role,
            location: { latitude: 0, longitude: 0 },
            createdAt: new Date().toISOString()
        });

        const profile = { userId: uid, name, email, role, skills };
        setUserProfile(profile);
        return cred;
    }

    async function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function logout() {
        setUserProfile(null);
        return signOut(auth);
    }

    async function fetchUserProfile(uid) {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile(data);

            if (data.role === 'helper') {
                const helperDoc = await getDoc(doc(db, 'helpers', uid));
                if (helperDoc.exists()) {
                    setUserProfile({ ...data, ...helperDoc.data() });
                }
            }
        }
    }

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    await fetchUserProfile(user.uid);
                } catch (err) {
                    console.error('Error fetching profile:', err);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading,
        register,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
