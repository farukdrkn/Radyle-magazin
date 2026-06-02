import { cookies } from 'next/headers'
import FarukLayoutClient from './FarukLayoutClient'

export default async function FarukLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const isAuthenticated = !!cookieStore.get('auth_token')?.value

  return (
    <FarukLayoutClient isAuthenticated={isAuthenticated}>
      {children}
    </FarukLayoutClient>
  )
}
