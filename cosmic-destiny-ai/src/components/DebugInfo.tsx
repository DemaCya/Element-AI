'use client'

import { useUser } from '@/contexts/UserContext'

export default function DebugInfo() {
  const { user, profile, loading } = useUser()

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>User: {user ? user.id : 'null'}</div>
        <div>Profile: {profile ? profile.full_name || 'exists' : 'null'}</div>
        <div>Time: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
