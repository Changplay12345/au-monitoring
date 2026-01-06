import { supabase } from './supabase'
import { User } from './types'
import bcrypt from 'bcryptjs'

const USERS_TABLE = 'users'
const USERS_ID_COL = 'id'
const USERS_USERNAME_COL = 'username'
const USERS_EMAIL_COL = 'email'
const USERS_PASSWORD_COL = 'password'
const USERS_NAME_COL = 'name'
const USERS_ROLE_COL = 'role'

// Role types
export type UserRole = 'admin' | 'user'

// Find user by username
export async function findUserByUsername(username: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(`${USERS_ID_COL}, ${USERS_USERNAME_COL}, ${USERS_EMAIL_COL}, ${USERS_PASSWORD_COL}, ${USERS_NAME_COL}, ${USERS_ROLE_COL}`)
    .eq(USERS_USERNAME_COL, username)
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}

// Find user by email
export async function findUserByEmail(email: string): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select(`${USERS_ID_COL}, ${USERS_USERNAME_COL}, ${USERS_EMAIL_COL}, ${USERS_PASSWORD_COL}, ${USERS_NAME_COL}, ${USERS_ROLE_COL}`)
    .eq(USERS_EMAIL_COL, email)
    .limit(1)
    .single()

  if (error || !data) return null
  return data
}

// Find user by username or email
export async function findUserByUsernameOrEmail(identifier: string): Promise<Record<string, unknown> | null> {
  // Check if identifier looks like an email
  const isEmail = identifier.includes('@')
  
  if (isEmail) {
    return await findUserByEmail(identifier)
  }
  return await findUserByUsername(identifier)
}

// Password check - supports both bcrypt hashed and plain text passwords
export async function passwordMatches(input: string, stored: string): Promise<boolean> {
  // Check if stored password is bcrypt hashed (starts with $2a$, $2b$, or $2y$)
  if (stored.startsWith('$2')) {
    return await bcrypt.compare(input, stored)
  }
  // Fallback to plain text comparison for legacy passwords
  return input === stored
}

// Login user (supports username or email)
export async function loginUser(identifier: string, password: string): Promise<User> {
  const row = await findUserByUsernameOrEmail(identifier)
  
  if (!row) {
    throw new Error('User not found')
  }

  const storedPassword = String(row[USERS_PASSWORD_COL] || '')
  
  const isValid = await passwordMatches(password, storedPassword)
  if (!isValid) {
    throw new Error('Invalid password')
  }

  return {
    id: String(row[USERS_ID_COL]),
    username: String(row[USERS_USERNAME_COL]),
    email: String(row[USERS_EMAIL_COL]),
    name: row[USERS_NAME_COL] ? String(row[USERS_NAME_COL]) : null,
    role: (row[USERS_ROLE_COL] as 'admin' | 'user') || 'user',
  }
}

// Session storage keys
const SESSION_KEY = 'au_monitoring_user'
const AUTH_COOKIE = 'au_auth_token'

// Set auth cookie (for middleware detection)
function setAuthCookie(user: User): void {
  if (typeof window !== 'undefined') {
    // Create a simple token from user data
    const token = btoa(JSON.stringify({ id: user.id, ts: Date.now() }))
    // Set cookie with 7 day expiry
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
    document.cookie = `${AUTH_COOKIE}=${token}; path=/; expires=${expires}; SameSite=Lax`
  }
}

// Clear auth cookie
function clearAuthCookie(): void {
  if (typeof window !== 'undefined') {
    document.cookie = `${AUTH_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }
}

// Store user in session (client-side)
export function storeUserSession(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    setAuthCookie(user)
  }
}

// Get user from session (client-side)
export function getUserSession(): User | null {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as User
      } catch {
        return null
      }
    }
  }
  return null
}

// Clear user session
export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('au_monitoring_user')
    clearAuthCookie()
  }
}

// Role management functions
export async function updateUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(USERS_TABLE)
      .update({ [USERS_ROLE_COL]: role })
      .eq(USERS_ID_COL, userId)

    return !error
  } catch (error) {
    console.error('Error updating user role:', error)
    return false
  }
}

export async function getAllUsers(): Promise<Record<string, unknown>[]> {
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select(`${USERS_ID_COL}, ${USERS_USERNAME_COL}, ${USERS_EMAIL_COL}, ${USERS_NAME_COL}, ${USERS_ROLE_COL}`)
      .order(USERS_USERNAME_COL)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(USERS_TABLE)
      .delete()
      .eq(USERS_ID_COL, userId)

    return !error
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

export async function updateUserInfo(userId: string, updates: { name?: string; email?: string }): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(USERS_TABLE)
      .update(updates)
      .eq(USERS_ID_COL, userId)

    return !error
  } catch (error) {
    console.error('Error updating user info:', error)
    return false
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getUserSession() !== null
}
