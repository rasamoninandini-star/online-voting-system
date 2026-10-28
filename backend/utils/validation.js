function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidString(value, { minLength = 1, maxLength = Infinity } = {}) {
  return typeof value === 'string'
    && value.trim().length >= minLength
    && value.trim().length <= maxLength;
}

function isValidEmail(value) {
  return typeof value === 'string'
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPollOptions(options, maxOptions = 12) {
  if (!Array.isArray(options) || options.length < 2 || options.length > maxOptions) {
    return false;
  }

  const values = new Set();
  return options.every((option) => {
    const value = typeof option?.value === 'string' ? option.value.trim() : '';
    const label = typeof option?.label === 'string' ? option.label.trim() : '';

    if (!value || value.length > 80 || !label || label.length > 120 || values.has(value)) {
      return false;
    }

    values.add(value);
    return true;
  });
}

module.exports = {
  isValidDate,
  isValidString,
  isValidEmail,
  isValidPollOptions
};
