"use client"

import { useEffect, useState } from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"

type Question = {
question: string
options: string[]
correct_answer: string
}

function ReviewContent() {
const [answers, setAnswers] = useState<Record<number, string>>({})
const [questionsFromExam, setQuestionsFromExam] = useState<Question[]>([])
useEffect(() => {
const data = JSON.parse(localStorage.getItem("examData") || "{}")

setAnswers(data.answers || [])
setQuestionsFromExam(data.questions || [])
}, [])
const total = questionsFromExam.length
let score = 0

questionsFromExam.forEach((q, index) => {
if (answers[index] === q.correct_answer) {
score++
}
})

const percentage = total > 0
 ? Math.round((score / total) * 100)
:0

if (questionsFromExam.length === 0) {
return <div>Loading review...</div>
}

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
{questionsFromExam.map((q, index) => {
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
