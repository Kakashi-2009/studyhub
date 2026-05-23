export type GoogleUserInfo = {
  name: string
  email: string
  picture: string
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch Google profile')
  const data = await res.json()
  return {
    name: data.name ?? 'User',
    email: data.email ?? '',
    picture: data.picture ?? '',
  }
}

export function isGoogleClientConfigured(): boolean {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID
  return Boolean(id && !id.includes('paste_your'))
}
