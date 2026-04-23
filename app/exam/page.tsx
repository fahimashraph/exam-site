"use client";
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function ExamPage() {
const [questions, setQuestions] = useState<any[]>([])
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
const [answers, setAnswers] = useState<{ [key: number]: string }>({})
const [timeLeft, setTimeLeft] = useState(300)
const [submitted, setSubmitted] = useState(false)
const [score, setScore] = useState(0)

const fetchQuestions = async () => {
const { data, error } = await supabase
.from("questions")
.select("*")

if (!error) setQuestions(data)
}

useEffect(() => {
fetchQuestions()
}, [])

useEffect(() => {
if (submitted) return

const timer = setInterval(() => {
setTimeLeft((prev) => {
if (prev <= 1) {
handleSubmit()
return 0
}
return prev - 1
})
}, 1000)

return () => clearInterval(timer)
}, [submitted])
const currentQuestion = questions[currentQuestionIndex]

const handleAnswer = (option: string) => {
setAnswers({ ...answers, [currentQuestionIndex]: option })
}

const nextQuestion = () => {
setCurrentQuestionIndex((prev) => prev + 1)
}

const prevQuestion = () => {
setCurrentQuestionIndex((prev) => prev - 1)
}

const handleSubmit = async () => {
let newScore = 0

questions.forEach((q, index) => {
if (answers[index] === q.correct_answer) {
newScore++
}
})

setScore(newScore)
setSubmitted(true)
// 🔥 SAVE RESULT
const { error } = await supabase
.from("results")
.insert([
{
score: newScore,
total: questions.length,
created_at: new Date().toISOString(),
},
])
console.log("INSERT ERROR:",error)
if (error) {
console.error("Save error:", error)
} else {
console.log("Result saved!")
}
}

if (!currentQuestion) return <div>Loading...</div>

return (
<div className="p-6 max-w-xl mx-auto">
    <div className="mb-4 flex justify-between items-center">
<h2 className="text-sm text-gray-500">
Question {currentQuestionIndex + 1} / {questions.length}
</h2>

<h2 className="text-sm font-semibold text-red-500">
⏱ {Math.floor(timeLeft / 60)}:
{(timeLeft % 60).toString().padStart(2, "0")}
</h2>
</div>
{submitted && (
<div className="mb-4 p-4 bg-gray-100 rounded text-center">
<h2 className="text-lg font-bold mb-3">
Score: {score} / {questions.length}
</h2>

<a
href="/dashboard"
className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
>
Go to Dashboard →
</a>
</div>
)}

<h2 className="text-xl font-bold mb-4">
{currentQuestion.question}
</h2>

<div className="space-y-2">
{["A", "B", "C", "D"].map((opt) => {
const value = currentQuestion[`option_${opt.toLowerCase()}`]

return (
<button
  key={opt}
  onClick={() => handleAnswer(opt)}
  disabled={submitted}
  className={`w-full text-left p-3 border rounded-lg transition-all duration-200
${
submitted
? opt === currentQuestion.correct_answer
? "bg-green-500 text-white"
: answers[currentQuestionIndex] === opt
? "bg-red-500 text-white"
: "bg-gray-100"
: answers[currentQuestionIndex] === opt
? "bg-blue-500 text-white"
: "bg-white hover:bg-gray-200"
}`}
>
{opt}. {value}
</button>
)
})}
</div>

<div className="flex justify-between mt-6">
<button
onClick={prevQuestion}
className="px-4 py-2 bg-gray-300 rounded hover:bg-blue-600 transition"
>
Previous
</button>

{currentQuestionIndex === questions.length - 1 ? (
<button
  onClick={handleSubmit}
  disabled={submitted}
  className={`px-4 py-2 rounded text-white transition ${
    submitted
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-500 hover:bg-green-600"
  }`}
>
  Submit
</button>
) : (
<button
onClick={nextQuestion}
className="px-4 py-2 bg-blue-500 text-white rounded bg-green-500 hover:bg-green-600"
>
Next
</button>
)}
</div>

</div>
)
}
