import { Form, useSearchParams } from '@remix-run/react'
import { useAtom } from 'jotai'
import { Tweet } from '~/components/Tweet'
import { useMatchesData } from '~/utils/utils'
import { userLookup } from '../bookmarks'
import { allBookmarksAtom } from '../bookmarks'
import { ClientOnly } from 'remix-utils'

const mediaLookup = (mediaId: string, mediaList: any) =>
  mediaList.find((media) => media.media_key === mediaId)

const Bookmarks = () => {
  const [allBookmarks] = useAtom(allBookmarksAtom)
  const [params] = useSearchParams()
  let queryValue = params.get('query')

  const { bookmarks } = useMatchesData('routes/bookmarks')

  if (queryValue) {
    const results = bookmarks.data.filter((tweet: any) => {
      const annotations =
        tweet.context_annotations?.map(({ entity }) => entity.name) ?? []
      const twitterUser = userLookup(tweet.author_id, bookmarks.includes.users)
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

    bookmarks.data = results
  }

  return (
    <div className="max-w-md w-full mx-auto space-y-8">
      <div>
        <Form>
          <input
            className="border border-zinc-800 w-full px-4 py-2.5 rounded-full"
            type="text"
            name="query"
            placeholder="Search tweets..."
            defaultValue={params.get('query') as string}
          />
        </Form>
        <div className="flex justify-between">
          {params.get('query') ? (
            <p className="text-xs pl-4 pt-2 text-zinc-400 font-light">
              {bookmarks.data.length} results
            </p>
          ) : (
            <p className="text-xs pl-4 pt-2 text-zinc-400 font-light">
              showing {bookmarks.data.length} bookmarks
            </p>
          )}
          <ClientOnly>
            {() => (
              <p className="text-xs pl-4 pt-2 text-zinc-400 font-light pr-4">
                {allBookmarks ? allBookmarks?.data?.length : 0} searchable
                bookmarks
              </p>
            )}
          </ClientOnly>
        </div>
      </div>

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
              className="bg-white rouded shadow-md"
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
  )
}

export default Bookmarks
