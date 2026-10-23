import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { arrivedFromRecoveryLink, supabase } from "../../lib/supabase";

type AuthState = {
  session: Session | null;
  loading: boolean;
  recovery: boolean;
  startRecovery: () => void;
  endRecovery: () => void;
};
const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  recovery: false,
  startRecovery: () => {},
  endRecovery: () => {},
});
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(arrivedFromRecoveryLink);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(session);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        recovery,
        startRecovery: () => setRecovery(true),
        endRecovery: () => setRecovery(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
