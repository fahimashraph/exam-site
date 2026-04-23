import Link from "next/link"
export default function Home() {
  return (
    <main className="bg-white text-gray-900">
      {/* NAVBAR */}
      <header className="w-full border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">ExamPrep</h1>

          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-black">Features</a>
            <a href="#" className="hover:text-black">Pricing</a>
            <a href="#" className="hover:text-black">About</a>
          </nav>

          <div className="flex gap-3">


            <Link href="/auth">
<button className="mr-4">Login</button>
</Link>

<Link href="/auth">
<button className="bg-black text-white px-4 py-2 rounded">
Sign Up
</button>
</Link>
</div>
        </div>
      </header>

      {/* HERO */}
      <section className="text-center px-6 py-20 md:py-28">
        <h2 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
          Practice Smarter. Score Higher.
        </h2>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Real exam simulations, instant feedback, and performance tracking —
          everything you need to pass with confidence.
        </p>

        import Link from "next/link";

<Link
href="/auth"
className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition"
>
Get Started
</Link>
      </section>

      {/* FEATURES */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold">Everything You Need</h3>
          <p className="mt-4 text-gray-600">
            Designed to help you prepare efficiently and effectively.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Exam Simulations",
                desc: "Experience real test environments with timed exams.",
              },
              {
                title: "Instant Results",
                desc: "Get detailed explanations immediately after completion.",
              },
              {
                title: "Progress Tracking",
                desc: "Analyze performance and focus on weak areas.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition text-left"
              >
                <h4 className="text-xl font-semibold">{item.title}</h4>
                <p className="mt-3 text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ExamPrep. All rights reserved.</p>

          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
  }
