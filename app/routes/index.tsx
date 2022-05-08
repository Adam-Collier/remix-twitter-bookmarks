import { json, LoaderFunction } from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { getUser } from '~/utils/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  return json({
    user,
  });
};

export default function Index() {
  const { user } = useLoaderData();

  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      {user ? (
        <Link to="/bookmarks">
          <button>Go to your bookmarks</button>
        </Link>
      ) : (
        <Form method="post" action="/login">
          <button name="action" value="login">
            Login
          </button>
        </Form>
      )}
    </main>
  );
}
