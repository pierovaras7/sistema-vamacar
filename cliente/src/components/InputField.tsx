import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  value?:string;
  step?: any;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
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
}: InputFieldProps) => {
  return (
    <div className={`flex flex-col gap-2 w-full`}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        {...register(name)}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none ${className || ""}`}
        {...inputProps}
        step={step}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-sm text-red-500">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
