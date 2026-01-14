import { supabase } from './supabase'

export interface User {
  id: string
  username: string
  email: string
  name: string
}

const USERS_TABLE = process.env.NEXT_PUBLIC_USERS_TABLE || 'users'
const USERS_ID_COL = process.env.NEXT_PUBLIC_USERS_ID_COL || 'id'
const USERS_USERNAME_COL = process.env.NEXT_PUBLIC_USERS_USERNAME_COL || 'username'
const USERS_EMAIL_COL = process.env.NEXT_PUBLIC_USERS_EMAIL_COL || 'email'
const USERS_NAME_COL = process.env.NEXT_PUBLIC_USERS_NAME_COL || 'name'

export async function getUserById(userId: string) {
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq(USERS_ID_COL, userId)
      .maybeSingle()

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error fetching user by ID:', error)
      }
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'User profile not found' }
    }

    return { 
      success: true, 
      user: {
        id: data[USERS_ID_COL],
        username: data[USERS_USERNAME_COL],
        email: data[USERS_EMAIL_COL],
        name: data[USERS_NAME_COL]
      } as User
    }
  } catch (error) {
    console.error('Unexpected error in getUserById:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

export async function getUserByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from(USERS_TABLE)
      .select('*')
      .eq(USERS_USERNAME_COL, username)
      .maybeSingle()

    if (error) {
      console.error('Error fetching user by username:', error)
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'User not found' }
    }

    return { 
      success: true, 
      user: {
        id: data[USERS_ID_COL],
        username: data[USERS_USERNAME_COL],
        email: data[USERS_EMAIL_COL],
        name: data[USERS_NAME_COL]
      } as User
    }
  } catch (error) {
    console.error('Unexpected error in getUserByUsername:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}
