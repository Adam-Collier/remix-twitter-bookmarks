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
import { getUser, logout } from '~/utils/session.server'
import { updateSearchParams } from '~/utils/utils'

type AllBookmarks = {
  data: {
    created_at: string
    author_id: string
  }[]
  includes: {
    users: []
    media: []
  }
}

export const userLookup = (userId: string, users: any) =>
  users.find((user: { id: string }) => user.id === userId)

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

const getAllBookmarks = async (setAllBookmarks) => {
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
  const [allBookmarks, setAllBookmarks] = useAtom<AllBookmarks | null>(
    allBookmarksAtom
  )
  const [popularUsers, setPopularUsers] = useState<string[] | null>(null)

  useEffect(() => {
    if (!allBookmarks) getAllBookmarks(setAllBookmarks)
  }, [])

  useEffect(() => {
    if (allBookmarks) {
      // count the occurance of each username
      const usernames = allBookmarks.data.reduce((acc, tweet) => {
        // get the username
        const user = userLookup(tweet.author_id, allBookmarks.includes.users)
        // create the username or increase the count
        return {
          ...acc,
          [user.username]: (acc[user.username] || 0) + 1,
        }
      }, {})

      // sort by the most popular
      let mostPopular = Object.keys(usernames).sort(function (a, b) {
        return -(usernames[a] - usernames[b])
      })
      // get the 10 most popular
      setPopularUsers(mostPopular.slice(0, 10))
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
              return (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2400 2400"
                  width="24"
                  height="24"
                  className="mx-auto"
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
