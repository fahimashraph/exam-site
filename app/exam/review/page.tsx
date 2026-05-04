"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { questions } from "../../../lib/questions"

function ReviewContent() {
const params = useSearchParams()
const answers = JSON.parse(params.get("answers") || "{}")

const total = questions.length
let score = 0

questions.forEach((q, index) => {
if (answers[index] === q.correct_answer) {
score++
}
})

const percentage = Math.round((score / total) * 100)

return (
<div className="p-6 min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
<h1 className="text-2xl font-bold mb-4">Review</h1>

<div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
<h2 className="text-xl font-bold">
Score: {score} / {total}
</h2>
<p className="text-lg">Percentage: {percentage}%</p>
</div>

<div className="space-y-6">
{questions.map((q, index) => {
const userAnswer = answers[index]
const correct = q.correct_answer

return (
<div key={index} className="p-4 bg-white dark:bg-gray-800 rounded border">
<p className="font-semibold mb-3">
{index + 1}. {q.question}
</p>

{["A", "B", "C", "D"].map((opt) => {
const text = q[`option_${opt.toLowerCase()}` as keyof typeof q]

let style =
"p-2 rounded border border-gray-300 dark:border-gray-600"

if (opt === correct) {
style += " bg-green-500 text-white"
}

if (opt === userAnswer && opt !== correct) {
style += " bg-red-500 text-white"
}

return (
<div key={opt} className={style}>
{opt}. {text}
</div>
)
})}
</div>
)
})}
</div>
</div>
)
}

export default function ReviewPage() {
return (
<Suspense fallback={<div>Loading...</div>}>
<ReviewContent />
</Suspense>
)
}
