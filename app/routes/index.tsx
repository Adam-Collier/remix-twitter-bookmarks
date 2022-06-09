import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { animate, spring } from 'motion'
import { useEffect } from 'react'
import { Tweet } from '~/components/Tweet'
import { getUser } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request)

  return json({
    user,
  })
}

export default function Index() {
  const { user } = useLoaderData()

  useEffect(() => {
    // twitter icon
    animate(
      '.twitter-icon',
      { opacity: [0, 1] },
      {
        duration: 0.45,
        easing: 'ease-in',
      }
    )

    // title
    animate(
      'h1.title',
      { opacity: [0, 1] },
      {
        duration: 0.45,
        delay: 0.5,
        easing: 'ease-in',
      }
    )

    // subcopy
    animate(
      'p.subcopy',
      { opacity: [0, 1] },
      {
        duration: 0.45,
        delay: 0.75,
        easing: 'ease-in',
      }
    )

    // button
    animate(
      '.button-wrapper',
      { scale: [0.6, 1], opacity: 1 },
      { delay: 1.25, easing: spring() }
    )
  }, [])

  return (
    <main className="relative bg-twitter-dark flex flex-col-reverse md:flex-row md:children:basis-1/2 md:min-h-screen">
      <div className="flex pt-64 md:pt-0 relative overflow-hidden w-full">
        <img
          className="self-end block h-auto"
          src="/half_tone_img.webp"
          alt=""
        />
        <img
          className="absolute hidden md:block md:top-0 md:h-screen md:right-[-2px]"
          src="/page_tear.svg"
          alt=""
        />
        <img
          className="absolute -top-[2px] left-0 w-full md:hidden rotate-180"
          src="/page_tear_h.svg"
          alt=""
        />
        <img
          className="absolute top-0 left-0 w-full h-full"
          src="/bg_texture.webp"
          alt=""
        />
        <Tweet
          className="!w-[90%] max-w-sm absolute top-2/12 md:top-1/8 left-1/2 md:left-[calc(50%-24px)] -translate-x-1/2"
          name="Dave Marsh"
          username="mountaindave"
          media={false}
          profileImageUrl={'/avatar.jpg'}
          verified={true}
          date={new Date()}
          text="Beautiful scenes up here near Unsplash mountain, taking a deep breathe and relishing the moment."
        />
      </div>
      <div
        className="py-16 md:py-0 relative bg-white md:self-stretch flex flex-col items-center justify-center space-y-3 bg-cover"
        style={{ backgroundImage: "url('/bg_texture.webp')" }}
      >
        <div className="twitter-icon opacity-0">
          <svg
            width="133"
            height="133"
            viewBox="0 0 133 133"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M130.536 27.6535C125.944 29.6885 121.011 31.0635 115.824 31.685C121.115 28.517 125.174 23.49 127.088 17.506C122.138 20.443 116.655 22.577 110.819 23.721C106.144 18.749 99.489 15.636 92.119 15.636C77.973 15.636 66.5 27.109 66.5 41.266C66.5 43.268 66.731 45.215 67.16 47.096C45.8585 46.0235 26.988 35.821 14.349 20.322C12.149 24.117 10.884 28.517 10.884 33.203C10.884 42.091 15.4105 49.9395 22.28 54.532C18.078 54.3945 14.129 53.245 10.675 51.3255V51.6555C10.675 64.069 19.5025 74.4255 31.2285 76.7795C29.0725 77.3625 26.812 77.6705 24.48 77.6705C22.83 77.6705 21.2185 77.5165 19.6565 77.2195C22.918 87.3945 32.378 94.8085 43.5925 95.0065C34.82 101.882 23.7705 105.979 11.7695 105.979C9.7015 105.979 7.661 105.858 5.6535 105.622C16.9945 112.898 30.4585 117.133 44.9235 117.133C92.0585 117.133 117.826 78.094 117.826 44.236C117.826 43.136 117.799 42.025 117.749 40.925C122.754 37.306 127.099 32.8015 130.526 27.67L130.536 27.6535Z"
              fill="#1D9BF0"
            />
          </svg>
        </div>
        <h1 className="title opacity-0 text-3xl font-semibold">
          Twitter Bookmarks
        </h1>
        <p className="subcopy opacity-0 text-lg text-center">
          The easiest way to find and search
          <br />
          bookmarks you’ve saved
        </p>
        <div className="button-wrapper pt-4 opacity-0">
          {user && new Date(user.expires_at) > new Date() ? (
            <Link to="/bookmarks">
              <button className="rounded-full bg-[#1d9bf0] text-white py-3 px-6 hover:bg-[#1a8cd8]">
                Go to your bookmarks
              </button>
            </Link>
          ) : (
            <Form method="post" action="/login">
              <button
                className="rounded-full bg-[#1d9bf0] text-white py-3 px-6 hover:bg-[#1a8cd8]"
                name="action"
                value="login"
              >
                Login
              </button>
            </Form>
          )}
        </div>
      </div>
    </main>
  )
}
