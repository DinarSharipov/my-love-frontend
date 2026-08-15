type JwtPayload = {
  sub?: unknown;
};

export const getAccessTokenSubject = (accessToken: string | null): string | null => {
  if (!accessToken) return null;

  try {
    const payloadPart = accessToken.split('.')[1];
    if (!payloadPart) return null;

    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(globalThis.atob(padded)) as JwtPayload;

    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
};
