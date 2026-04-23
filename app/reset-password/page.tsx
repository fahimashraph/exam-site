"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ResetPassword() {
const [password, setPassword] = useState("");
const router = useRouter();

const handleUpdate = async () => {
const { error } = await supabase.auth.updateUser({
password,
});

if (error) {
alert(error.message);
} else {
alert("Password updated!");
router.push("/auth");
}
};

return (
<div className="min-h-screen flex items-center justify-center bg-gray-100">
<div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
<h2 className="text-xl font-bold mb-4 text-black">
Reset Password
</h2>

<input
type="password"
placeholder="New password"
value={password}
onChange={(e) => setPassword(e.target.value)}
className="w-full p-3 border rounded-md mb-3 text-black"
/>

<button
onClick={handleUpdate}
className="w-full bg-black text-white p-2 rounded"
>
Update Password
</button>
</div>
</div>
);
}
