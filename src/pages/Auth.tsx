import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setAuthError('Check your email for a confirmation link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
  };

  useEffect(() => {
    const getUserAndRedirect = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
      if (data?.user) {
        // Check onboarding_complete in users table
        const { data: userRow, error } = await supabase
          .from('users')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .maybeSingle();
        setLoading(false);
        if (userRow && (userRow as any).onboarding_complete) {
          navigate('/dashboard');
          return;
        } else {
          navigate('/onboarding');
          return;
        }
      }
    };
    getUserAndRedirect();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Check onboarding_complete in users table
        const { data: userRow, error } = await supabase
          .from('users')
          .select('onboarding_complete')
          .eq('id', session.user.id)
          .maybeSingle();
        if (userRow && (userRow as any).onboarding_complete) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);


  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">You are signed in as {user.email}</h2>
        <button
          onClick={async () => { await supabase.auth.signOut(); setUser(null); }}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded shadow hover:bg-gray-300"
        >
          Log Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Sign In / Sign Up</h2>
      <form onSubmit={handleEmailAuth} className="flex flex-col gap-3 w-full max-w-xs mb-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border px-3 py-2 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          {isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
        </button>
        <button
          type="button"
          className="text-blue-600 underline text-sm mt-1"
          onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }}
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        {authError && <div className="text-red-600 text-sm mt-1">{authError}</div>}
      </form>
      <div className="mb-2 text-gray-500">or</div>
      <button
        onClick={handleSignInWithGoogle}
        className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 mb-4"
      >
        Continue with Google
      </button>
    </div>
  );
}
