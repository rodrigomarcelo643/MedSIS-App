import { WeekRange } from '@/@types/screens/calendar';

export const getWeekRange = (date: Date): WeekRange => {
  const day = date.getDay();
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - day);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return {
    start: startOfWeek,
    end: endOfWeek,
    dates: Array.from({ length: 7 }).map((_, i) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      return dayDate;
    })
  };
};

export const formatDateRange = (start: Date, end: Date, months: string[]): string => {
  if (start.getMonth() === end.getMonth()) {
    return `${months[start.getMonth()]} ${start.getDate()} - ${end.getDate()}`;
  } else {
    return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
  }
};
