import { redirect } from '@remix-run/server-runtime';
import type { ActionFunction } from '@remix-run/server-runtime';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');

  if (action === 'login') {
    return redirect(
      `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_CLIENT_ID}&redirect_uri=${process.env.TWITTER_REDIRECT_URI}&scope=tweet.read%20users.read%20bookmark.read%20follows.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`
    );
  }
};
