import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Мобильные браузеры блокируют попапы — используем редирект.
// Редирект проходит через workspaceapp-36f44.firebaseapp.com (authDomain),
// поэтому /__/auth/handler существует и 404 не возникает.
const isMobile = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // На мобильных после редиректа нужно сначала получить результат,
    // и только потом подписаться на onAuthStateChanged.
    // Если делать параллельно — onAuthStateChanged успевает выдать user=null
    // и приложение показывает страницу входа до прихода реального пользователя.
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) setUser(result.user);
      })
      .catch(() => {/* тихо игнорируем — не было редиректа */})
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
        // Далее страница перезагрузится; результат придёт через getRedirectResult выше
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (e: any) {
      setError(mapError(e.code));
    }
  };

  const signInEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(mapError(e.code));
    }
  };

  const signUpEmail = async (email: string, password: string) => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(mapError(e.code));
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInEmail, signUpEmail, logout, error, clearError }}>
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
    'auth/user-not-found': 'Пользователь не найден',
    'auth/wrong-password': 'Неверный пароль',
    'auth/invalid-credential': 'Неверный email или пароль',
    'auth/email-already-in-use': 'Email уже зарегистрирован',
    'auth/weak-password': 'Пароль слишком слабый (мин. 6 символов)',
    'auth/invalid-email': 'Некорректный email',
    'auth/popup-closed-by-user': 'Окно входа закрыто',
    'auth/cancelled-popup-request': '',
    'auth/popup-blocked': 'Всплывающее окно заблокировано браузером',
    'auth/network-request-failed': 'Ошибка сети. Проверьте соединение',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже',
  };
  return map[code] ?? `Ошибка входа (${code})`;
}
