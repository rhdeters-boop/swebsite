import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
  rules?: ValidationRule;
}

export interface UseFormValidationReturn<T extends Record<string, any>> {
  fields: Record<keyof T, FormField>;
  isValid: boolean;
  hasErrors: boolean;
  getValue: (name: keyof T) => string;
  getError: (name: keyof T) => string | null;
  isTouched: (name: keyof T) => boolean;
  setValue: (name: keyof T, value: string) => void;
  setError: (name: keyof T, error: string | null) => void;
  setTouched: (name: keyof T, touched: boolean) => void;
  validateField: (name: keyof T) => boolean;
  validateAll: () => boolean;
  resetField: (name: keyof T) => void;
  resetForm: () => void;
  getFieldProps: (name: keyof T) => {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    error: string | null;
  };
}

const validateFieldValue = (value: string, rules?: ValidationRule): string | null => {
  if (!rules) return null;

  if (rules.required && !value.trim()) {
    return 'This field is required';
  }

  if (rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    return `Must not exceed ${rules.maxLength} characters`;
  }

  if (rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule>> = {}
): UseFormValidationReturn<T> => {
  const [fields, setFields] = useState<Record<keyof T, FormField>>(() => {
    const initialFields: Record<keyof T, FormField> = {} as any;
    
    Object.keys(initialValues).forEach((key) => {
      const fieldKey = key as keyof T;
      initialFields[fieldKey] = {
        value: String(initialValues[fieldKey] || ''),
        error: null,
        touched: false,
        rules: validationRules[fieldKey],
      };
    });
    
    return initialFields;
  });

  const getValue = useCallback((name: keyof T): string => {
    return fields[name]?.value || '';
  }, [fields]);

  const getError = useCallback((name: keyof T): string | null => {
    return fields[name]?.error || null;
  }, [fields]);

  const isTouched = useCallback((name: keyof T): boolean => {
    return fields[name]?.touched || false;
  }, [fields]);

  const setValue = useCallback((name: keyof T, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: validateFieldValue(value, prev[name]?.rules),
      },
    }));
  }, []);

  const setError = useCallback((name: keyof T, error: string | null) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        error,
      },
    }));
  }, []);

  const setTouched = useCallback((name: keyof T, touched: boolean) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched,
      },
    }));
  }, []);

  const validateField = useCallback((name: keyof T): boolean => {
    const field = fields[name];
    if (!field) return true;

    const error = validateFieldValue(field.value, field.rules);
    setError(name, error);
    setTouched(name, true);
    
    return error === null;
  }, [fields, setError, setTouched]);

  const validateAll = useCallback((): boolean => {
    let isFormValid = true;
    
    Object.keys(fields).forEach((key) => {
      const fieldKey = key as keyof T;
      const isFieldValid = validateField(fieldKey);
      if (!isFieldValid) {
        isFormValid = false;
      }
    });
    
    return isFormValid;
  }, [fields, validateField]);

  const resetField = useCallback((name: keyof T) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value: String(initialValues[name] || ''),
        error: null,
        touched: false,
      },
    }));
  }, [initialValues]);

  const resetForm = useCallback(() => {
    Object.keys(fields).forEach((key) => {
      resetField(key as keyof T);
    });
  }, [fields, resetField]);

  const getFieldProps = useCallback((name: keyof T) => ({
    value: getValue(name),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValue(name, e.target.value),
    onBlur: () => validateField(name),
    error: isTouched(name) ? getError(name) : null,
  }), [getValue, setValue, validateField, isTouched, getError]);

  const isValid = useMemo(() => {
    return Object.values(fields).every((field) => field.error === null);
  }, [fields]);

  const hasErrors = useMemo(() => {
    return Object.values(fields).some((field) => field.error !== null);
  }, [fields]);

  return {
    fields,
    isValid,
    hasErrors,
    getValue,
    getError,
    isTouched,
    setValue,
    setError,
    setTouched,
    validateField,
    validateAll,
    resetField,
    resetForm,
    getFieldProps,
  };
};
