import { Form, useLocation } from '@remix-run/react'
import { useAtom } from 'jotai'
import { Tweet } from '~/components/Tweet'
import { allBookmarksAtom, bookmarksAtom } from '../bookmarks'
import { ClientOnly } from 'remix-utils'
import React, { useEffect } from 'react'
import { Select } from '~/components/Select'
import { getFilteredBookmarks, mediaLookup, userLookup } from '~/utils/utils'
import { Spinner } from '~/components/Spinner'
import { Logo } from '~/svg/Logo'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Link } from 'react-router-dom'

const Bookmarks = () => {
  const [allBookmarks] = useAtom(allBookmarksAtom)
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom)
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  let queryValue = params.get('query')
  let sortQuery = params.get('sort')
  let yearQuery = params.get('year')
  let monthQuery = params.get('month')

  useEffect(() => {
    if (allBookmarks && (queryValue || sortQuery || yearQuery)) {
      let results = getFilteredBookmarks(allBookmarks, {
        yearQuery,
        queryValue,
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
  }, [queryValue, sortQuery, yearQuery, allBookmarks])

  const currentParams = params
  currentParams.delete('query')

  let filteredBookmarks = monthQuery
    ? bookmarks?.data.filter((tweet) => {
        let tweetMonth = new Date(tweet.created_at).toLocaleString('default', {
          month: 'long',
        })
        return tweetMonth === monthQuery ? true : false
      })
    : bookmarks?.data

  return (
    <div className="space-y-4 pb-16">
      <header className="sticky top-0 z-10 bg-white sm:pt-8 px-4">
        <div className="max-w-md mx-auto flex justify-between items-center p-4 sm:hidden">
          <Logo className="text-twitter-dark" />
          <Link to={`/bookmarks?${search}&open=sidebar`}>
            <HamburgerMenuIcon />
          </Link>
        </div>
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
                      | {filteredBookmarks ? filteredBookmarks?.length : 0}{' '}
                      results
                    </p>
                  )}
                </div>
              )}
            </ClientOnly>
            <Select className="ml-auto" />
          </div>
        </div>
      </header>
      <section className="max-w-md px-4 pb-16 w-full mx-auto flex flex-col items-center space-y-4">
        <ClientOnly>
          {() => {
            if (allBookmarks && bookmarks) {
              let currentMonthYear = ''
              return filteredBookmarks?.map((tweet: any, index: number) => {
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

                if (!user) return null

                let tweetSection = (
                  <React.Fragment key={tweet.id}>
                    {tweetMonthYear !== currentMonthYear ? (
                      <div className="flex items-center w-full space-x-4 py-4 first:pt-0">
                        <span className="w-full border-t border-gray-400 border-dashed shrink"></span>
                        <p className="shrink-0 text-gray-400 text-xs">
                          {tweetMonthYear}
                        </p>
                        <span className="w-full border-t border-gray-400 border-dashed shrink"></span>
                      </div>
                    ) : (
                      ''
                    )}
                    <Tweet
                      className="bg-white rouded shadow-md"
                      name={user.user}
                      username={user.username}
                      media={media}
                      profileImageUrl={user.profile_image_url}
                      verified={user.verified}
                      tweetId={tweet.id}
                      date={tweet.created_at}
                      text={tweet.text}
                    />
                  </React.Fragment>
                )

                currentMonthYear = tweetMonthYear

                return tweetSection
              })
            } else {
              return (
                // taken from https://github.com/nickbruun/svg-loaders
                <Spinner />
              )
            }
          }}
        </ClientOnly>
      </section>
    </div>
  )
}

export default Bookmarks
