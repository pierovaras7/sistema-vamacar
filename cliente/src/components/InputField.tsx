import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  value?: string;
  step?: any;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  onInput?: React.FormEventHandler<HTMLInputElement>; // Añadir esta propiedad
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  step,
  inputProps,
  value,
  className,
  disabled,
  onInput, // Recibir la función onInput
  onChange
}: InputFieldProps) => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter", "Comma"];
    const allowedChars = /^[0-9,]$/; // Only numbers and comma

    if (
      !allowedKeys.includes(e.key) && 
      !allowedChars.test(e.key)
    ) {
      e.preventDefault(); // Prevent the input of non-numeric and non-comma characters
    }
  };

  return (
    <div className={`flex flex-col gap-2 px-2 mb-2 w-full`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        {...register(name)}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none ${className || ""}`}
        {...inputProps} // Pasamos cualquier propiedad extra como inputProps
        step={step}
        disabled={disabled}
        defaultValue={defaultValue}
        onKeyDown={type === "number" ? handleKeyDown : undefined} // Apply the handler only if the type is "number"
        onInput={onInput} // Usamos onInput aquí
        onChange={onChange}
      />
      {error?.message && (
        <p className="text-sm text-red-500">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
