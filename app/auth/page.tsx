"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
console.log("AUTH FIX V2");
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

if (error) {
setMessage(error.message);
return;
}

setMessage("Logged in successfully!");
setTimeout(() => {
router.push("/dashboard");
}, 1000);

} else {
const { data, error } = await supabase.auth.signUp({
email,
password,
});

if (error) {
setMessage(error.message);
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

setMessage("Account created! Check your email.");
}

} catch (err) {
console.error(err);
setMessage("Something went wrong");
}

setLoading(false);
};
return (
<div className="min-h-screen flex items-center justify-center bg-gray-100">
<div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
<h2 className="text-xl font-bold mb-4">
{isLogin ? "Login" : "Sign Up"}
</h2>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full p-2 border mb-3"
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full p-2 border mb-3"
/>

<button
onClick={async () => {
try {
await handleAuth();
} catch (e) {
console.error(e);
}
}}
className="w-full bg-black text-white p-2 rounded"
>
{isLogin ? "Login" : "Sign Up"}
</button>

<p className="mt-3 text-sm text-gray-600">{message}</p>

<button
onClick={() => setIsLogin(!isLogin)}
className="mt-2 text-blue-500 text-sm"
>
{isLogin
? "Don't have an account? Sign up"
: "Already have an account? Login"}
</button>
</div>
</div>
);
}