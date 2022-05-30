import type { LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useSearchParams,
} from '@remix-run/react'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useEffect, useState } from 'react'
import { ClientOnly } from 'remix-utils'
import { Spinner } from '~/components/Spinner'
import { getUser, logout } from '~/utils/session.server'
import {
  getBookmarkYears,
  getPopularUsers,
  updateSearchParams,
} from '~/utils/utils'

export type AllBookmarks = {
  data: {
    created_at: string
    author_id: string
  }[]
  includes: {
    users: any[]
    media: any[]
  }
}

// this is the atom we will use to store all of our bookmarks
export const allBookmarksAtom = atomWithStorage('allBookmarks', null)

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
  const [params] = useSearchParams()
  const query = params.get('query')
  const yearParam = params.get('year')
  const [allBookmarks, setAllBookmarks] = useAtom<AllBookmarks | null>(
    allBookmarksAtom
  )
  const [popularUsers, setPopularUsers] = useState<string[] | null>(null)
  const [bookmarkYears, setBookmarkYears] = useState<string[] | null>(null)

  useEffect(() => {
    if (!allBookmarks) getAllBookmarks(setAllBookmarks)
  }, [])

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
    <main className="relative bg-[#15202B] flex">
      <section className="relative self-start sticky top-0 bg-[url(/bg_texture.webp)] p-8 pr-14 max-w-md space-y-4 h-screen">
        <div className="flex space-x-2 items-center">
          <img
            className="rounded-full w-12 h-12 bg-gray-200"
            src={user.profile_image_url}
            alt="avatar"
          />
          <div className="flex flex-col text-white">
            <p className="text-sm">@{user.username}</p>
            <Form className="leading-none" action="/logout" method="post">
              <button
                className="text-zinc-300 text-xs underline"
                name="logout"
                aria-label="logout"
              >
                Logout
              </button>
            </Form>
          </div>
        </div>
        <p className="text-white text-sm">
          Let's help you find your bookmarks quickly and easily! Use the filters
          below or freestyle it in the search bar.
        </p>
        <h3 className="text-white">Your favourite bookmark authors...</h3>
        <ClientOnly>
          {() => {
            if (popularUsers) {
              return (
                <div className="flex flex-wrap gap-1">
                  {popularUsers.map((username, index) => {
                    // create the updated query params
                    const newParams = updateSearchParams(
                      search,
                      'query',
                      username
                    )

                    return (
                      <Link
                        className={[
                          'border border-white rounded-full px-4 py-2 text-sm',
                          query === username
                            ? 'bg-white text-[#15202B]'
                            : 'text-white',
                        ].join(' ')}
                        key={index}
                        to={`/bookmarks?${newParams}`}
                      >
                        @{username as string}
                      </Link>
                    )
                  })}
                </div>
              )
            } else {
              // taken from https://github.com/nickbruun/svg-loaders
              return <Spinner />
            }
          }}
        </ClientOnly>
        <h3 className="text-white">Filter by year...</h3>
        <ClientOnly>
          {() => {
            if (bookmarkYears) {
              return (
                <div className="flex flex-wrap gap-1">
                  {bookmarkYears.map((bookmarkYear, index) => {
                    // create the updated query params
                    const newParams = updateSearchParams(
                      search,
                      'year',
                      bookmarkYear
                    )

                    return (
                      <Link
                        className={[
                          'border border-white rounded-full px-4 py-2 text-sm',
                          bookmarkYear.toString() === yearParam
                            ? 'bg-white text-[#15202B]'
                            : 'text-white',
                        ].join(' ')}
                        key={index}
                        to={`/bookmarks?${newParams}`}
                      >
                        {bookmarkYear}
                      </Link>
                    )
                  })}
                </div>
              )
            } else {
              // taken from https://github.com/nickbruun/svg-loaders
              return <Spinner />
            }
          }}
        </ClientOnly>
        <img
          className="absolute top-0 -right-[2px] bottom-0 !mt-0 h-screen"
          src="/page_tear.svg"
          alt=""
        />
      </section>
      <section className="bg-white bg-[url(/bg_texture.webp)] bg-fixed grow">
        <Outlet />
      </section>
    </main>
  )
}

export default Bookmarks
