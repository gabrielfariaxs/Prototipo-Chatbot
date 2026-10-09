import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { AdminDashboard } from '../components/Metrics/AdminDashboard'
import { LoginScreen } from '../components/common/LoginScreen'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/admin')({
  component: AdminDashboardRoute,
})

function AdminDashboardRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then((res: any) => {
      setIsAuthenticated(!!res?.data?.session?.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setIsAuthenticated(!!session?.user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f29de]"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <LoginScreen 
          onSuccess={() => setIsAuthenticated(true)}
          onBackToMenu={() => { window.location.href = '/' }}
        />
      </div>
    )
  }

  return <AdminDashboard />
}
