export default function Dashboard() {
return (
<main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">

{/* Card */}
<div className="w-full max-w-md bg-white shadow-md rounded-xl p-6">

{/* Header */}
<h1 className="text-2xl font-bold mb-2 text-center">
Welcome 👋
</h1>
<p className="text-gray-500 text-center mb-6">
Choose what you want to do
</p>

{/* Actions */}
<div className="flex flex-col gap-3">

<a
href="/exam"
className="w-full py-3 bg-blue-500 text-white rounded-lg text-center font-medium hover:bg-blue-600 transition"
>
Start Exam
</a>

<a
href="/dashboard/results"
className="w-full py-3 bg-purple-500 text-white rounded-lg text-center font-medium hover:bg-purple-600 transition"
>
View Results
</a>

<a
href="/resources"
className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg text-center font-medium hover:bg-gray-300 transition"
>
Resources
</a>

</div>

</div>

</main>
)
}