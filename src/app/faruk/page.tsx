import { cookies } from 'next/headers'
import LoginForm from './LoginForm'
import Dashboard from './Dashboard'

export default async function FarukPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (token) {
    return <Dashboard />
  }

  return <LoginForm />
}
