import { useMatches } from '@remix-run/react'
import { useMemo } from 'react'

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
