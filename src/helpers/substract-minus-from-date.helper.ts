export const subtractMinusFromDate = (date: Date, min: number): Date => {
  date.setMinutes(date.getMinutes() - min);
  return new Date(date);
};
