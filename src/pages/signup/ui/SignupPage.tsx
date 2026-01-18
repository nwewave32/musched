import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@app/providers";
import { Button, Card, CardContent, Input, Label } from "@shared/ui";
import { FirebaseError } from "firebase/app";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
] as const;

const TIMEZONE_OPTIONS = [
  { value: "Asia/Seoul", label: "Seoul (UTC+9)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Asia/Manila", label: "Manila (UTC+8)" },
  { value: "Asia/Shanghai", label: "Shanghai (UTC+8)" },
  { value: "Asia/Singapore", label: "Singapore (UTC+8)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)" },
  { value: "America/Chicago", label: "Chicago (UTC-6/-5)" },
  { value: "Europe/London", label: "London (UTC+0/+1)" },
  { value: "Europe/Paris", label: "Paris (UTC+1/+2)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
] as const;

export const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signUpWithEmail, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, role, timezone);
      console.log("✅ Signup successful, logging out and redirecting to login...");

      // 로그아웃 후 로그인 페이지로 이동
      await signOut();
      navigate("/login", {
        state: { message: "Account created successfully! Please log in." }
      });
    } catch (err) {
      console.error("Signup error:", err);

      // Firebase 에러 메시지 파싱
      let errorMessage = "Failed to create account. Please try again.";

      if (err instanceof FirebaseError) {
        console.error("Firebase error code:", err.code);
        console.error("Firebase error message:", err.message);

        if (err.code === "auth/email-already-in-use") {
          errorMessage = "This email is already in use.";
        } else if (err.code === "auth/invalid-email") {
          errorMessage = "Invalid email address.";
        } else if (err.code === "auth/weak-password") {
          errorMessage = "Password is too weak.";
        } else if (err.code === "auth/unauthorized-domain") {
          errorMessage = `Unauthorized domain. Error code: ${err.code}`;
        } else {
          errorMessage = `${err.message} (Code: ${err.code})`;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">MuSched</h1>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                disabled={isLoading}
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as "teacher" | "student")}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TIMEZONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Current: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
