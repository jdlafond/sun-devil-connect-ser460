import { supabase } from '../supabase'

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, message: error.message }
  return { success: true, message: 'Login successful!', user: data.user }
}

export async function signUpUser(
  displayName: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) return { success: false, message: error.message }

  if (data?.user) {
    const { error: insertError } = await supabase.from('Users').insert([{
      uuid: data.user.id,
      email,
      display_name: displayName,
      role: 'STUDENT',
    }])
    if (insertError) return { success: false, message: 'Account created but failed to save profile.' }
  }

  return { success: true, message: 'Check your email for confirmation!' }
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) return { success: false, message: error.message }
  return { success: true }
}
