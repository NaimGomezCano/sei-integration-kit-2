import dayjs from 'dayjs'
import { z } from 'zod'

export const dateFromString = z
  .string()
  .datetime()
  .transform((val) => new Date(val))

export function dateTotring(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month.toString().padStart(2, '0'))
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('hh', hours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('ss', seconds.toString().padStart(2, '0'))
}

export function stringToDate(date: string): Date {
  return dayjs(date).toDate()
}

export function prettyDateTime(date: Date, readable: boolean = false): string {
  return dayjs(date).format(readable ? 'LLLL' : 'YYYY-MM-DD HH:mm:ss')
}

export function formatDateTime(date: Date | string, miliseconds: boolean = false): string {
  return dayjs(date).format(miliseconds ? '"YYYY-MM-DDTHH:mm:ss.SSSZ"' : '"YYYY-MM-DDTHH:mm:ssZ"')
}

export function formatUTCDateTime(date: Date | string, miliseconds: boolean = false): string {
  return miliseconds ? dayjs(date).toISOString() : dayjs(date).toISOString().split('.')[0] + 'Z'
}

export function extractDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

export function extractTime(date: Date): string {
  return dayjs(date).format('hh:mm:ss')
}

export function dateAdd(date: Date | string, unit: dayjs.ManipulateType, value: number): Date {
  return dayjs(date).add(value, unit).toDate()
}

export function addDaysString(date: Date | string, days: number): string {
  return dayjs(date).add(days, 'day').toISOString()
}

export function addMonths(date: Date | string, months: number): Date {
  return dayjs(date).add(months, 'month').toDate()
}

export function addMonthsString(date: Date | string, months: number): string {
  return dayjs(date).add(months, 'month').toISOString()
}

export function addYears(date: Date | string, years: number): Date {
  return dayjs(date).add(years, 'year').toDate()
}

export function addYearsString(date: Date | string, years: number): string {
  return dayjs(date).add(years, 'year').toISOString()
}

export function dateIsBefore(date: Date, compare: Date): boolean {
  return dayjs(date).isBefore(compare)
}

export function dateIsAfter(date: Date, compare: Date): boolean {
  return dayjs(date).isAfter(compare)
}

export function dateIsSame(date: Date, compare: Date): boolean {
  return dayjs(date).isSame(compare)
}

export const now = (miliseconds: boolean = false): string => {
  return miliseconds ? dayjs().toISOString() : dayjs().toISOString().split('.')[0] + 'Z'
}
