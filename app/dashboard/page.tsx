"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

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
useEffect(() => {
const loadDashboard = async () => {
const { data } = await supabase.auth.getUser()

if (!data.user) {
router.push("/auth")
return
}

setUser(data.user)
const { data: resultsData, error } = await supabase
.from("results")
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
<div className="mt-6 space-y-2">
<p><strong>Name:</strong> {profile?.full_name}</p>
<p><strong>School:</strong> {profile?.school}</p>
<p><strong>Phone:</strong> {profile?.phone}</p>
<p><strong>Grade:</strong> {profile?.grade}</p>
</div>

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