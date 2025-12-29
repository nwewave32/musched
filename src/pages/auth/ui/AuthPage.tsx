export const AuthPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">MuSched</h1>
          <p className="text-muted-foreground text-center mb-4">
            Insert token to sign in.
          </p>
          <div className="space-y-4">
            {/* 여기에 토큰 입력 폼 추가 */}
            <input
              type="text"
              placeholder="Access Token"
              className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
