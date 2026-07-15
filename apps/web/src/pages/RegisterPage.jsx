import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post("/auth/register", formData);
      login(response.data.token, response.data.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-primary)]/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[var(--color-primary)]">
            <BriefcaseBusiness size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            FreelanceFlow
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <p className="mb-5 text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
            Built for freelancers
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Run your freelance business with clarity.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-slate-400">
            Organize clients, manage projects, track billable
            hours and turn your work into invoices from one premium workspace.
          </p>
        </motion.div>

        <p className="relative z-10 text-sm text-slate-500 font-medium">
          FreelanceFlow · Premium Workspace
        </p>
      </section>

      <section className="flex items-center justify-center bg-white px-6 py-12 relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 lg:hidden flex justify-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/20">
                <BriefcaseBusiness size={20} />
              </div>
              <span className="text-xl font-bold text-slate-950 tracking-tight">
                FreelanceFlow
              </span>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Create your account
            </h2>
            <p className="mt-2 text-slate-500">
              Start managing your freelance business.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
                placeholder="Your full name"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            <Button
              type="submit"
              isLoading={submitting}
              className="w-full h-12 text-base mt-2"
            >
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
};

export default RegisterPage;