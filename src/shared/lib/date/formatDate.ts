const russianDateTime = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const russianDate = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export const formatDateTime = (value: string | Date) => russianDateTime.format(new Date(value));

export const formatDate = (value: string | Date) => russianDate.format(new Date(value));
