import type { HeadersFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Outlet, useLoaderData, useSearchParams } from '@remix-run/react'
import { atomWithStorage } from 'jotai/utils'
import { getUser, logout } from '~/utils/session.server'

export const userLookup = (userId: string, users: any) =>
  users.find((user) => user.id === userId)

export function headers() {
  return {
    'Cache-Control': 'public, max-age=30, s-maxage=86400',
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

    const { id, access_token } = user

    let bookmarks = {
      data: [] as string[],
      includes: {
        users: [] as string[],
        media: [] as string[],
      },
    }

    const getBookmarks = async (token) => {
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
    }

    await getBookmarks('')

    return json(
      {
        user,
        bookmarks,
      },
      {
        headers: {
          // max-age controls the browser cache
          // s-maxage controls a CDN cache
          'Cache-Control': 'public, max-age=30, s-maxage=86400',
        },
      }
    )
  } catch (err) {
    console.log(err)
  }
}

// const getAllBookmarks = async (setAllBookmarks) => {
//   try {
//     const response = await fetch('/getAllBookmarks')
//     const json = await response.json()
//     setAllBookmarks(json)
//     return
//   } catch (err) {
//     console.log(err)
//   }
// }

const Bookmarks = () => {
  const data = useLoaderData()
  const { bookmarks, user } = data
  // const [params] = useSearchParams()
  // const query = params.get('query')

  if (!bookmarks) {
    return <p>we couldnt grab your bookmarks!</p>
  }

  return (
    <main className="relative bg-[#15202B] flex">
      <section className="relative self-start sticky top-0 bg-[url(/bg_texture.webp)] p-8 max-w-sm space-y-4">
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
        <h3 className="text-white">Show tweets by user...</h3>
        {/* <div className="flex flex-wrap gap-1">
          {Array.from(allUsernames)
            .slice(0, 10)
            .map((username, index) => (
              <Link
                className={[
                  'border border-white rounded-full px-4 py-2 text-sm',
                  query === username ? 'bg-white text-[#15202B]' : 'text-white',
                ].join(' ')}
                key={index}
                to={`/bookmarks?query=${username}`}
              >
                @{username as string}
              </Link>
            ))}
        </div> */}
      </section>
      <div>
        <img className="sticky h-screen md:top-0" src="/page_tear.svg" alt="" />
      </div>
      <section className="bg-white bg-[url(/bg_texture.webp)] bg-fixed grow py-8">
        <Outlet />
      </section>
    </main>
  )
}

export default Bookmarks
