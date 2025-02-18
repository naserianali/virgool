import {ValueTransformer} from "typeorm";
import * as jalaali from "jalaali-js";

export class ShamsiDateTransformer implements ValueTransformer {
  /**
   * Convert Date to a format suitable for storage (timestamp)
   */
  to(value: Date | string | null): Date | null {
    if (!value) return new Date(); // Ensure null values are stored as null in the DB

    if (value instanceof Date) {
      return value; // Already a valid Date
    }

    const date = new Date(value); // Convert string to Date

    return isNaN(date.getTime()) ? new Date() : date; // Ensure it's a valid Date
  }


  /**
   * Convert timestamp from DB to an object containing both Gregorian and Shamsi dates
   */
  from(value: Date | null): any {
    if (!value) return null;

    const date = new Date(value);
    const jDate = jalaali.toJalaali(date);

    return {
      sh_date: `${jDate.jy}/${String(jDate.jm).padStart(2, "0")}/${String(jDate.jd).padStart(2, "0")}`,
      ad_date: date.toISOString().split("T")[0],
      yearName: jDate.jy,
      monthName: getPersianMonthName(jDate.jm),
      dayName: getPersianDayName(date.getDay()),
      iso: date.toISOString(),
      minutesPassed: getMinutesPassed(date),
    };
  }
}

function getPersianMonthName(month: number): string {
  const months = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
  return months[month - 1] || "";
}

function getPersianDayName(weekday: number): string {
  const days = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"];
  return days[weekday] || "";
}

function getMinutesPassed(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // Difference in minutes
  if (diff < 1) return "لحظاتی پیش";
  if (diff < 60) return `${diff} دقیقه پیش`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  return `${Math.floor(hours / 24)} روز پیش`;
}
