export const valueFormatNumber = (value?: string | number | null): string => {
  if (value === null || value === undefined) return '';

  let str = String(value);
  str = str.replace(/[^0-9.-]/g, '');
  if (str.includes('-')) {
    str = str.replace(/-/g, '');
    str = '-' + str;
  }

  const parts = str.split('.');

  if (parts.length > 2) {
    str = parts[0] + '.' + parts.slice(1).join('');
  }
  if (str.startsWith('.')) {
    str = '0' + str;
  }
  if (str.startsWith('-.')) {
    str = '-0.' + str.slice(2);
  }

  return str;
};
