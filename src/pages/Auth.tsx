import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { WellnessButton } from "@/components/WellnessButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true); // Start with loading true
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists() && userDoc.data().onboardingComplete) {
                    navigate('/'); // Redirect to home page
                } else {
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
            } else {
                setLoading(false); // Only set loading to false if no user
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            setError(err.message);
            console.error("Google Sign-In failed:", err);
            setLoading(false);
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (isSignUp) {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        } else {
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        }
    };
    
    if (loading) {
        return <div className="flex items-center justify-center h-screen font-bold text-xl">Loading...</div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Milo</h1>
                    <p className="text-gray-600">Your personal wellness companion.</p>
                </div>

                {error && <p className="text-red-500 text-sm my-4 bg-red-100 p-3 rounded-md">{error}</p>}

                <form onSubmit={handleEmailAuth} className="space-y-6">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1"
                            disabled={loading}
                        />
                    </div>
                    <WellnessButton type="submit" className="w-full" disabled={loading}>
                        {loading ? (isSignUp ? 'Signing Up...' : 'Signing In...') : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </WellnessButton>
                </form>

                <div className="text-center">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-gray-600 hover:underline" disabled={loading}>
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">OR</span>
                    </div>
                </div>

                <WellnessButton onClick={handleGoogleSignIn} className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In with Google'}
                </WellnessButton>

                <p className="text-xs text-gray-500 mt-6 text-center">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}