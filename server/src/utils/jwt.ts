import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

export function generateAccessToken(payload: { userId: number; email: string }, rememberMe = false) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: rememberMe ? "7d" : "15m" });
}

export function generateRefreshToken(payload: { userId: number; email: string }, rememberMe = false) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: rememberMe ? "30d" : "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number; email: string };
}
