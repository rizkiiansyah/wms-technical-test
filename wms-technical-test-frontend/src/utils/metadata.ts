export const getTitle = (title: string | undefined) => {
  if (!title) {
    return process.env.NEXT_PUBLIC_APP_NAME;
  }

  return `${title} | ${process.env.NEXT_PUBLIC_APP_NAME}`;
};
