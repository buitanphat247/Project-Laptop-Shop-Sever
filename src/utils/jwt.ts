import jwt from "jsonwebtoken";

// Lấy thời gian sống access token từ biến môi trường (giây)
const ACCESS_TOKEN_EXPIRES_IN = 604800;
// Lấy thời gian sống refresh token từ biến môi trường (giây)
const REFRESH_TOKEN_EXPIRES_IN =
  Number(process.env.REFRESH_TOKEN_EXPIRES_IN) || 2592000; // mặc định 7 ngày

export const generateAccessToken = (user: {
  id: number;
  email: string;
  fullName: string;
  role: string;
}): string => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ACCESS_TOKEN_EXPIRES_IN;
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      iat: now,
      exp: exp,
    },
    process.env.JWT_SECRET!,
    { noTimestamp: true }
  );
};

export const generateRefreshToken = (userId: number): string => {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + REFRESH_TOKEN_EXPIRES_IN;

  return jwt.sign(
    {
      userId,
      iat: now,
      exp: exp,
    },
    process.env.REFRESH_SECRET!,
    { noTimestamp: true }
  );
};
