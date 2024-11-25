/**
 * This is a simplified logic.
 * Consider using `import isEmail from 'validator/lib/isEmail'` from
 * https://github.com/validatorjs/validator.js/blob/7376945b4ce028b65955ae57b8fccbbf3fe58467/src/lib/isEmail.js
 * for a more robust version.
 */
function isEmail(string: string) {
  const re =
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  return re.test(string);
}

export function email(value: string) {
  return value && !isEmail(value.trim()) ? 'Invalid email' : null;
}

export function password(value: string) {
  if (!value) {
    return 'Password is required';
  }

  if (value.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }

  return null;
}

function isDirty(value: string | number) {
  return value || value === 0;
}

export function required(
  requiredFields: readonly string[],
  values: Record<string, string>,
): Record<string, string> {
  return requiredFields.reduce(
    (fields, field) => ({
      ...fields,
      ...(isDirty(values[field]) ? undefined : { [field]: 'Required' }),
    }),
    {},
  );
}
