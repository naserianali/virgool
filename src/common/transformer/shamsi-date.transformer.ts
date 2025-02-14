import {ValueTransformer} from "typeorm";
import * as jalaali from "jalaali-js";

export class ShamsiDateTransformer implements ValueTransformer {
  to(value: Date | null): Date | null {
    return value;
  }

  from(value: Date | null): any {
    if (!value) return null;
    const jDate = jalaali.toJalaali(value);
    return {
      sh_date: `${jDate.jy}/${String(jDate.jm).padStart(2, "0")}/${String(
        jDate.jd
      ).padStart(2, "0")}`,
      ad_date: value.toISOString().split("T")[0],
      yearName: jDate.jy,
      monthName: getPersianMonthName(jDate.jm),
      dayName: getPersianDayName(value.getDay()),
      iso: value.toISOString(),
      minutesPassed: getMinutesPassed(value),
    };
  }
}

function getPersianMonthName(month: number): string {
  const months = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  return months[month - 1] || "";
}

function getPersianDayName(weekday: number): string {
  const days = [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];
  return days[weekday] || "";
}

function getMinutesPassed(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  return diff < 60 ? `${diff} دقیقه پیش` : `${Math.floor(diff / 60)} ساعت پیش`;
}
