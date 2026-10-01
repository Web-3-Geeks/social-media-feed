import { useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { BIO_MAX_LENGTH, validateProfile } from "../utils/validation";
import FormInput from "./FormInput";

export default function EditProfileForm({ profile, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: profile.name,
    bio: profile.bio || "",
    avatar: profile.avatar || "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validateProfile(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const res = await api.patch("/users/me", {
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatar: form.avatar.trim(),
      });
      onSaved(res.data.user);
    } catch (error) {
      const fieldErrors = error.response?.data?.errors;
      if (fieldErrors) setErrors(fieldErrors);
      else setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !saving) onCancel();
      }}
      noValidate
      className="mt-6 space-y-4 border-t border-gray-100 pt-6"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Edit profile</h2>

      {formError && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2 text-sm text-red-700">
          {formError}
        </p>
      )}

      <FormInput
        id="profile-name"
        name="name"
        label="Name"
        value={form.name}
        onChange={handleChange}
        error={errors.name}
        maxLength={50}
        autoFocus
      />

      <div>
        <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-medium text-gray-700">
          Bio <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          id="profile-bio"
          name="bio"
          rows={3}
          value={form.bio}
          onChange={handleChange}
          aria-invalid={errors.bio ? "true" : "false"}
          aria-describedby="profile-bio-count"
          placeholder="Tell people a little about yourself"
          className={`w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:ring-2 ${
            errors.bio
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
          }`}
        />
        <div className="mt-1 flex justify-between gap-2 text-xs">
          <span className="text-red-600">{errors.bio}</span>
          <span
            id="profile-bio-count"
            className={`tabular-nums ${
              form.bio.length > BIO_MAX_LENGTH ? "font-semibold text-red-600" : "text-gray-400"
            }`}
          >
            {form.bio.length}/{BIO_MAX_LENGTH}
          </span>
        </div>
      </div>

      <FormInput
        id="profile-avatar"
        name="avatar"
        type="url"
        label="Avatar URL (optional)"
        value={form.avatar}
        onChange={handleChange}
        error={errors.avatar}
        placeholder="https://example.com/me.jpg"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
