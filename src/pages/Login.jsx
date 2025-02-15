import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../helpers/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { showToast } from "../components/Toast";
import { AuthContext } from "../hooks/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const { setUser } = authContext;

  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  if (!authContext) {
    console.error("AuthContext is undefined. Ensure AuthProvider is wrapping the component tree.");
    return null;
  }


  const users = [
    { label: "Factory", email: "factory@sukkurbakers.com.pk" },
    { label: "Branch 1", email: "branch1@sukkurbakers.com.pk" },
    { label: "Branch 2", email: "branch2@sukkurbakers.com.pk" },
    { label: "Branch 3", email: "branch3@sukkurbakers.com.pk" },
    { label: "Branch 4", email: "branch4@sukkurbakers.com.pk" },
  ];

  // Local authentication fallback (replace with real hashed passwords in production)
  const localUsers = {
    "factory@sukkurbakers.com.pk": "@Factory",
    "branch1@sukkurbakers.com.pk": "@branch1",
    "branch2@sukkurbakers.com.pk": "@branch2",
    "branch3@sukkurbakers.com.pk": "@branch3",
    "branch4@sukkurbakers.com.pk": "@branch4",
  };

  const handleLogin = async () => {
    if (!password || !selectedUser) {
      showToast("⚠️ Please select a user and enter a password!", "error");
      return;
    }

    setLoading(true);

    try {
      // Check if online
      if (navigator.onLine) {
        const userCredential = await signInWithEmailAndPassword(auth, selectedUser.email, password);
        const newUser = { email: userCredential.user.email, label: selectedUser.label };
        setUser(newUser);
        showToast(`✅ Welcome, ${selectedUser.label}!`);
        navigate("/");
      } else {
        // Offline authentication
        if (localUsers[selectedUser.email] === password) {
          setUser({ email: selectedUser.email, label: selectedUser.label });
          showToast(`✅ Welcome, ${selectedUser.label}! (Offline Mode)`);
          navigate("/");
        } else {
          showToast("❌ Incorrect password! (Offline Mode)", "error");
        }
      }
    } catch (error) {
      showToast(error.message, "error");
    }

    setLoading(false);
  };

  return (
    <main className="bg-[#fafbfc] p-4 flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-5xl font-extrabold mb-8">Login</h2>
      <div className="grid grid-cols-2 gap-4">
        {users.map((user) => (
          <button
            key={user.email}
            className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-md text-lg font-semibold transition-transform hover:scale-105"
            onClick={() => setSelectedUser(user)}
          >
            {user.label}
          </button>
        ))}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-2">{selectedUser.label} Login</h3>
            <p className="text-sm text-gray-500 mb-4">{selectedUser.email}</p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded-md"
              placeholder="Enter password"
            />

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-full mt-3 disabled:opacity-50"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Login;
