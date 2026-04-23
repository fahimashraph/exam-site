"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
const router = useRouter();

const [isLogin, setIsLogin] = useState(true);
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [fullName, setFullName] = useState("");
const [school, setSchool] = useState("");
const [phone, setPhone] = useState("");
const [grade, setGrade] = useState("");

const [message, setMessage] = useState("");
const [loading, setLoading] = useState(false);

const handleAuth = async () => {
setLoading(true);
setMessage("");

try {
if (isLogin) {
const { error } = await supabase.auth.signInWithPassword({
email,
password,
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
}

router.push("/dashboard");
} else {
const { data, error } = await supabase.auth.signUp({
email,
password,
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
}

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

router.push("/dashboard");
}
} catch (err) {
setMessage("Something went wrong");
}

setLoading(false);
};

return (
<div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
<div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

{/* Title */}
<h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
{isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
</h2>

{/* Email */}
<input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

{/* Password */}
<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
/>


{/* Extra fields (Sign Up only) */}
{!isLogin && (
<>
<input
placeholder="Full Name"
value={fullName}
onChange={(e) => setFullName(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 rounded-md text-black"
/>

<input
placeholder="School"
value={school}
onChange={(e) => setSchool(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 rounded-md text-black"
/>

<input
placeholder="Phone"
value={phone}
onChange={(e) => setPhone(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 rounded-md text-black"
/>

<input
placeholder="Grade"
value={grade}
onChange={(e) => setGrade(e.target.value)}
className="w-full p-3 mb-3 border border-gray-300 rounded-md text-black"
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
<p className="mt-3 text-sm text-red-500 text-center">{message}</p>
)}

{/* Toggle */}
<p
onClick={() => setIsLogin(!isLogin)}
className="mt-4 text-sm text-blue-500 text-center cursor-pointer"
>
{isLogin
? "Don't have an account? Sign up"
: "Already have an account? Login"}
</p>

</div>
</div>
);
}