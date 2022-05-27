import { Form, useLocation, useSearchParams } from '@remix-run/react'
import { useAtom } from 'jotai'
import { Tweet } from '~/components/Tweet'
import { userLookup } from '../bookmarks'
import { allBookmarksAtom } from '../bookmarks'
import { ClientOnly } from 'remix-utils'
import { useEffect, useState } from 'react'
import Select from '~/components/Select'
import { mediaLookup } from '~/utils/utils'

const Bookmarks = () => {
  const [allBookmarks] = useAtom<AllBookmarks | null>(allBookmarksAtom)
  const [bookmarks, setBookmarks] = useState<AllBookmarks | null>(allBookmarks)
  const [params] = useSearchParams()
  const { search } = useLocation()
  let queryValue = params.get('query')
  let sortQuery = params.get('sort')

  useEffect(() => {
    if (allBookmarks && (queryValue || sortQuery)) {
      let results = allBookmarks?.data.filter((tweet: any) => {
        const annotations =
          tweet.context_annotations?.map(
            ({ entity }: { entity: { name: string } }) => entity.name
          ) ?? []
        const twitterUser = userLookup(
          tweet.author_id,
          allBookmarks.includes.users
        )
        const result = [
          tweet.text,
          twitterUser.name,
          twitterUser.username,
          ...annotations,
        ].find((token) => token.toLowerCase().match(queryValue?.toLowerCase()))

        if (result) {
          return tweet
        }

        return false
      })

      if (params.get('sort') === 'oldest') {
        results.sort((a, b) => {
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        })
      }

      setBookmarks({
        ...allBookmarks,
        data: results,
      })
    } else {
      setBookmarks(allBookmarks)
    }
  }, [queryValue, sortQuery, allBookmarks, params])

  const currentParams = new URLSearchParams(search)
  currentParams.delete('query')

  return (
    <div className="space-y-4">
      <header className="sticky top-0 z-10 bg-white pt-8 pb-2">
        <div className="max-w-md mx-auto">
          <Form action={`/bookmarks?${currentParams}`}>
            <input
              className="border border-zinc-800 w-full px-4 py-2.5 rounded-full"
              type="text"
              name="query"
              placeholder="Search tweets..."
              defaultValue={params.get('query') ?? ('' as string)}
            />
          </Form>
          <div className="flex justify-between items-center pt-2">
            <ClientOnly>
              {() => (
                <div className="flex w-full">
                  <p className="text-xs pl-4 text-zinc-400 font-light pr-1">
                    {allBookmarks ? allBookmarks?.data?.length : 0} searchable
                    bookmarks
                  </p>
                  {queryValue && (
                    <p className="text-xs text-zinc-400 font-light">
                      | {bookmarks ? bookmarks?.data?.length : 0} results
                    </p>
                  )}
                </div>
              )}
            </ClientOnly>
            <Select />
          </div>
        </div>
      </header>
      <section className="max-w-md w-full mx-auto flex flex-col items-center space-y-4">
        <ClientOnly>
          {() => {
            if (allBookmarks && bookmarks) {
              let currentMonthYear = ''
              return bookmarks.data.map((tweet: any, index: number) => {
                const user = userLookup(
                  tweet.author_id,
                  bookmarks.includes.users
                )

                const media = mediaLookup(
                  tweet?.attachments?.media_keys[0],
                  bookmarks.includes.media
                )

                // get the month and year of the tweet
                let tweetMonthYear = new Date(
                  tweet.created_at
                ).toLocaleDateString('en-GB', {
                  month: 'long',
                  year: 'numeric',
                })

                let tweetSection = (
                  <>
                    {tweetMonthYear !== currentMonthYear ? (
                      <div
                        className="flex items-center w-full space-x-4"
                        id={tweetMonthYear}
                      >
                        <span className="w-full border-t border-gray-400 shrink"></span>
                        <p className="shrink-0 py-2 text-gray-400">
                          {tweetMonthYear}
                        </p>
                        <span className="w-full border-t border-gray-400 shrink"></span>
                      </div>
                    ) : (
                      ''
                    )}
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
                  </>
                )

                currentMonthYear = tweetMonthYear

                return tweetSection
              })
            } else {
              return (
                // taken from https://github.com/nickbruun/svg-loaders
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2400 2400"
                  width="24"
                  height="24"
                >
                  <g
                    strokeWidth="200"
                    strokeLinecap="round"
                    stroke="#000"
                    fill="none"
                  >
                    <path d="M1200 600V100" />
                    <path opacity=".5" d="M1200 2300v-500" />
                    <path opacity=".917" d="M900 680.4l-250-433" />
                    <path opacity=".417" d="M1750 2152.6l-250-433" />
                    <path opacity=".833" d="M680.4 900l-433-250" />
                    <path opacity=".333" d="M2152.6 1750l-433-250" />
                    <path opacity=".75" d="M600 1200H100" />
                    <path opacity=".25" d="M2300 1200h-500" />
                    <path opacity=".667" d="M680.4 1500l-433 250" />
                    <path opacity=".167" d="M2152.6 650l-433 250" />
                    <path opacity=".583" d="M900 1719.6l-250 433" />
                    <path opacity=".083" d="M1750 247.4l-250 433" />
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      keyTimes="0;0.08333;0.16667;0.25;0.33333;0.41667;0.5;0.58333;0.66667;0.75;0.83333;0.91667"
                      values="0 1199 1199;30 1199 1199;60 1199 1199;90 1199 1199;120 1199 1199;150 1199 1199;180 1199 1199;210 1199 1199;240 1199 1199;270 1199 1199;300 1199 1199;330 1199 1199"
                      dur="0.83333s"
                      begin="0s"
                      repeatCount="indefinite"
                      calcMode="discrete"
                    />
                  </g>
                </svg>
              )
            }
          }}
        </ClientOnly>
      </section>
    </div>
  )
}

export default Bookmarks
