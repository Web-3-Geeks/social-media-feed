import { useState } from "react";
import { Link, useLocation } from "react-router";
import { getErrorMessage } from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import { useAuth } from "../hooks/useAuth";
import { validateLogin } from "../utils/validation";

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const [form, setForm] = useState({
    email: location.state?.email ?? "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateLogin(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
    } catch (error) {
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setServerError(getErrorMessage(error));
      }
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue to your feed"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {justRegistered && !serverError && (
          <div role="status" className="rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
            Account created! Please log in.
          </div>
        )}

        {serverError && (
          <div role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <FormInput
          id="password"
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}

