const fallbackRedirect = '/main';

export const getAuthRedirect = (search: string): string => {
  const next = new URLSearchParams(search).get('next');

  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return fallbackRedirect;
  }

  return next;
};
