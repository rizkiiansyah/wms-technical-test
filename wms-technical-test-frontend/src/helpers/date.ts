import moment from "moment"

export const dateStringToStringFormat3 = (value?: string | null) => {
  if (!value || value === '') {
    return null;
  }

  return moment.utc(value).format('DD-MM-YYYY HH:mm:ss');
};
