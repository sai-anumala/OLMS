import {
  forwardRef,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className="form-floating">
      {children}
      <label>{label}</label>
      {error && (
        <small className="text-danger">
          {error}
        </small>
      )}
    </div>
  );
}

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <FormField label={label} error={error}>
        <input
          ref={ref}
          className={`form-control ${className}`}
          {...props}
        />
      </FormField>
    );
  }
);

FormInput.displayName = "FormInput";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({
  label,
  error,
  options,
  className = "",
  ...props
}: FormSelectProps) {
  return (
    <FormField label={label} error={error}>
      <select className={`form-select ${className}`} {...props}>
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface FormTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const FormTextarea = forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ label, error, className = "", ...props }, ref) => {
  return (
    <FormField label={label} error={error}>
      <textarea
        ref={ref}
        className={`form-control ${className}`}
        {...props}
      />
    </FormField>
  );
});

FormTextarea.displayName = "FormTextarea";
