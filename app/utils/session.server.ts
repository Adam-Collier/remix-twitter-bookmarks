import { createCookieSessionStorage, redirect } from '@remix-run/node';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set');
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
});

type User = {
  access_token: string;
  id: string;
  name: string;
  username: string;
};

export async function createTwitterSession(user: User, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('user', user);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function getUser(
  request: Request
): Promise<User | Response | null> {
  const session = await getSession(request);
  const user = session.get('user');

  // if there is no user return null
  if (!user) return null;

  // check whether the access token has expired
  // if it has logout so the user can log in again
  if (new Date(user.expires_at) < new Date()) {
    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.destroySession(session),
      },
    });
  }

  return user;
}

export const logout = async (request: Request) => {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
};
