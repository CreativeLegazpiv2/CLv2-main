// services/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret'; // Use a strong secret

// Define a specific payload interface
interface TokenPayload extends JWTPayload {
  id: string; // Assuming id is a string, change type if necessary
  username: string;
}

export const createJWT = async (payload: TokenPayload) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // Set the signing algorithm
    .setIssuedAt() // Set the issued time
    .setExpirationTime('1h') // Token expiration time
    .sign(new TextEncoder().encode(JWT_SECRET));
};

export const verifyJWT = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload; // Returns the payload if verification is successful
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Token verification failed');
  }
};
