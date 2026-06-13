import { useState, useCallback } from 'react';

export const useFormValidation = (initialValues, fieldValidators) => {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = useCallback(
    (name, value, allValues = values) => {
      const rules = fieldValidators[name];
      if (!rules) return '';
      for (const rule of rules) {
        const error = rule(value, allValues);
        if (error) return error;
      }
      return '';
    },
    [fieldValidators, values]
  );

  const validateAll = useCallback(
    (currentValues = values) => {
      const newErrors = {};
      Object.keys(fieldValidators).forEach((name) => {
        const error = validateField(name, currentValues[name], currentValues);
        if (error) newErrors[name] = error;
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [fieldValidators, validateField, values]
  );

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, values[name], values),
    }));
  };

  const handleChange = (name, value) => {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    const fieldsToRevalidate = [name];
    if (name === 'password' && fieldValidators.confirmPassword) {
      fieldsToRevalidate.push('confirmPassword');
    }

    setErrors((prev) => {
      const next = { ...prev };
      fieldsToRevalidate.forEach((field) => {
        if (touched[field] || submitted) {
          next[field] = validateField(field, nextValues[field], nextValues);
        }
      });
      return next;
    });
  };

  const getFieldError = (name) => {
    if (!touched[name] && !submitted) return '';
    return errors[name] || '';
  };

  const resetForm = (newValues = initialValues) => {
    setValues(newValues);
    setTouched({});
    setErrors({});
    setSubmitted(false);
  };

  const touchAll = () => {
    const allTouched = Object.keys(fieldValidators).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);
  };

  const handleSubmit = (onValid) => async (e) => {
    e.preventDefault();
    setSubmitted(true);
    touchAll();
    if (!validateAll(values)) return;
    await onValid(values);
  };

  return {
    values,
    setValues,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    getFieldError,
    resetForm,
    validateAll,
  };
};
