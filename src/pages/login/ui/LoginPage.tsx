import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@shared/context/AuthContext";
import { Button, Card, CardContent, Input, Label } from "@shared/ui";

export const LoginPage = () => {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { signInWithToken, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 인증 완료 시 자동으로 홈으로 이동
  useEffect(() => {
    if (isAuthenticated) {
      console.log("✅ Authentication successful, navigating to home...");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    setIsLoading(true);
    try {
      await signInWithToken(token);
      // useEffect에서 isAuthenticated가 true가 되면 자동으로 이동
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid token. Please check and try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900">MuSched</h1>
            <p className="text-gray-600 mt-2">Sign in with your token</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Firebase Custom Token</Label>
              <Input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your custom token here"
                disabled={isLoading}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Get your token from Firebase Console
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
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800 font-semibold mb-2">
              Development Mode
            </p>
            <p className="text-xs text-blue-700">
              This is a development login method. In production, you would sign
              in with email/password and receive a token from the backend.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
