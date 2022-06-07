import { createCookieSessionStorage, redirect } from '@remix-run/node'

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: 'twitter_session',
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

type User = {
  access_token: string
  id: string
  name: string
  username: string
  expires_at: string
  refresh_token: string
}

export async function createTwitterSession(user: User, redirectTo: string) {
  const session = await sessionStorage.getSession()
  session.set('user', user)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

export async function getUser(request: Request): Promise<User | null> {
  const session = await getSession(request)
  const user = session.get('user')

  // if there is no user return null
  if (!user) {
    return null
  }

  return user
}

export const logout = async (request: Request) => {
  const session = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

export const refreshToken = async (request: Request, user: User) => {
  const session = await sessionStorage.getSession()
  const { refresh_token } = user
  // taken from https://github.com/twitterdev/bookmarks-search/blob/c2eb26b8354fe0e861c26e1c7bb77a4bba68a967/twitter-oauth/index.js#L33-L44
  const twitterUrl = 'https://api.twitter.com/2/oauth2/token'
  const params = new URLSearchParams()
  params.append('grant_type', 'refresh_token')
  params.append('client_id', process.env.TWITTER_CLIENT_ID as string)
  params.append('redirect_uri', process.env.TWITTER_REDIRECT_URI as string)
  params.append('refresh_token', refresh_token)

  try {
    const response = await fetch(twitterUrl, { method: 'POST', body: params })
    const refreshTokenJSON = await response.json()

    session.set('user', {
      ...user,
      ...refreshTokenJSON,
      expires_at: new Date().getTime() + refreshTokenJSON.expires_in * 1000,
    })

    return redirect('/bookmarks', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    })
  } catch (err) {
    return logout(request)
  }
}
