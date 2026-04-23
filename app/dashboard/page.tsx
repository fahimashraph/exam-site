"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
const [profile, setProfile] = useState<any>(null);
const router = useRouter();

useEffect(() => {
const getProfile = async () => {
const { data: { user } } = await supabase.auth.getUser();

// 🚫 Not logged in → redirect
if (!user) {
router.push("/auth");
return;
}

// ✅ Fetch profile from DB
const { data, error } = await supabase
.from("profiles")
.select("*")
.eq("user_id", user.id)
.single();

if (!error) {
setProfile(data);
}
};

getProfile();
}, []);

return (
<div className="p-10">
<h1 className="text-3xl font-bold mb-5">Dashboard</h1>

{!profile ? (
<p>Loading...</p>
) : (
<div className="space-y-2">
<h2 className="text-xl font-semibold">
Welcome, {profile.full_name}
</h2>
<p>📧 Email: {profile.email || "N/A"}</p>
<p>🏫 School: {profile.school}</p>
<p>📞 Phone: {profile.phone}</p>
<p>🎓 Grade: {profile.grade}</p>
</div>
)}

{/* Logout */}
<button
onClick={async () => {
await supabase.auth.signOut();
router.push("/auth");
}}
className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
>
Logout
</button>
</div>
);
}