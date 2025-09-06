import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../integrations/firebase/client";
import { WellnessButton } from "../components/WellnessButton";

export default function Auth() {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().onboardingComplete) {
                    navigate('/dashboard');
                } else {
                    // Pre-fill user data on first sign-in
                    const userDocRef = doc(db, "users", user.uid);
                    if (!userDoc.exists()) {
                        await setDoc(userDocRef, {
                            email: user.email,
                            name: user.displayName,
                            onboardingComplete: false,
                        }, { merge: true });
                    }
                    navigate('/onboarding');
                }
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleGoogleSignIn = async () => {
        setError('');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            // The onAuthStateChanged listener will handle redirection.
        } catch (err: any) {
            setError(err.message);
            console.error("Google Sign-In failed:", err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Milo</h1>
                    <p className="text-gray-600">Your personal wellness companion.</p>
                </div>

                {error && <p className="text-red-500 text-sm my-4 bg-red-100 p-3 rounded-md">{error}</p>}

                <WellnessButton onClick={handleGoogleSignIn} className="w-full">
                    Sign In with Google
                </WellnessButton>

                <p className="text-xs text-gray-500 mt-6">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
