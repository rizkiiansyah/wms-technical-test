export const getLoginRedirectPath = (
  redirectParam: string | null,
  fallback?: string | null,
) => {
  if (!redirectParam) return fallback;

  try {
    const decoded = decodeURIComponent(redirectParam);

    if (!decoded.startsWith('/')) {
      return fallback;
    }

    return decoded;
  } catch {
    return fallback;
  }
};
