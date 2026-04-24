"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
const [user, setUser] = useState<any>(null);
const [profile, setProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);
const router = useRouter();

useEffect(() => {
const getUserAndProfile = async () => {
const { data } = await supabase.auth.getUser();

// ❌ Not logged in → send back to auth
if (!data.user) {
router.push("/auth");
return;
}


// ✅ Set user
setUser(data.user);
setLoading(false)

// ✅ Get profile from DB
const { data: profileData, error } = await supabase
.from("profiles")
.select("*")
.eq("user_id", data.user.id)
.single();

if (!error) {
console.log(profileData);
}
};

getUserAndProfile();
}, []);

// 🔴 Logout
const handleLogout = async () => {
await supabase.auth.signOut();
router.push("/auth");
};

// ⏳ Loading state
if (loading) {
return <p className="p-10 text-white">Loading...</p>;
}

return (
<div className="p-10 text-white">
<h1 className="text-3xl font-bold">Dashboard</h1>

<p className="mt-2">Welcome: {user?.email}</p>

<div className="mt-6 space-y-2">
<p><strong>Name:</strong> {profile?.full_name}</p>
<p><strong>School:</strong> {profile?.school}</p>
<p><strong>Phone:</strong> {profile?.phone}</p>
<p><strong>Grade:</strong> {profile?.grade}</p>
</div>

<button
onClick={handleLogout}
className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
>
Logout
</button>
</div>
);
}