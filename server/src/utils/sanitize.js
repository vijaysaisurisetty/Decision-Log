export const stripTags = (value) => {
  if (typeof value !== "string") return value;
  return value.replace(/<[^>]*>/g, "").trim();
};

export const cleanString = (value) => {
  if (typeof value !== "string") return value;
  return stripTags(value);
};

export default {
  stripTags,
  cleanString
};

