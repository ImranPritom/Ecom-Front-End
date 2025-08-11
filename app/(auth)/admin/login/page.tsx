"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      setIsLoading(false);
      toast.error("Please fill all the fields");
      return;
    }

    const result = await signIn("Credentials-Admin-Login", {
      email,
      password,
      redirect: false,
      callbackUrl: "/admin/dashboard",
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
    } else if (result?.ok) {
      router.push(result.url || "/admin/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='70' height='70' patternTransform='scale(4) rotate(120)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(212,29.3%,36.1%,1)'/><path d='M-4.8 4.44L4 16.59 16.14 7.8M32 30.54l-13.23 7.07 7.06 13.23M-9 38.04l-3.81 14.5 14.5 3.81M65.22 4.44L74 16.59 86.15 7.8M61 38.04l-3.81 14.5 14.5 3.81'  stroke-linecap='square' stroke-width='6' stroke='hsla(211,52.7%,10.8%,1)' fill='none'/><path d='M59.71 62.88v3h3M4.84 25.54L2.87 27.8l2.26 1.97m7.65 16.4l-2.21-2.03-2.03 2.21m29.26 7.13l.56 2.95 2.95-.55'  stroke-linecap='square' stroke-width='6' stroke='hsla(75,6.2%,87.5%,1)' fill='none'/><path d='M58.98 27.57l-2.35-10.74-10.75 2.36M31.98-4.87l2.74 10.65 10.65-2.73M31.98 65.13l2.74 10.66 10.65-2.74'  stroke-linecap='square' stroke-width='6' stroke='hsla(219,37.2%,16.9%,1)' fill='none'/><path d='M8.42 62.57l6.4 2.82 2.82-6.41m33.13-15.24l-4.86-5.03-5.03 4.86m-14-19.64l4.84-5.06-5.06-4.84'  stroke-linecap='square' stroke-width='6' stroke='hsla(214,22.5%,56.5%,1)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(-144,-504)' fill='url(%23a)'/></svg>")`,
      }}
    >
      <section className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="font-bold text-2xl text-gray-800">Welcome Admin</h2>
          <p className="text-gray-600">Login to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              name="email"
              id="email"
              type="email"
              placeholder="examplemail@gmail.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center bg-textdark4 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 gap-2"
          >
            {isLoading && <FaSpinner size={20} className="animate-spin" />}
            <span> Sign In</span>
          </button>
        </form>
      </section>
    </div>
  );
}
