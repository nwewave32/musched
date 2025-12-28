import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "./providers";
import "./styles/index.css";

// Pages
import { CalendarPage } from "@pages/calendar";
import { AuthPage } from "@pages/auth";

export const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
};
