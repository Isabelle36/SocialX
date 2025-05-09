import jwt from "jsonwebtoken";

export const generateAccessToken = ({ instagramId }) => {
  const tokenSecret = `${process.env.JWT_SECRET}`;
  return jwt.sign({ instagramId }, tokenSecret, { expiresIn: "1h" });
};
