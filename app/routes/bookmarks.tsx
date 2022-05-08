import { json, LoaderFunction, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { getUser } from '~/utils/session.server';
import { useMatchesData } from '~/utils/utils';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  if (!user) {
    return redirect('/');
  }

  const { id, access_token } = user;

  const bookmarksUrl = new URL(
    `https://api.twitter.com/2/users/${id}/bookmarks`
  );

  bookmarksUrl.searchParams.append(
    'tweet.fields',
    'context_annotations,created_at'
  );
  bookmarksUrl.searchParams.append(
    'expansions',
    'author_id,attachments.media_keys'
  );
  bookmarksUrl.searchParams.append('user.fields', 'verified,profile_image_url');
  bookmarksUrl.searchParams.append('media.fields', 'type,url');

  try {
    const response = await fetch(bookmarksUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    const bookmarks = await response.json();

    return json({
      user,
      bookmarks,
    });
  } catch (err) {
    console.log(err);
  }
};

const userLookup = (userId: string, users: any) =>
  users.find((user) => user.id === userId);

const mediaLookup = (mediaId: string, mediaList: any) =>
  mediaList.find((media) => media.media_key === mediaId);

const Bookmarks = () => {
  const data = useLoaderData();
  const { bookmarks } = data;
  console.log(data);

  if (!bookmarks) {
    return <p>we couldnt grab your bookmarks!</p>;
  }

  return (
    <main>
      <p>this is the bookmarks page</p>
      <Form action="/logout" method="post">
        <button
          name="logout"
          className="rounded-full bg-gray-100 p-3 hover:bg-gray-200"
          aria-label="logout"
        >
          Logout
        </button>
      </Form>

      <div>
        {bookmarks.data.map((tweet, index) => {
          const user = userLookup(tweet.author_id, bookmarks.includes.users);

          const media = mediaLookup(
            tweet?.attachments?.media_keys[0],
            bookmarks.includes.media
          );
          console.log(media, media?.type, 'this is the media');

          return (
            <a
              key={index}
              href={`https://twitter.com/${user.username}/status/${tweet.id}`}
            >
              <header>
                <img
                  src={user.profile_image_url}
                  alt={`${user.username} profile`}
                />
                <h2>
                  {user.name} {user.verified ? 'true' : 'false'}
                </h2>
              </header>
              {media && media.type === 'photo' && (
                <img src={media.url} alt="tweet media" />
              )}

              {media && media.type === 'video' && (
                <div>
                  <p>
                    This tweet contains a video but Twitters Bookmark API doesnt
                    currently support grabbing their URL.
                  </p>
                </div>
              )}

              <h2>@{user.username}</h2>
              <p>{tweet.text}</p>

              <div>
                <span>{new Date(tweet.created_at).toLocaleString()}</span>
              </div>
            </a>
          );
        })}
      </div>
    </main>
  );
};

export default Bookmarks;
