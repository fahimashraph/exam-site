"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { console } from "inspector";

export default function Dashboard() {
const [user, setUser] = useState<any>(null);
const [profile, setProfile] = useState<any>(null);
const [loading, setLoading] = useState(true);
const router = useRouter();
const [results, setResults] = useState<any[]>([])
const [stats, setStats] = useState({
total: 0,
best: 0,
average: 0,
})
const [editing, setEditing] = useState(false)

const [formData, setFormData] = useState({
full_name: "",
school: "",
phone: "",
grade: "",
})

const handleSave = async () => {
    console.log("Save clicked")
const { data: userData } = await supabase.auth.getUser()

if (!userData.user) return

const { error: updateError } = await supabase
.from("profiles")
.update({
full_name: formData.full_name,
school: formData.school,
phone: formData.phone,
grade: formData.grade,
})
.eq("user_id", userData.user.id)
if (!updateError) {
setProfile(formData)
setEditing(false)
} else {
console.error(updateError)
}
}
useEffect(() => {
const loadDashboard = async () => {
const { data } = await supabase.auth.getUser()

if (!data.user) {
router.push("/auth")
return
}

setUser(data.user)

// ✅ PROFILE FETCH (NEW)
const { data: profileData, error: profileError } = await supabase
.from("profiles")
.select("*")
.eq("user_id", data.user.id)
.single()

if (!profileError && profileData) {
setProfile(profileData)

setFormData({
full_name: profileData.full_name || "",
school: profileData.school || "",
phone: profileData.phone || "",
grade: profileData.grade || "",
})
}

// ✅ RESULTS FETCH (already there)
const { data: resultsData, error } = await supabase
.from("results")
.select("*")
.eq("user_id", data.user.id)
.order("created_at", { ascending: false })
.select("*")
.eq("user_id", data.user.id)
.order("created_at", { ascending: false })

if (!error && resultsData) {
setResults(resultsData)

if (resultsData.length > 0) {
const totalAttempts = resultsData.length

const bestScore = Math.max(
...resultsData.map((r) => r.score)
)

const avgScore =
resultsData.reduce((acc, r) => acc + r.score, 0) /
totalAttempts

setStats({
total: totalAttempts,
best: bestScore,
average: Math.round(avgScore * 100) / 100,
})
}
}

setLoading(false)
// 🔥 fetch results for THIS user only

supabase.from("results")
.select("*")
.eq("user_id", data.user.id)
.order("created_at", { ascending: false })

if (!error && resultsData) {
setResults(resultsData)

if (resultsData.length > 0) {
const totalAttempts = resultsData.length

const bestScore = Math.max(
...resultsData.map((r) => r.score)
)

const avgScore =
resultsData.reduce((acc, r) => acc + r.score, 0) /
totalAttempts

setStats({
total: totalAttempts,
best: bestScore,
average: Math.round(avgScore * 100) / 100,
})
}
}

setLoading(false)
}

loadDashboard()
}, [])


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
<div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">

<h1 className="text-3xl font-bold">Dashboard</h1>

<p className="mt-2">Welcome: {user?.email}</p>

{/* 🔥 STATS SECTION */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
<div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
<p>Total Attempts</p>
<h2 className="text-xl font-bold">{stats.total}</h2>
</div>

<div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
<p>Best Score</p>
<h2 className="text-xl font-bold">{stats.best}</h2>
</div>

<div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
<p>Average</p>
<h2 className="text-xl font-bold">{stats.average}</h2>
</div>
</div>

{/* 👤 PROFILE SECTION */}
{editing ? (
// ✏️ EDIT MODE
<div className="mt-6 space-y-3">
<input
type="text"
placeholder="Full Name"
value={formData.full_name}
onChange={(e) =>
setFormData({ ...formData, full_name: e.target.value })
}
className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700"
/>

<input
type="text"
placeholder="School"
value={formData.school}
onChange={(e) =>
setFormData({ ...formData, school: e.target.value })
}
className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700"
/>

<input
type="text"
placeholder="Phone"
value={formData.phone}
onChange={(e) =>
setFormData({ ...formData, phone: e.target.value })
}
className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700"
/>

<input
type="text"
placeholder="Grade"
value={formData.grade}
onChange={(e) =>
setFormData({ ...formData, grade: e.target.value })
}
className="w-full p-2 rounded bg-gray-200 dark:bg-gray-700"
/>

<div className="flex gap-3">
<button
onClick={() => setEditing(false)}
className="bg-gray-500 text-white px-4 py-2 rounded"
>
Cancel
</button>

<button
className="bg-green-500 text-white px-4 py-2 rounded"
>
Save
</button>
</div>
</div>
) : (
// 👀 VIEW MODE
<div className="mt-6 space-y-2">
<p><strong>Name:</strong> {profile?.full_name}</p>
<p><strong>School:</strong> {profile?.school}</p>
<p><strong>Phone:</strong> {profile?.phone}</p>
<p><strong>Grade:</strong> {profile?.grade}</p>

<button
onClick={() => setEditing(true)}
className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
>
Edit Profile
</button>
</div>
)}

{/* 🚪 LOGOUT */}
<button
onClick={handleLogout}
className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
>
Logout
</button>

</div>
)
}