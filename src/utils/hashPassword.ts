import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hàm mã hóa mật khẩu người dùng
 * @param password Mật khẩu thô người dùng nhập
 * @returns Mật khẩu đã được mã hóa (hash)
 */
export const hashPassword = async (password: any) => {
  if (!password || password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return hashed;
};
