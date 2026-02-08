import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  placeholder?: string;
  inputClassName?: string;
  error?: string;
}

const eyeButtonClassName =
  "absolute right-2 top-1/2 -translate-y-1/2 p-1 text-week-first hover:text-accent-blue border-0 outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-1 rounded cursor-pointer";

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { placeholder, inputClassName, error, className, ...props },
    ref,
  ) {
    const [showPassword, setShowPassword] = useState(false);
    return (
      <div className={className}>
        <div className="relative w-full">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            className={`border border-week-first rounded-md p-2 w-full pr-10 ${inputClassName ?? ""}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className={`${eyeButtonClassName} !bg-transparent border !border-none`}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);

export default PasswordInput;
