import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase/client'; // Corrected import
import { Layout, Container } from '@/components/Layout';
import { WellnessButton } from '@/components/WellnessButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function Onboarding() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [workStart, setWorkStart] = useState('09:00');
    const [workEnd, setWorkEnd] = useState('17:00');
    const [wellnessGoals, setWellnessGoals] = useState('');
    const [trustedContact, setTrustedContact] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists() && userDoc.data().onboardingComplete) {
                        navigate('/dashboard');
                    } else {
                        setLoading(false);
                    }
                } catch (err) {
                    console.error("Status check failed:", err);
                    setError("Couldn't verify your status. Please proceed.");
                    setLoading(false);
                }
            } else {
                navigate('/');
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!name || !wellnessGoals || !trustedContact) {
            setError('Please fill out all fields.');
            setLoading(false);
            return;
        }

        try {
            await setDoc(doc(db, "users", user.uid), {
                name, workHours: { start: workStart, end: workEnd }, wellnessGoals, trustedContact,
                email: user.email, onboardingComplete: true
            }, { merge: true });

            navigate('/dashboard');
        } catch (err) {
            console.error("Onboarding failed:", err);
            setError('Failed to save your information. Please try again.');
            setLoading(false);
        }
    };

    if (loading && !error) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <Layout>
            <Container className="max-w-xl pt-12">
                <Card className="shadow-lg border-0 rounded-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Welcome to Milo</CardTitle>
                        <CardDescription>Let's get you set up. Just a few questions.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-7">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">What is your name?</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>What are your typical work hours?</Label>
                                <div className="flex items-center gap-3">
                                    <Input type="time" value={workStart} onChange={(e) => setWorkStart(e.target.value)} required />
                                    <span className="text-muted-foreground">to</span>
                                    <Input type="time" value={workEnd} onChange={(e) => setWorkEnd(e.target.value)} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="goals">What are your wellness goals?</Label>
                                <Input id="goals" value={wellnessGoals} onChange={(e) => setWellnessGoals(e.target.value)} placeholder="e.g., Manage stress, sleep better" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="contact">Who is your trusted contact for support?</Label>
                                <Input id="contact" type="tel" value={trustedContact} onChange={(e) => setTrustedContact(e.target.value)} placeholder="Phone number" required />
                            </div>

                            {error && <p className="text-sm text-center text-red-500">{error}</p>}

                            <WellnessButton type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Complete Setup
                            </WellnessButton>
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </Layout>
    );
}
