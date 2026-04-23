"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
setLoading(false);
return;
}

setMessage("Logged in successfully!");
setTimeout(() => {
router.push("/dashboard");
}, 1000);

} else {
const { error } = await supabase.auth.signUp({
email,
password,
});

if (error) {
setMessage(error.message);
setLoading(false);
return;
}

setMessage("Account created! Check your email.");
}

} catch (err) {
console.error(err);
setMessage("Something went wrong");
}

setLoading(false);
};