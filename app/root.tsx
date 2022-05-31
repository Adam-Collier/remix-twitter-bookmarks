import type { MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'

import reset from '@unocss/reset/tailwind.css'
import unocss from '~/styles/uno.css'

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Twitter Bookmarks',
  viewport: 'width=device-width,initial-scale=1',
})

export const links = () => [
  { rel: 'stylesheet', href: reset },
  { rel: 'stylesheet', href: unocss },
]

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
