import { useLocation } from '@remix-run/react'
import { useAtom } from 'jotai'
import { ClientOnly } from 'remix-utils'
import { allBookmarksAtom } from '~/routes/bookmarks'

export const SearchInfo = ({
  filteredBookmarks,
}: {
  filteredBookmarks: { created_at: string; author_id: string }[] | undefined
}) => {
  const [allBookmarks] = useAtom(allBookmarksAtom)
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  let queryValue = params.get('query')

  return (
    <ClientOnly>
      {() => (
        <div className="flex w-full">
          <p className="text-xs pl-4 text-zinc-400 font-light pr-1">
            {allBookmarks ? allBookmarks?.data?.length : 0} searchable bookmarks
          </p>
          {queryValue && (
            <p className="text-xs text-zinc-400 font-light">
              | {filteredBookmarks ? filteredBookmarks?.length : 0} results
            </p>
          )}
        </div>
      )}
    </ClientOnly>
  )
}
