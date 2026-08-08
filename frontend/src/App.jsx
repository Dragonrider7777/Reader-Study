import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ReaderStudy from "./pages/ReaderStudy";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/readerstudy"
          element={
            <ProtectedRoute>
              <ReaderStudy />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/readerstudy" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
