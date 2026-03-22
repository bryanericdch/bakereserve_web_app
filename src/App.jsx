import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Setup a global Axios interceptor to catch Banned User responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if the error exists, is 401 or 403, and contains the word "banned"
        const isBanned =
          error.response &&
          (error.response.status === 401 || error.response.status === 403) &&
          error.response.data?.message?.toLowerCase().includes("banned");

        if (isBanned) {
          // Alert the user, wipe their session, and kick them to login
          alert(
            "Your account has been banned due to policy violations. You have been logged out.",
          );
          localStorage.removeItem("userInfo");
          navigate("/auth", { replace: true });
        }
        return Promise.reject(error);
      },
    );

    // Cleanup interceptor if the component unmounts
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  return <AppRoutes />;
}

export default App;
