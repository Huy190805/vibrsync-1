"use client";

import { useState } from "react";
import Link from "next/link";
import { Music } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signIn(email, password); // Gọi context login
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white/5 backdrop-blur-sm rounded-2xl shadow-xl border border-white/10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600 mb-4">
            <Music size={32} />
          </div>
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="text-gray-400 mt-2">Sign in to continue to Melody</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="input-field"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-600"
              />
              <label htmlFor="remember-me" className="ml-2 text-gray-300">
                Remember me
              </label>
            </div>
            <a href="#" className="text-purple-400 hover:underline">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
          <button
  type="button"
  onClick={() => window.location.href = "http://localhost:8000/login/google"}
  className="btn-secondary w-full mt-4 flex items-center justify-center gap-2"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.1 0 5.9 1.1 8.1 3.3l6-6C34.7 2.4 29.7 0 24 0 14.6 0 6.7 5.7 2.9 13.9l7 5.4C12.2 13.6 17.6 9.5 24 9.5z"/>
    <path fill="#34A853" d="M46.1 24.5c0-1.5-.1-2.6-.4-3.8H24v7.1h12.7c-.3 1.9-1.2 3.7-2.6 5.1l6.5 5c3.8-3.5 5.5-8.6 5.5-13.4z"/>
    <path fill="#FBBC05" d="M10 28.9c-1.2-3.6-1.2-7.4 0-11l-7-5.4c-3.2 6.3-3.2 13.5 0 19.8l7-5.4z"/>
    <path fill="#4285F4" d="M24 47.5c5.7 0 10.5-1.8 14.1-4.8l-6.5-5c-2 1.4-4.6 2.1-7.6 2.1-6.3 0-11.7-4.1-13.7-9.9l-7 5.4C6.7 42.3 14.6 47.5 24 47.5z"/>
  </svg>
  Sign in with Google
</button>

        </form>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-purple-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
