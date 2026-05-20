import { intlFormatDistance } from "date-fns";
// function intlFormatDistance(
//   laterDate: string | number | Date,
//   earlierDate: string | number | Date,
//   options?: IntlFormatDistanceOptions
// ): string
export function DateFormatDistance(date: Date | string) {
  return intlFormatDistance(date, new Date());
}
