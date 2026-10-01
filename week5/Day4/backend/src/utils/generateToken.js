import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        // Fallback so a missing env var can't produce a token that never expires.
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });
}

export default generateToken;