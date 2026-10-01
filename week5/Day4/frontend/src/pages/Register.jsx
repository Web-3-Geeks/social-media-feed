import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { getErrorMessage } from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import { useAuth } from "../hooks/useAuth";
import { validateRegister } from "../utils/validation";

const initialForm = { name: "", email: "", password: "" };

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
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

    const validationErrors = validateRegister(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await register({ ...form, email: form.email.trim() });
      navigate("/login", {
        replace: true,
        state: { registered: true, email: form.email.trim() },
      });
    } catch (error) {
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors) {
        setErrors(fieldErrors);
      } else {
        setServerError(getErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join the conversation in seconds"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {serverError && (
          <div role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <FormInput
          id="name"
          name="name"
          label="Name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}

