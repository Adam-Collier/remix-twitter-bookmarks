import { Form } from '@remix-run/react'

type UserProps = {
  user: {
    profile_image_url: string
    username: string
    name: string
  }
  className: string
}

export const Footer = ({ user, className }: UserProps) => (
  <div className={`flex space-x-2 items-center ${className}`}>
    <img
      className="rounded-full w-10 h-10 bg-gray-200"
      src={user.profile_image_url}
      alt="avatar"
    />
    <div className="flex flex-col text-white">
      <p className="text-xs">
        @{user.username} ({user.name})
      </p>
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
)
