import React from 'react'

const TweetWrapper = ({
  href,
  children,
  className,
}: {
  href: string | null
  children: React.ReactNode
  className: string
}) => {
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    )
  } else {
    return <div className={className}>{children}</div>
  }
}

type TweetProps = {
  tweetId?: string
  name: string
  username: string
  profileImageUrl: string
  verified: Boolean
  media: { type: string; url: string; height: number; width: number } | Boolean
  text: string
  date: Date
  className?: string
}

export const Tweet = ({
  tweetId,
  name,
  username,
  profileImageUrl,
  verified,
  media,
  text,
  date,
  className,
}: TweetProps) => {
  return (
    <TweetWrapper
      href={
        tweetId ? `https://twitter.com/${username}/status/${tweetId}` : null
      }
      className={[
        'w-full p-4 pb-5.5 block flex space-x-3 bg-white rounded',
        className,
      ].join(' ')}
    >
      <div className="relative w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0">
        <img
          className="absolute top-0 left-0 w-full h-full"
          src={profileImageUrl}
          alt={`${username} profile`}
        />
      </div>
      <div className="flex-col space-y-2">
        <header className="flex space-x-4 items-center pt-1.5">
          <div className="flex items-center space-x-1 text-sm">
            <h2>{name} </h2>
            {verified && (
              <img className="w-4 h-4 text-red" src="/verified.svg" alt="" />
            )}
            <p>
              @{username} ·{' '}
              {/* {new Date(tweet.created_at).toLocaleString()} */}
              {new Date(date).toLocaleDateString(undefined, {
                year: undefined,
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </header>
        {media && media.type === 'photo' && (
          <div
            className="relative rounded-md overflow-hidden"
            style={{
              paddingTop: `${(media.height / media.width) * 100}%`,
            }}
          >
            <img
              className="absolute top-0 left-0 w-full h-full"
              src={media.url}
              alt="tweet media"
            />
          </div>
        )}

        {media && media.type === 'video' && (
          <div>
            <p className="text-xs p-2 bg-blue-100 text-blue-600 rounded-sm">
              This tweet contains a video but Twitters Bookmark API doesnt
              currently support grabbing their URL.
            </p>
          </div>
        )}
        <p>{text}</p>
      </div>
    </TweetWrapper>
  )
}
