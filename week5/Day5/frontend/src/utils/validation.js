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

export const POST_MAX_LENGTH = 500;
const IMAGE_URL_REGEX = /^https:\/\/\S+$/i;

export function validatePost({ content, imageUrl }) {
  const errors = {};

  if (!content.trim()) {
    errors.content = "Post content cannot be empty";
  } else if (content.trim().length > POST_MAX_LENGTH) {
    errors.content = `Content cannot exceed ${POST_MAX_LENGTH} characters`;
  }

  if (imageUrl.trim() && !IMAGE_URL_REGEX.test(imageUrl.trim())) {
    errors.imageUrl = "Image URL must be a valid https:// link";
  }

  return errors;
}

export const COMMENT_MAX_LENGTH = 300;

export function validateComment(content) {
  if (!content.trim()) return "Comment cannot be empty";
  if (content.trim().length > COMMENT_MAX_LENGTH) {
    return `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`;
  }
  return "";
}

export const BIO_MAX_LENGTH = 160;

export function validateProfile({ name, bio, avatar }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = "Name is required";
  } else if (name.trim().length < 2 || name.trim().length > 50) {
    errors.name = "Name must be 2-50 characters";
  }

  if (bio.trim().length > BIO_MAX_LENGTH) {
    errors.bio = `Bio cannot exceed ${BIO_MAX_LENGTH} characters`;
  }

  if (avatar.trim() && !IMAGE_URL_REGEX.test(avatar.trim())) {
    errors.avatar = "Avatar must be a valid https:// link";
  }

  return errors;
}
