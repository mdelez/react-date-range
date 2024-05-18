import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInCalendarDays,
} from 'date-fns';

import { DateRange } from './components/DayCell';

const definedRanges = {
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
};

const staticRangeHandler = {
  range: {},
  isSelected(range: DateRange) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate) &&
      isSameDay(range.endDate, definedRange.endDate)
    );
  },
};

export function createStaticRanges(ranges: {label: string, range: () => DateRange}[]) {
  return ranges.map(range => ({ ...staticRangeHandler, ...range }));
}

export const defaultStaticRanges = createStaticRanges([
  {
    label: 'Today',
    range: () => ({
      startDate: definedRanges.startOfToday,
      endDate: definedRanges.endOfToday,
    }),
  },
  {
    label: 'Yesterday',
    range: () => ({
      startDate: definedRanges.startOfYesterday,
      endDate: definedRanges.endOfYesterday,
    }),
  },

  {
    label: 'This Week',
    range: () => ({
      startDate: definedRanges.startOfWeek,
      endDate: definedRanges.endOfWeek,
    }),
  },
  {
    label: 'Last Week',
    range: () => ({
      startDate: definedRanges.startOfLastWeek,
      endDate: definedRanges.endOfLastWeek,
    }),
  },
  {
    label: 'This Month',
    range: () => ({
      startDate: definedRanges.startOfMonth,
      endDate: definedRanges.endOfMonth,
    }),
  },
  {
    label: 'Last Month',
    range: () => ({
      startDate: definedRanges.startOfLastMonth,
      endDate: definedRanges.endOfLastMonth,
    }),
  },
]);

export const defaultInputRanges = [
  {
    label: 'days up to today',
    range(value: number) {
      return {
        startDate: addDays(definedRanges.startOfToday, (Math.max(Number(value), 1) - 1) * -1),
        endDate: definedRanges.endOfToday,
      };
    },
    getCurrentValue(range: DateRange) {
      if (!isSameDay(range.endDate, definedRanges.endOfToday)) return '-';
      if (!range.startDate) return '∞';
      return differenceInCalendarDays(definedRanges.endOfToday, range.startDate) + 1;
    },
  },
  {
    label: 'days starting today',
    range(value: number) {
      const today = new Date();
      return {
        startDate: today,
        endDate: addDays(today, Math.max(Number(value), 1) - 1),
      };
    },
    getCurrentValue(range: DateRange) {
      if (!isSameDay(range.startDate, definedRanges.startOfToday)) return '-';
      if (!range.endDate) return '∞';
      return differenceInCalendarDays(range.endDate, definedRanges.startOfToday) + 1;
    },
  },
];
