import {redirect} from '@remix-run/node';

export const loader = async () => {
  return redirect('/search');
};

export default function IndexRoute() {
  return null;
}
