import type { LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { getUser } from '~/utils/session.server'
import type { AllBookmarks } from './bookmarks'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)
  if (!user) {
    return redirect('/')
  }
  const { id, access_token } = user

  // let's get all of the users bookmarks here and return them to the client to persist locally
  // as it stands we can only get 100 at a time with a potential max of 800
  let bookmarks: AllBookmarks = {
    data: [],
    includes: {
      users: [],
      media: [],
    },
  }

  const getBookmarks = async (token: string) => {
    const bookmarksUrl = new URL(
      `https://api.twitter.com/2/users/${id}/bookmarks`
    )

    if (token) {
      bookmarksUrl.searchParams.append('pagination_token', token)
    }

    bookmarksUrl.searchParams.append(
      'tweet.fields',
      'context_annotations,created_at'
    )
    bookmarksUrl.searchParams.append(
      'expansions',
      'author_id,attachments.media_keys'
    )
    bookmarksUrl.searchParams.append(
      'user.fields',
      'verified,profile_image_url'
    )
    bookmarksUrl.searchParams.append('media.fields', 'type,url,width,height')

    const response = await fetch(bookmarksUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    })

    const json = await response.json()

    // bookmarks.data is an array so its easy peasy
    bookmarks.data = [...bookmarks.data, ...json.data]
    // bookmarks.includes is json so we need to do a little more fiddling
    bookmarks.includes = {
      ...bookmarks.includes,
      users: [...bookmarks.includes.users, ...json.includes.users],
      media: [...bookmarks.includes.media, ...json.includes.media],
    }

    if (json.meta.next_token) {
      await getBookmarks(json.meta.next_token)
    }

    return
  }

  await getBookmarks('')

  return json(bookmarks)
}
