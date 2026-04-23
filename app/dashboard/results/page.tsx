"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function DashboardPage() {
const [results, setResults] = useState<any[]>([])

useEffect(() => {
fetchResults()
}, [])

const fetchResults = async () => {
const { data, error } = await supabase
.from("results")
.select("*")
.order("created_at", { ascending: false })

if (error) {
console.error(error)
} else {
setResults(data)
}
}

return (
<div className="p-6 max-w-2xl mx-auto">
<h1 className="text-2xl font-bold mb-4">Your Results</h1>

{results.length === 0 ? (
<p>No results yet</p>
) : (
<div className="space-y-3">
{results.map((result, index) => (
<div
key={index}
className="p-4 border rounded flex justify-between"
>
<div>
<p className="font-semibold">
Score: {result.score} / {result.total}
</p>
<p className="text-sm text-gray-500">
{new Date(result.created_at).toLocaleString()}
</p>
</div>

<div>
{result.score === result.total ? "✅" : "❌"}
</div>
</div>
))}
</div>
)}
</div>
)
}
