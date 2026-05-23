import { useGoogleLogin } from '@react-oauth/google'
import { useEffect } from 'react'

type Props = {
  onRegister: (login: () => void) => void
  onAccessToken: (accessToken: string) => void
  onCancel: () => void
}

/** Registers Google popup login; must render inside GoogleOAuthProvider. */
export function GoogleOAuthBridge({ onRegister, onAccessToken, onCancel }: Props) {
  const login = useGoogleLogin({
    flow: 'implicit',
    onSuccess: (tokenResponse) => {
      if (tokenResponse.access_token) {
        onAccessToken(tokenResponse.access_token)
      } else {
        onCancel()
      }
    },
    onError: onCancel,
  })

  useEffect(() => {
    onRegister(() => login())
  }, [login, onRegister])

  return null
}
