import type { LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import { getUser, logout } from '~/utils/session.server'
import { Tweet } from '~/components/Tweet'

const userLookup = (userId: string, users: any) =>
  users.find((user) => user.id === userId)

const mediaLookup = (mediaId: string, mediaList: any) =>
  mediaList.find((media) => media.media_key === mediaId)

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await getUser(request)

    if (!user) {
      return redirect('/')
    }

    // check whether the access token has expired
    if (new Date(user.expires_at) < new Date()) {
      return logout(request)
    }

    const { id, access_token } = user

    const bookmarksUrl = new URL(
      `https://api.twitter.com/2/users/${id}/bookmarks`
    )

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

    const bookmarks = await response.json()

    // grab the query from the url if there is one
    const url = new URL(request.url)
    const queryValue = url.searchParams.get('query')
    // if there is a query then we can start to filter the tweets
    if (queryValue) {
      const results = bookmarks.data.filter((tweet: any) => {
        const annotations =
          tweet.context_annotations?.map(({ entity }) => entity.name) ?? []
        const twitterUser = userLookup(
          tweet.author_id,
          bookmarks.includes.users
        )
        const result = [
          tweet.text,
          twitterUser.name,
          twitterUser.username,
          ...annotations,
        ].find((token) => token.toLowerCase().match(queryValue))

        if (result) {
          return tweet
        }

        return false
      })

      return json({
        user,
        bookmarks: {
          ...bookmarks,
          data: results,
        },
      })
    }

    return json({
      user,
      bookmarks,
    })
  } catch (err) {
    console.log(err)
  }
}

const Bookmarks = () => {
  const data = useLoaderData()
  const { bookmarks, user } = data
  const [params] = useSearchParams()

  if (!bookmarks) {
    return <p>we couldnt grab your bookmarks!</p>
  }

  return (
    <main className="flex flex-col p-4">
      <Form action="/logout" method="post" className="ml-auto">
        <button
          name="logout"
          className="rounded-full bg-[#1d9bf0] text-white py-3 px-4 hover:bg-[#1a8cd8]"
          aria-label="logout"
        >
          Logout
        </button>
      </Form>

      <div className="max-w-md w-full mx-auto space-y-8">
        <h1 className="text-2xl">{user.name.split(' ')[0]}'s bookmarks!</h1>
        <Form>
          <input
            className="border border-gray-400 w-full p-2 rounded"
            type="text"
            name="query"
            placeholder="Search tweets..."
            defaultValue={params.get('query') as string}
          />
        </Form>

        {!bookmarks.data.length && (
          <p>There are no bookmarks found with your search...</p>
        )}

        {bookmarks.data.length > 0 &&
          bookmarks.data.map((tweet: any) => {
            const user = userLookup(tweet.author_id, bookmarks.includes.users)

            const media = mediaLookup(
              tweet?.attachments?.media_keys[0],
              bookmarks.includes.media
            )

            return (
              <Tweet
                name={user.user}
                username={user.username}
                media={media}
                key={tweet.id}
                profileImageUrl={user.profile_image_url}
                verified={user.verified}
                tweetId={tweet.id}
                date={tweet.created_at}
                text={tweet.text}
              />
            )
          })}
      </div>
    </main>
  )
}

export default Bookmarks
