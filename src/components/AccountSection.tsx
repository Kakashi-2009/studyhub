import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useUser } from '../context/UserContext'
import { UserAvatar } from './UserAvatar'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.026 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.64 6.053 28.991 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.019 0-9.47-2.87-11.652-7.062l-6.52 5.016C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c1.649 4.657 6.33 8 11.697 8 3.059 0 5.842-1.154 7.961-3.039l5.657 5.657C39.64 43.947 44.989 46 50 46c6.627 0 12-5.373 12-12 0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

function FacebookLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export function AccountSection() {
  const { user, isLoggedIn, authLoading, signInWithGoogle, signOut, switchAccount, loginWithEmail } =
    useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (loginWithEmail(email, password)) {
      setPassword('')
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
        <p className="text-sm text-muted">Signing in with Google…</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-lg font-semibold text-app">{user.name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
            {user.provider === 'google' && (
              <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                Connected via Google
              </span>
            )}
            {user.provider === 'email' && (
              <span className="mt-2 inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-muted">
                Signed in with Email
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={switchAccount}
          className="w-full rounded-lg border border-app py-2.5 text-sm text-app hover:bg-white/5"
        >
          Switch Account
        </button>
        <button
          type="button"
          onClick={signOut}
          className="w-full rounded-lg border border-red-500/50 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={signInWithGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50"
      >
        <GoogleLogo />
        Sign in with Google
      </button>

      <div className="relative">
        <button
          type="button"
          disabled
          title="Facebook login coming soon!"
          className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-app bg-[#1877F2]/40 py-2.5 text-sm font-medium text-white/70 opacity-50"
        >
          <FacebookLogo />
          Sign in with Facebook
        </button>
        <span className="absolute -right-1 -top-2 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950">
          Coming Soon
        </span>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-2 rounded-lg border border-app p-3">
        <p className="text-xs font-medium text-muted">Sign in with Email</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app outline-none focus:border-[var(--accent)]"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-app bg-[var(--bg-primary)] px-3 py-2 text-sm text-app outline-none focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          className="w-full rounded-lg border border-app py-2 text-sm font-medium text-app hover:bg-white/5"
        >
          Sign in with Email
        </button>
      </form>
    </div>
  )
}
