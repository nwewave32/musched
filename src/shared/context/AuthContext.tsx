import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@shared/config/firebase";
import {
  signInWithCustomToken,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import type { User } from "@shared/types";
import { getUserProfile, createUserProfile } from "@entities/user/api";

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithToken: (token: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    role: "teacher" | "student",
    timezone: string
  ) => Promise<void>;
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
          let userProfile = await getUserProfile(user.uid);

          // 프로필이 없으면 자동 생성 (기존 계정 대응)
          if (!userProfile && user.email) {
            console.log("📝 Profile not found, creating default profile...");
            await createUserProfile(user.uid, {
              email: user.email,
              role: "student", // 기본값
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            userProfile = await getUserProfile(user.uid);
            console.log("✅ Default profile created:", userProfile);
          }

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

  // 이메일/비밀번호로 로그인
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("🔑 Signing in with email/password...");
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Email/password auth successful");
      // onAuthStateChanged가 자동으로 사용자 정보를 업데이트함
    } catch (error) {
      console.error("❌ Sign in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 이메일/비밀번호로 회원가입
  const signUpWithEmail = async (
    email: string,
    password: string,
    role: "teacher" | "student",
    timezone: string
  ) => {
    try {
      console.log("📝 Creating account with email/password...");
      setIsLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("✅ Account created successfully");

      // Firestore에 사용자 프로필 생성
      console.log("📝 Creating user profile in Firestore...");
      await createUserProfile(userCredential.user.uid, {
        email: userCredential.user.email || email,
        role,
        timezone,
      });
      console.log("✅ User profile created");
      // onAuthStateChanged가 자동으로 사용자 정보를 업데이트함
    } catch (error) {
      console.error("❌ Sign up failed:", error);
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
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
