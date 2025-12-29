import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@shared/config/firebase";
import {
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import type { User } from "@shared/types";
import { getUserProfile } from "@entities/user/api";

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithToken: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase 인증 상태 변경 리스너
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔐 Auth state changed:", user?.uid);
      setFirebaseUser(user);

      if (user) {
        // Firestore에서 사용자 프로필 가져오기
        try {
          console.log("📥 Fetching user profile for:", user.uid);
          const userProfile = await getUserProfile(user.uid);
          console.log("✅ User profile loaded:", userProfile);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("❌ Failed to fetch user profile:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // 커스텀 토큰으로 로그인
  const signInWithToken = async (token: string) => {
    try {
      console.log("🔑 Signing in with custom token...");
      setIsLoading(true);
      await signInWithCustomToken(auth, token);
      console.log("✅ Firebase auth successful");
      // onAuthStateChanged가 자동으로 사용자 정보를 업데이트함
    } catch (error) {
      console.error("❌ Sign in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    isLoading,
    isAuthenticated: !!currentUser,
    signInWithToken,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
