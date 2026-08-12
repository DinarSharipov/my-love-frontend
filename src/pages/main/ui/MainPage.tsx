import { useSelector } from 'react-redux';

import { selectCurrentUser } from '@/entities/user';

export const MainPage = () => {
  const user = useSelector(selectCurrentUser);

  return <main className="flex-1 flex h-full min-h-0 gap-4">Привет {user?.firstName}</main>;
};
