import { Calendar } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function SignupPage({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await onSignup({
      username: name,
      email,
      password,
      role,
      department,
    });
    if (!result.success) {
      setError(result.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] p-3 rounded-2xl shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-tr from-purple-200 to-cyan-200">
            Create Account
          </h2>
          <p className="text-white/60 mt-1 text-sm">
            Join the EventHub community
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-400/40 text-red-300 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#7c3aed] outline-none"
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#7c3aed] outline-none"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Account Type
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-[#f4b860] outline-none"
            >
              <option value="student">Student / Attendee</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#f4b860] outline-none"
              placeholder="CSE, Marketing, HR..."
            />
          </div>
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#7c3aed] outline-none"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="text-white/80 text-sm font-medium mb-2 block">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-[#7c3aed] outline-none"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] text-black font-semibold hover:scale-[1.03] transition transform shadow-lg"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-6 text-white/70">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
