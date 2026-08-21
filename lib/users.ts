import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { promisify } from "util"
import type { AuthUserRecord } from "./auth"

const scrypt = promisify(scryptCallback)
const usersPath = path.join(process.cwd(), "data", "users.json")

export async function readUsers(): Promise<AuthUserRecord[]> {
  try {
    const raw = (await fs.readFile(usersPath, "utf8")).trim()
    if (!raw) return []
    const users = JSON.parse(raw) as unknown
    return Array.isArray(users) ? users as AuthUserRecord[] : []
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return []
    if (error instanceof SyntaxError) return []
    throw error
  }
}

export async function addUser(user: AuthUserRecord) {
  await fs.mkdir(path.dirname(usersPath), { recursive: true })
  const users = await readUsers()
  users.push(user)
  await fs.writeFile(usersPath, JSON.stringify(users, null, 2) + "\n", "utf8")
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derived = (await scrypt(password, salt, 64)) as Buffer
  return `${salt}:${derived.toString("hex")}`
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const derived = (await scrypt(password, salt, 64)) as Buffer
  const expected = Buffer.from(hash, "hex")
  return expected.length === derived.length && timingSafeEqual(expected, derived)
}
