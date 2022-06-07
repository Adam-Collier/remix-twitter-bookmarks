import type { LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Link, Outlet, useLoaderData, useLocation } from '@remix-run/react'
import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { ClientOnly } from 'remix-utils'
import { Footer } from '~/components/Footer'
import { getUser, logout } from '~/utils/session.server'
import {
  getBookmarkMonths,
  getBookmarkYears,
  getPopularUsers,
  updateSearchParams,
} from '~/utils/utils'
import { Logo } from '~/svg/Logo'
import { FilterButton } from '~/components/FilterButton'
import { Cross1Icon } from '@radix-ui/react-icons'

export type AllBookmarks = {
  data: {
    created_at: string
    author_id: string
  }[]
  includes: {
    users:
      | {
          id?: string
          name: string
          username: string
          user: string
          verified: Boolean
          profile_image_url: string
        }[]
    media: any[]
  }
}

// this is the atom we will use to store all of our bookmarks
export const allBookmarksAtom = atomWithStorage<AllBookmarks | null>(
  'allBookmarks',
  null
)
// this atom will store the filtered items
export const bookmarksAtom = atom<AllBookmarks | null>(null)

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

    return json({
      user,
    })
  } catch (err) {
    console.log(err)
  }
}

const getAllBookmarks = async (setAllBookmarks: any) => {
  try {
    const response = await fetch('/getAllBookmarks')
    const json = await response.json()
    setAllBookmarks(json)
    return
  } catch (err) {
    console.log(err)
  }
}

const Bookmarks = () => {
  const data = useLoaderData()
  const { user } = data
  const { search } = useLocation()
  const params = new URLSearchParams(search)

  const query = params.get('query')
  const yearParam = params.get('year')
  const monthParam = params.get('month')
  const openParam = params.get('open')

  const [allBookmarks, setAllBookmarks] = useAtom<AllBookmarks | null>(
    allBookmarksAtom
  )
  const [bookmarks, setBookmarks] = useAtom(bookmarksAtom)
  const [popularUsers, setPopularUsers] = useState<string[] | null>(null)
  const [bookmarkYears, setBookmarkYears] = useState<string[] | null>(null)

  useEffect(() => {
    if (!allBookmarks) {
      setBookmarks(null)
      setPopularUsers(null)
      setBookmarkYears(null)
      getAllBookmarks(setAllBookmarks)
    }
  }, [allBookmarks])

  useEffect(() => {
    if (allBookmarks) {
      // get the 10 most popular
      let mostPopular = getPopularUsers(allBookmarks)
      let getYears = getBookmarkYears(allBookmarks)
      setPopularUsers(mostPopular.slice(0, 10))
      setBookmarkYears(getYears)
    }
  }, [allBookmarks])

  return (
    <main>
      <div className="relative bg-twitter-dark flex">
        <section
          className={`bg-twitter-dark max-w-md w-full fixed z-20 top-0 left-0 bottom-0 space-y-4 bg-[url(/bg_texture.webp)] p-4 sm:p-8 pr-14 sm:pr-14 sm:translate-x-0 sm:relative sm:self-start sm:sticky sm:top-0 sm:max-w-md sm:h-screen transition-transform ${
            openParam ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div>
            <div className="max-w-md mx-auto flex justify-between items-center h-8 sm:hidden">
              <Link
                to={`/bookmarks?${updateSearchParams(search, 'open')}`}
                className="text-white ml-auto"
              >
                <Cross1Icon />
              </Link>
            </div>
            <Link to="/bookmarks" className="pb-4 hidden sm:block">
              <Logo className="text-white" />
            </Link>
          </div>

          <p className="text-white text-sm">
            Let's help you find your bookmarks quickly and easily! Use the
            filters below or freestyle it in the search bar.
          </p>
          <div className="w-full">
            <Link
              to="/bookmarks"
              className={[
                'block text-center w-full border rounded-lg px-4 py-2 text-sm text-[#15202B] ',
                search
                  ? 'bg-white border-white'
                  : 'bg-gray-500 text-gray-300 border-gray-400',
              ].join(' ')}
            >
              Clear Filters
            </Link>
          </div>
          <ClientOnly>
            {() => {
              if (popularUsers) {
                return (
                  <>
                    <h3 className="text-white">
                      Your favourite bookmark authors...
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {popularUsers.map((username, index) => {
                        // create the updated query params
                        let newParams = updateSearchParams(
                          search,
                          'query',
                          username
                        )

                        newParams = updateSearchParams(newParams, 'month')
                        newParams = updateSearchParams(newParams, 'year')

                        return (
                          <FilterButton
                            key={username}
                            params={newParams}
                            active={query === username}
                            text={`@${username}`}
                          />
                        )
                      })}
                    </div>
                  </>
                )
              }
            }}
          </ClientOnly>
          <ClientOnly>
            {() => {
              if (bookmarkYears) {
                return (
                  <>
                    <h3 className="text-white">Filter by year...</h3>
                    <div className="flex flex-wrap gap-1">
                      {bookmarkYears.map((bookmarkYear, index) => {
                        // create the updated query params
                        let newParams = updateSearchParams(
                          search,
                          'year',
                          bookmarkYear
                        )

                        newParams = updateSearchParams(newParams, 'month')

                        return (
                          <FilterButton
                            key={bookmarkYear}
                            params={newParams}
                            active={bookmarkYear.toString() === yearParam}
                            text={bookmarkYear}
                          />
                        )
                      })}
                    </div>
                  </>
                )
              }
            }}
          </ClientOnly>
          <ClientOnly>
            {() => {
              if (bookmarkYears && bookmarks) {
                // get all of the available months
                const bookmarkMonths = getBookmarkMonths(bookmarks)

                if (!bookmarkMonths || !bookmarkMonths.length) return null

                return (
                  <>
                    <h3 className="text-white">Filter by month...</h3>
                    <div className="flex flex-wrap gap-1">
                      {bookmarkMonths.map((bookmarkMonth, index) => {
                        // create the updated query params
                        const newParams = updateSearchParams(
                          search,
                          'month',
                          bookmarkMonth as string
                        )

                        return (
                          <FilterButton
                            key={bookmarkMonth}
                            params={newParams}
                            active={bookmarkMonth === monthParam}
                            text={bookmarkMonth}
                          />
                        )
                      })}
                    </div>
                  </>
                )
              }
            }}
          </ClientOnly>
          {/* page tear image */}
          <img
            className="absolute top-0 -right-[2px] bottom-0 !mt-0 h-screen z-10"
            src="/page_tear.svg"
            alt="page tear"
          />

          <Footer
            user={user}
            className="absolute bottom-0 right-0 left-0 px-8 py-4 bg-twitter-dark border-t border-[#375471] border-dashed"
          />
        </section>
        <section className="bg-white w-full bg-[url(/bg_texture.webp)] bg-fixed grow md:h-screen md:overflow-y-scroll">
          <Outlet />
        </section>
      </div>
    </main>
  )
}

export default Bookmarks
