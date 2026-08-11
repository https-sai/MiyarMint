import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtHeader, type JwtPayload, type SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

declare global {
  namespace Express {
    interface Request {
      userClaims?: JwtPayload;
      userId?: string | undefined;
    }
  }
}

// Your unique Supabase JWKS endpoint
const SUPABASE_JWKS_URL = process.env.DB_JWKS_URL!;

const client = jwksClient({
  jwksUri: SUPABASE_JWKS_URL,
  cache: true, // Cache public keys in memory
  cacheMaxEntries: 5, // Maximum number of keys to keep in cache
  cacheMaxAge: 600000, // 10 minutes cache lifespan
  rateLimit: true, // Prevent JWKS endpoint spamming
  jwksRequestsPerMinute: 10,
});

// Helper function to dynamically grab the correct public key using the token's header 'kid'
function getKey(header: JwtHeader, callback: SigningKeyCallback): void {
  if (!header.kid) {
    callback(new Error("Missing kid in token header"));
    return;
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    if (!key) {
      callback(new Error("Signing key not found"));
      return;
    }
    callback(null, key.getPublicKey());
  });
}

export function verifySupabaseAsymmetricToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed access token." });
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Missing or malformed access token." });
    return;
  }

  // Verify using the dynamic signing key callback
  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["ES256", "RS256"], // Accept Supabase asymmetric cryptographic protocols
      audience: "authenticated", // Match standard user session context
    },
    (err, decodedClaims) => {
      if (err || !decodedClaims || typeof decodedClaims === "string") {
        res.status(403).json({
          error: `Invalid or expired token: ${err?.message ?? "Invalid claims"}`,
        });
        return;
      }

      // Attach the verified claims context securely to the request lifecycle
      req.userClaims = decodedClaims;
      req.userId = decodedClaims.sub;

      next();
    },
  );
}
