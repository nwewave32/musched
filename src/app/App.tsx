import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@shared/context/AuthContext";
import { ProtectedRoute } from "./router/ProtectedRoute";
import "./styles/index.css";

// Pages
import { CalendarPage } from "@pages/calendar";
import { LoginPage } from "@pages/login";
import { SignupPage } from "@pages/signup";
import { SettingsPage } from "@pages/settings";

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
