export const required = (message = 'This field is required') => (value) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return message;
  }
  return '';
};

export const email = (message = 'Enter a valid email address') => (value) => {
  if (!value || !String(value).trim()) return '';
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(String(value).trim()) ? '' : message;
};

export const minLength = (min, message) => (value) => {
  if (!value || !String(value).trim()) return '';
  return String(value).length >= min
    ? ''
    : message || `Must be at least ${min} characters`;
};

export const matchField = (fieldName, message = 'Fields do not match') => (value, allValues) => {
  if (!value && !allValues[fieldName]) return '';
  return value === allValues[fieldName] ? '' : message;
};
