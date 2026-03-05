export const addParamUrl = (
  url: string,
  key: string,
  value?: string | number | boolean | null,
  options?: {
    allowZero?: boolean;
    allowEmptyString?: boolean;
  },
) => {
  const { allowZero = true, allowEmptyString = true } = options ?? {};
  let newUrl = '';
  const isFirst = !url.includes('?');

  if (value) {
    newUrl += isFirst ? '?' : '&';
    newUrl += `${key}=${value}`;
  } else if (allowZero && value === 0) {
    newUrl += isFirst ? '?' : '&';
    newUrl += `${key}=${value}`;
  } else if (allowEmptyString && value === '') {
    newUrl += isFirst ? '?' : '&';
    newUrl += `${key}=${value}`;
  } else if (value === false) {
    newUrl += isFirst ? '?' : '&';
    newUrl += `${key}=${value}`;
  }

  return newUrl;
};
