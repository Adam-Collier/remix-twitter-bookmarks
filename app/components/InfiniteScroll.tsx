import { useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import { bookmarksAtom } from '~/routes/bookmarks'
import { mediaLookup, userLookup } from '~/utils/utils'
import { Tweet } from './Tweet'

let options = {
  root: null,
  rootMargin: '500px 0px 0px 0px',
  threshold: 0,
}

export const InfiniteScroll = ({ data }: any) => {
  const [bookmarks] = useAtom(bookmarksAtom)
  const users = bookmarks?.includes.users
  const media = bookmarks?.includes.media
  let tweetsPerPage = 4

  const [items, setItems] = useState(data.slice(0, tweetsPerPage))
  const [page, setPage] = useState(1)
  const loader = useRef(null)

  useEffect(() => {
    setItems(data.slice(0, tweetsPerPage))
    setPage(0)
  }, [data])

  useEffect(() => {
    let observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        if (data.length > tweetsPerPage * page) {
          setPage(page + 1)
          setItems(data.slice(0, tweetsPerPage * (page + 1)))
        }
      }
    }, options)

    if (loader.current) observer.observe(loader.current)

    let currentLoader = loader.current

    return () => {
      if (currentLoader) observer.unobserve(currentLoader)
    }
  }, [items, page])

  return (
    <div className="space-y-4">
      {items.map((tweet: any, index: number) => {
        if (!users) return null

        const user = userLookup(tweet.author_id, users)
        const tweetMeida = mediaLookup(tweet?.attachments?.media_keys[0], media)

        if (!user) return null

        return (
          <Tweet
            key={index}
            className="bg-white rouded shadow-md"
            name={user.user}
            username={user.username}
            media={tweetMeida}
            profileImageUrl={user.profile_image_url}
            verified={user.verified}
            tweetId={tweet.id}
            date={tweet.created_at}
            text={tweet.text}
          />
        )
      })}
      <div ref={loader}></div>
    </div>
  )
}
