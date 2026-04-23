"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [fullName, setFullName] = useState("");
const [school, setSchool] = useState("");
const [phone, setPhone] = useState("");
const [grade, setGrade] = useState("");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

const handleAuth = async () => {
setLoading(true);
setMessage("");

try {
if (isLogin) {
const { error } = await supabase.auth.signInWithPassword({
email,
password,
});

if (error) throw error;

setMessage("Logged in successfully!");
setTimeout(() => {
router.push("/dashboard");
}, 1000);

} else {
const { data, error } = await supabase.auth.signUp({
email,
password,
});

if (error) throw error;

const user = data.user;

if (user) {
await supabase.from("profiles").insert([
{
user_id: user.id,
full_name: fullName,
school: school,
phone: phone,
grade: grade,
},
]);
}

setMessage("Account created! Check your email.");

setTimeout(() => {
router.push("/dashboard");
}, 1000);
}

} catch (err: any) {
setMessage(err.message);
} finally {
setLoading(false);
}

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        <p className="text-center text-gray-500 mt-2">
          {isLogin
            ? "Login to continue your exam practice"
            : "Start practicing exams today"}
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg hover:opacity-90 transition"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Sign Up"}
          </button>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">
            {message}
          </p>
        )}

        <div className="mt-6 text-center">
{isLogin ? "Don't have an account?" : "Already have an account?"}

<button
onClick={() => setIsLogin(!isLogin)}
className="ml-2 text-blue-600"
>
{isLogin ? "Sign up" : "Log in"}
</button>
</div>
      </div>
    </main>
  );
}
}