import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// На мобильных браузерах попапы блокируются — используем редирект.
const isMobile = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // После редиректа на мобильных сначала получаем результат,
    // затем подписываемся на onAuthStateChanged — иначе можно
    // получить кратковременный user=null до прихода токена.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch(() => { /* редиректа не было — игнорируем */ })
      .finally(() => {
        onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      });
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      if (isMobile()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e: any) {
      setError(mapError(e.code));
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function mapError(code: string): string {
  const map: Record<string, string> = {
    'auth/popup-closed-by-user': 'Окно входа было закрыто',
    'auth/cancelled-popup-request': '',
    'auth/popup-blocked': 'Всплывающее окно заблокировано браузером',
    'auth/network-request-failed': 'Ошибка сети. Проверьте соединение',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
    'auth/account-exists-with-different-credential': 'Аккаунт уже существует с другим способом входа',
  };
  return map[code] ?? `Ошибка входа (${code})`;
}
