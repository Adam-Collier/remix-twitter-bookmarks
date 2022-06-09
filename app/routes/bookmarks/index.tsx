import { Form, useLocation } from '@remix-run/react'
import { useAtom } from 'jotai'
import { allBookmarksAtom, bookmarksAtom } from '../bookmarks'
import { ClientOnly } from 'remix-utils'
import { useEffect } from 'react'
import { Select } from '~/components/Select'
import { getFilteredBookmarks } from '~/utils/utils'
import { Spinner } from '~/components/Spinner'
import { Logo } from '~/svg/Logo'
import { HamburgerMenuIcon, UpdateIcon } from '@radix-ui/react-icons'
import { Link } from 'react-router-dom'
import { InfiniteScroll } from '~/components/InfiniteScroll'
import { SearchInfo } from '~/components/SearchInfo'

const Bookmarks = () => {
  const [allBookmarks, setAllBookmarks] = useAtom(allBookmarksAtom)
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
    <div className="pb-16">
      <header className="sticky top-0 z-10 bg-white sm:pt-6 px-4">
        <div className="max-w-md mx-auto flex justify-between items-center p-4 sm:hidden">
          <Logo className="text-twitter-dark" />
          <Link to={`/bookmarks?${search}&open=sidebar`}>
            <HamburgerMenuIcon />
          </Link>
        </div>
        <div className="max-w-[622px] mx-auto">
          <Form action={`/bookmarks?${currentParams}`}>
            <input
              className="border border-zinc-800 w-full px-4 py-2.5 rounded-full"
              type="text"
              name="query"
              placeholder="Search tweets..."
              defaultValue={params.get('query') ?? ('' as string)}
            />
          </Form>
          <div className="flex justify-between items-center">
            <SearchInfo filteredBookmarks={filteredBookmarks} />
            <Select className="ml-auto" />
          </div>
        </div>
      </header>
      <section className="max-w-[622px] px-4 pb-16 w-full mx-auto flex flex-col items-center">
        <ClientOnly>
          {() => {
            if (allBookmarks && bookmarks) {
              return (
                <>
                  <div className="w-full bg-gray-50 mb-4">
                    <button
                      className="flex justify-center items-center text-xs p-2 space-x-1 w-full hover:bg-gray-100"
                      onClick={() => {
                        setAllBookmarks(null)
                      }}
                    >
                      <UpdateIcon /> <span>Refresh bookmarks</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    <InfiniteScroll data={filteredBookmarks} />
                  </div>
                </>
              )
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
