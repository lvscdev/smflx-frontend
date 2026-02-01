const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export { formatDate };
