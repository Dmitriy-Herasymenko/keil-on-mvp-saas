"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TEST_USERS = [
  { email: "user1@gmail.com", password: "user123", label: "Користувач 1" },
  { email: "user2@gmail.com", password: "user123", label: "Користувач 2" },
  { email: "user3@gmail.com", password: "user123", label: "Користувач 3" },
  { email: "user4@gmail.com", password: "user123", label: "Користувач 4" },
  { email: "user5@gmail.com", password: "user123", label: "Користувач 5" },
  { email: "user6@gmail.com", password: "user123", label: "Користувач 6" },
  { email: "user7@gmail.com", password: "user123", label: "Користувач 7" },
  { email: "user8@gmail.com", password: "user123", label: "Користувач 8" },
  { email: "user9@gmail.com", password: "user123", label: "Користувач 9" },
  { email: "user10@gmail.com", password: "user123", label: "Користувач 10" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("user1@gmail.com");
  const [password, setPassword] = useState("user123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Невірний email або пароль");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Вхід в систему
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Вхід..." : "Увійти"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Немає акаунта?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Зареєструватися
            </Link>
          </p>
        </div>

        {/* Test Users */}
        <div className="p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Тестові користувачі
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Натисніть на користувача щоб заповнити дані
          </p>
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {TEST_USERS.map((user, index) => (
              <button
                key={index}
                onClick={() => fillCredentials(user.email, user.password)}
                className="p-3 text-left bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {user.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
