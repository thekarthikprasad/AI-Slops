import { create } from 'zustand';
import { type User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true,
    error: null,

    initialize: () => {
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            set({ user, loading: false });
        });
        return unsubscribe; // Cleanup function if needed elsewhere
    },

    signIn: async () => {
        set({ loading: true, error: null });
        try {
            await signInWithPopup(auth, googleProvider);
            // user state is updated by onAuthStateChanged
        } catch (error: any) {
            set({ error: error.message, loading: false });
            console.error("Sign in error:", error);
        }
    },

    signOut: async () => {
        set({ loading: true, error: null });
        try {
            await firebaseSignOut(auth);
            // user stat is updated by onAuthStateChanged
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },
}));
