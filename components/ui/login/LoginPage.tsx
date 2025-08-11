"use client";
import React, { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function LoginPage() {
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

    const result = await signIn("Credentials-Login", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    setIsLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
    } else if (result?.ok) {
      router.push(result.url || "/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
      <section className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="font-bold text-2xl text-gray-800">
            Sign In to your account
          </h2>
          <p className="text-gray-600">Enter your details below</p>
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

        <div className="text-center mt-4">
          <a href="#" className="text-textdark3 text-base hover:text-blue-600">
            Forgot your password?
          </a>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              signIn("google", { redirect: true, callbackUrl: "/" });
            }}
            className="w-full bg-[#F9FAFB] text-[#606882] py-4 border border-gray-300 rounded-lg hover:text-dark hover:bg-gray-200 flex items-center justify-center transition duration-200"
          >
            <Image
              src="/google.svg"
              width={20}
              height={20}
              alt="Google logo"
              className="mr-2"
            />
            Sign In with Google
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-[#606882]">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-textdark4 hover:text-blue-600">
              Sign Up Now!
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
