export const startOfToday = (baseDate = new Date()) => {
  const date = new Date(baseDate);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const endOfDay = (baseDate = new Date()) => {
  const date = new Date(baseDate);
  date.setHours(23, 59, 59, 999);
  return date;
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + Number(days));
  return result;
};

export const daysBetween = (fromDate, toDate) => {
  const from = startOfToday(fromDate);
  const to = startOfToday(toDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
};

export default {
  startOfToday,
  endOfDay,
  addDays,
  daysBetween
};

