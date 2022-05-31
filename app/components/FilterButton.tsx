import { Link } from '@remix-run/react'

type FilterButtonProps = {
  params: string
  active: Boolean
  text: string
}

export const FilterButton = ({ params, active, text }: FilterButtonProps) => (
  <Link
    className={[
      'border border-white rounded-full px-3 py-1.5 text-xs',
      active ? 'bg-white text-[#15202B]' : 'text-white',
    ].join(' ')}
    to={`/bookmarks?${params}`}
  >
    {text}
  </Link>
)
