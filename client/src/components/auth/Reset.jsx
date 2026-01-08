import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function Reset() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
   const location = useLocation();
  const email = location.state?.email;
  function validatePassword() {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (password.length < 10) {
      setError("Password must be at least 10 characters long.");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return false;
    }
    return true;
  }
    React.useEffect(() => {
      if (!email ) {
        navigate("/home"); // redirect if accessed directly
      }
    }, [email,navigate]);

  async function changePassword() {
    setError("");

    if (!validatePassword()) return;

    try {
      setLoading(true);

      // Call backend API
      const res = await axios.post(`${API_BASE}/auth/reset-password`, {
        email,
        password,
      });

      if (res.status === 200) {
        alert("Password changed successfully!");
        navigate("/dashboard");
        
      } else {
        setError("Failed to reset password. Try again.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong while resetting password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="bg-gray-50 w-screen dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Change Password
            </h2>

            <form
              className="mt-4 space-y-4 lg:mt-5 md:space-y-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                  dark:text-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg 
                  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 
                  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                  dark:text-white"
                  required
                />
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 
                    focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="terms"
                    className="font-light text-gray-500 dark:text-gray-300"
                  >
                    I accept the{" "}
                    <a
                      href="#"
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                    >
                      Terms and Conditions
                    </a>
                  </label>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}

              <button
                type="button"
                onClick={changePassword}
                disabled={loading}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 
                focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium 
                rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 
                dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
