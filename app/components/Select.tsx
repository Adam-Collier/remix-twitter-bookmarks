import { Fragment, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, CaretSortIcon } from '@radix-ui/react-icons'
import { useLocation, useSearchParams } from '@remix-run/react'
import { updateSearchParams } from '~/utils/utils'

type sortOptionsType = {
  sort: string
}

const sortOptions: sortOptionsType[] = [{ sort: 'Latest' }, { sort: 'Oldest' }]

export const Select = ({ className }) => {
  const [params, setParams] = useSearchParams()
  const { search } = useLocation()

  let initialIndex = params.get('sort')
    ? sortOptions.findIndex((p) => p.sort.toLowerCase() === params.get('sort'))
    : 0

  const [selected, setSelected] = useState(sortOptions[initialIndex])

  const handleChange = (e: sortOptionsType) => {
    // set which item is selected
    setSelected(e)

    const newParams = updateSearchParams(
      search,
      'sort',
      e.sort.toLowerCase() === 'latest' ? '' : e.sort.toLowerCase()
    )

    setParams(newParams)
  }

  return (
    <div className={`${className}`}>
      <Listbox value={selected} onChange={handleChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-xs">
            <span className="block truncate text-sm">{selected.sort}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <CaretSortIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute right-2.5 mt-1 max-h-60 w-24 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {sortOptions.map((person, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                    }`
                  }
                  value={person}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate text-xs ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {person.sort}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                          <CheckIcon className="h-3 w-3" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}
