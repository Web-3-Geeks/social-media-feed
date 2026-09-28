const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister({ name, email, password }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Name is required";
  } else if (name.trim().length < 2 || name.trim().length > 50) {
    errors.name = "Name must be 2-50 characters";
  }

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please provide a valid email";
  }

  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8 || password.length > 72) {
    errors.password = "Password must be 8-72 characters";
  } else if (!/[A-Za-z]/.test(password)) {
    errors.password = "Password must contain at least one letter";
  } else if (!/\d/.test(password)) {
    errors.password = "Password must contain at least one number";
  }

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = "Please provide a valid email";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return errors;
}
