import {redirect} from 'react-router';

export const loader = async () => {
  return redirect('/search');
};

export default function IndexRoute() {
  return null;
}
