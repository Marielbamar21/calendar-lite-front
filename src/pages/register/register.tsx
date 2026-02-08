import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { registerSchema, type RegisterFormData } from "../../schemas/schema";
import { formatApiError } from "../../utils/formatApiError";
import { DotLoader } from "react-spinners";
import toast from "react-hot-toast";
import Logo from "../login/component/logo";
import PasswordInput from "../../components/PasswordInput";

export default function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid: isFormValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  async function onSubmit(data: RegisterFormData) {
    setError("");
    setLoading(true);
    const credentials = {
      name: data.name,
      fullname: data.fullname,
      username: data.username,
      email: data.email,
      password: data.password,
    };
    try {
      await registerUser(credentials);
      toast.success("Account created");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Registration failed";
      const message = formatApiError(raw);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const classInput = "border border-week-first rounded-md p-2 w-full";
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col gap-4 md:w-[40rem] sm:w-[20rem] w-[15rem] border border-accent-blue rounded-xl p-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-calendar-ring hover:text-accent-blue dark:text-gray-400 dark:hover:text-gray-100 w-fit"
        >
          <ArrowLeftIcon className="size-4" />
          Back
        </Link>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-8 justify-center items-center w-full"
        >
          <Logo />
          <h3 className="text-3xl font-semibold text-calendar-ring">Sign Up</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            type="text"
            placeholder="Name"
            className={classInput}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
          <input
            type="text"
            placeholder="Full name"
            className={classInput}
            {...register("fullname")}
          />
          {errors.fullname && (
            <p className="text-sm text-red-600">{errors.fullname.message}</p>
          )}
          <input
            type="text"
            placeholder="Username"
            className={classInput}
            {...register("username")}
          />
          {errors.username && (
            <p className="text-sm text-red-600">{errors.username.message}</p>
          )}
          <input
            type="email"
            placeholder="Email"
            className={classInput}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
          <PasswordInput
            placeholder="Password"
            inputClassName={classInput}
            {...register("password")}
            className="relative w-full"
            error={errors.password?.message}
          />
          <PasswordInput
            placeholder="Confirm password"
            inputClassName={classInput}
            className="relative w-full"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="!bg-calendar-ring text-white rounded-md p-2 w-full disabled:opacity-50 flex items-center justify-center gap-2 min-h-[2.5rem]"
          >
            {loading ? <DotLoader color="#fff" size={24} /> : "Register"}
          </button>
        </form>
        <p className="text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent-blue hover:text-calendar-ring"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
