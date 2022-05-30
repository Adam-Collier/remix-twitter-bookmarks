import { useMatches } from '@remix-run/react'
import { useMemo } from 'react'
import type { AllBookmarks } from '~/routes/bookmarks'

export const useMatchesData = (
  id: string
): Record<string, unknown> | undefined => {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  )
  return route?.data
}

export const updateSearchParams = (
  search: string,
  key: string,
  value: string
): string => {
  const searchParams = new URLSearchParams(search)

  // if there is no value supplied remove the param
  if (!value) {
    searchParams.delete(key)
    // if there is a value supplied set it
  } else {
    searchParams.set(key, value)
  }

  // return the string of params
  return searchParams.toString()
}

export const mediaLookup = (mediaId: string, mediaList: any) =>
  mediaList.find((media: { media_key: string }) => media.media_key === mediaId)

export const userLookup = (
  userId: string,
  users: {
    id?: string
    name: string
    username: string
    user: string
    verified: Boolean
    profile_image_url: string
  }[]
) => users.find((user) => user.id === userId)

export const getPopularUsers = (allBookmarks: AllBookmarks) => {
  // count the occurance of each username
  const usernames = allBookmarks.data.reduce(
    (acc: { [key: string]: any }, tweet) => {
      // get the username
      const user = userLookup(tweet.author_id, allBookmarks.includes.users)

      if (!user) return acc
      // create the username or increase the count
      return {
        ...acc,
        [user.username]: (acc[user.username] || 0) + 1,
      }
    },
    {}
  )

  // sort by the most popular
  let mostPopular = Object.keys(usernames).sort(function (a, b) {
    return -(usernames[a] - usernames[b])
  })

  return mostPopular
}

export const getBookmarkYears = (allBookmarks: AllBookmarks) => {
  // use a set to remove all duplicates
  const bookmarkYears = new Set()
  // loop through the bookmarks and add the year
  for (const bookmark of allBookmarks.data) {
    bookmarkYears.add(new Date(bookmark.created_at).getFullYear())
  }
  // return an array so we get no surprises
  return Array.from(bookmarkYears) as string[]
}
