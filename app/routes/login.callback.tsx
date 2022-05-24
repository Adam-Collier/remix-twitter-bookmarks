import type { LoaderFunction } from '@remix-run/server-runtime'
import { redirect } from '@remix-run/server-runtime'
import { createTwitterSession } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  // grab the code we get in the callback
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return redirect('/')
  }
  // create the params we will need;
  const url = 'https://api.twitter.com/2/oauth2/token'
  const params = new URLSearchParams()
  params.append('grant_type', 'authorization_code')
  params.append('client_id', process.env.TWITTER_CLIENT_ID as string)
  params.append('redirect_uri', process.env.TWITTER_REDIRECT_URI as string)
  params.append('code_verifier', 'challenge')
  params.append('code', code)

  // fetch the access token
  const tokenResponse = await fetch(url, {
    method: 'POST',
    body: params,
  })

  // get the JSON
  const tokenJSON = await tokenResponse.json()

  // using the token we can now get the user
  const userResponse = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url',
    {
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
        Authorization: `Bearer ${tokenJSON.access_token}`,
      },
    }
  )

  const { data: userJSON } = await userResponse.json()

  const user = {
    ...tokenJSON,
    expires_at: new Date().getTime() + tokenJSON.expires_in * 1000,
    ...userJSON,
  }

  return createTwitterSession(user, '/bookmarks')
}
