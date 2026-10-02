import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Turns any failed request into a sentence that's safe to show the user.
export const getErrorMessage = (error) => {
  // No response at all: offline, server down, or the request timed out.
  if (error.request && !error.response) {
    return "Can't reach the server. Check your connection and try again.";
  }
  const data = error.response?.data;
  // "Validation failed" alone doesn't help, so show the first field's reason.
  const firstFieldError = data?.errors && Object.values(data.errors)[0];
  if (data?.message === "Validation failed" && firstFieldError) return firstFieldError;
  return data?.message || "Something went wrong. Please try again.";
};

export default api;
