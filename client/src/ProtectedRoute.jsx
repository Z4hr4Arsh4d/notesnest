import { Navigate } from "react-router-dom";

// A wrapper: if there's no token, redirect to login. Otherwise show the page.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}