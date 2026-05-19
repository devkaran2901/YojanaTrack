/* eslint-disable react-refresh/only-export-components */
import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import App from "./App.jsx";
import { RequireAuth, RequireAdmin, RedirectIfAuthed } from "./ProtectedRoutes.jsx";

const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<RedirectIfAuthed />}>
        <Route path="/signup" element={<App page="signup" />} />
        <Route path="/login" element={<App page="login" />} />
        <Route path="/invite" element={<App page="signup" />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<App page="dashboard" />} />
        <Route path="/settings" element={<App page="settings" />} />
      </Route>

      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<App page="admin" />} />
      </Route>

      {/* public pages */}
      <Route path="/" element={<App page="home" />} />
      <Route path="/schemes" element={<App page="schemes" />} />
      <Route path="/wizard" element={<App page="wizard" />} />
      <Route path="/scheme/:id" element={<App page="scheme-details" />} />

      {/* fallback */}
      <Route path="*" element={<App page="login" />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
