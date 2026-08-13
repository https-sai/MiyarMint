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

function resolveJwksUrl(): string {
  const configured = process.env.DB_JWKS_URL?.trim();
  const dbUrl = process.env.DB_URL?.replace(/\/$/, "");

  if (configured) {
    // Older docs used /auth/v1/jwks, which 404s on Supabase.
    if (configured.endsWith("/auth/v1/jwks")) {
      return configured.replace(/\/auth\/v1\/jwks$/, "/auth/v1/.well-known/jwks.json");
    }
    return configured;
  }

  if (dbUrl) {
    return `${dbUrl}/auth/v1/.well-known/jwks.json`;
  }

  throw new Error("DB_JWKS_URL or DB_URL must be set for JWT verification.");
}

const SUPABASE_JWKS_URL = resolveJwksUrl();

const client = jwksClient({
  jwksUri: SUPABASE_JWKS_URL,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 600000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

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

  jwt.verify(
    token,
    getKey,
    {
      algorithms: ["ES256", "RS256"],
      audience: "authenticated",
    },
    (err, decodedClaims) => {
      if (err || !decodedClaims || typeof decodedClaims === "string") {
        res.status(403).json({
          error: `Invalid or expired token: ${err?.message ?? "Invalid claims"}`,
        });
        return;
      }

      req.userClaims = decodedClaims;
      req.userId = decodedClaims.sub;

      next();
    },
  );
}
