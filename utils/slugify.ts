export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^a-z0-9-]/g, '') // Remove all non-word chars except hyphen
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};
