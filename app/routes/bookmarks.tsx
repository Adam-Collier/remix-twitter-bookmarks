import type { LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData, useSearchParams } from '@remix-run/react'
import { getUser, logout } from '~/utils/session.server'

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
          bookmarks.data.map((tweet, index) => {
            const user = userLookup(tweet.author_id, bookmarks.includes.users)

            const media = mediaLookup(
              tweet?.attachments?.media_keys[0],
              bookmarks.includes.media
            )

            return (
              <a
                className="block flex space-x-4"
                key={index}
                href={`https://twitter.com/${user.username}/status/${tweet.id}`}
              >
                <div className="relative w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0">
                  <img
                    className="absolute top-0 left-0 w-full h-full"
                    src={user.profile_image_url}
                    alt={`${user.username} profile`}
                  />
                </div>
                <div className="flex-col space-y-2">
                  <header className="flex space-x-4 items-center">
                    <div className="flex items-center space-x-1">
                      <h2>{user.name} </h2>
                      {user.verified && (
                        <img
                          className="w-4 h-4 text-red"
                          src="/verified.svg"
                          alt=""
                        />
                      )}
                      <p>
                        @{user.username} ·{' '}
                        {/* {new Date(tweet.created_at).toLocaleString()} */}
                        {new Date(tweet.created_at).toLocaleDateString(
                          undefined,
                          {
                            year: undefined,
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </header>
                  {media && media.type === 'photo' && (
                    <div
                      className="relative rounded-md overflow-hidden"
                      style={{
                        paddingTop: `${(media.height / media.width) * 100}%`,
                      }}
                    >
                      <img
                        className="absolute top-0 left-0 w-full h-full"
                        src={media.url}
                        alt="tweet media"
                      />
                    </div>
                  )}

                  {media && media.type === 'video' && (
                    <div>
                      <p className="text-xs p-2 bg-blue-100 text-blue-600 rounded-sm">
                        This tweet contains a video but Twitters Bookmark API
                        doesnt currently support grabbing their URL.
                      </p>
                    </div>
                  )}
                  <p>{tweet.text}</p>
                </div>
              </a>
            )
          })}
      </div>
    </main>
  )
}

export default Bookmarks
