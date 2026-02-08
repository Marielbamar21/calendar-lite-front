import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { loginSchema, type LoginFormData } from "../../schemas/schema";
import { formatApiError } from "../../utils/formatApiError";
import toast from "react-hot-toast";
import Logo from "./component/logo";
import PasswordInput from "../../components/PasswordInput";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/dashboard";

  async function onSubmit(data: LoginFormData) {
    setError("");
    setLoading(true);
    try {
      await login({ email: data.email, password: data.password });
      toast.success("Signed In");
      navigate(from, { replace: true });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Login failed";
      const message = formatApiError(raw);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex  flex-col gap-4 md:w-[30rem]  sm:w-[20rem] w-[15rem] border border-week-first rounded-xl p-4 justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 justify-center items-center w-full"
        >
          <Logo />
          <h3 className="text-2xl font-medium text-calendar-ring">Sign In</h3>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            className="border border-week-first rounded-md p-2 w-full"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
          <PasswordInput
            placeholder="Password"
            {...register("password")}
            error={errors.password?.message}
            className="relative w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="!bg-accent-blue text-white rounded-md p-2 w-full disabled:opacity-50"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-accent-blue hover:text-calendar-ring"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
