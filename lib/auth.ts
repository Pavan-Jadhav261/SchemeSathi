import { createHmac, randomUUID, timingSafeEqual } from "crypto"

export type AuthUserRecord = {
  id: string
  name: string
  email: string
  mobile: string
  passwordHash: string
  createdAt: string
}

type TokenPayload = { sub: string; name: string; email: string; iat: number; exp: number }

function secret() {
  const value = process.env.JWT_SECRET
  if (!value) throw new Error("JWT_SECRET is not configured")
  return value
}

const base64Url = (value: string | Buffer) => Buffer.from(value).toString("base64url")

export function createUserId() {
  return randomUUID()
}

export function signToken(user: Pick<AuthUserRecord, "id" | "name" | "email">) {
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = { sub: user.id, name: user.name, email: user.email, iat: now, exp: now + 60 * 60 * 24 * 7 }
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const body = base64Url(JSON.stringify(payload))
  const signature = createHmac("sha256", secret()).update(`${header}.${body}`).digest("base64url")
  return `${header}.${body}.${signature}`
}

export function verifyToken(token: string): TokenPayload | null {
  const [header, body, signature] = token.split(".")
  if (!header || !body || !signature) return null
  const expected = createHmac("sha256", secret()).update(`${header}.${body}`).digest("base64url")
  if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) return null
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null
  } catch {
    return null
  }
}

export function readBearer(request: Request) {
  const value = request.headers.get("authorization")
  return value?.startsWith("Bearer ") ? verifyToken(value.slice(7)) : null
}
