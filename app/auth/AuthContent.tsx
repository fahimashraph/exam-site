//FORCE DEPLOY
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AuthContent() {
const router = useRouter();
const searchParams = useSearchParams();
const mode = searchParams.get("mode");

const [isLogin, setIsLogin] = useState(true);

useEffect(() => {
if (mode === "signup") {
setIsLogin(false);
} else {
setIsLogin(true);
}
}, [mode]);

// keep the rest of your code here...
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [fullName, setFullName] = useState("");
const [school, setSchool] = useState("");
const [phone, setPhone] = useState("");
const [grade, setGrade] = useState("");
const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleAuth = async () => {
setLoading(true)

if (isLogin) {
const { error } = await supabase.auth.signInWithPassword({
email,
password,
})

if (error) {
setMessage(error.message)
} else {
router.push("/dashboard")
}
} else {
const { error } = await supabase.auth.signUp({
email,
password,
options: {
data: {
full_name: fullName,
school,
phone,
grade,
},
},
})

if (error) {
setMessage(error.message)
} else {
setMessage("Check your email to confirm signup")
}
}

setLoading(false)
}
const handleForgotPassword = async () => {
if (!email) {
setMessage("Enter your email first");
return;
}

const { error } = await supabase.auth.resetPasswordForEmail(email, {
redirectTo: "https://eduperch.com/reset-password",
});

if (error) {
setMessage(error.message);
} else {
setMessage("Password reset email sent!");
}
};

return (
<div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black px-4">
<div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">

{/* Title */}
<h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
{isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
</h2>

{/* Email */}
<input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"

/>

{/* Password */}
<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"

/>
{isLogin && (
<p
className="text-sm text-blue-500 dark:text-blue-400 cursor-pointer mb-3"
onClick={handleForgotPassword}
>
Forgot password?
</p>
)}
{/* Extra fields (Sign Up only) */}
{!isLogin && (
<>
<input
placeholder="Full Name"
value={fullName}
onChange={(e) => setFullName(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

<input
placeholder="School"
value={school}
onChange={(e) => setSchool(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

<input
placeholder="Phone"
value={phone}
onChange={(e) => setPhone(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

<input
placeholder="Grade"
value={grade}
onChange={(e) => setGrade(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
</>
)}

{/* Button */}
<button
onClick={handleAuth}
className="w-full bg-black text-white py-3 rounded-md mt-2 hover:bg-gray-800 transition"
>
{loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
</button>

{/* Message */}
{message && (
<p className="mt-3 text-sm text-red-500 dark:text-red-500 text-center">{message}</p>
)}

{/* Toggle */}
<p
onClick={() => setIsLogin(!isLogin)}
className="mt-4 text-sm text-blue-500 dark:text-blue-500 text-center cursor-pointer"
>
{isLogin
? "Don't have an account? Sign up"
: "Already have an account? Login"}
</p>

</div>
</div>
);
}
