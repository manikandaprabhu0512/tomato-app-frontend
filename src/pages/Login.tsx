import axios from "axios";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import { FiLock, FiMail, FiPhone, FiUploadCloud, FiUser } from "react-icons/fi";
import { useAppData } from "../context/AppContext";

type AuthMode = "login" | "signup";
type LoginMethod = "email" | "phone";
type Role = "customer" | "rider" | "seller";

const roles: Role[] = ["customer", "rider", "seller"];
const EMAIL_LOGIN_URL = `${import.meta.env.VITE_SERVER_URL}/api/auth/login/email`;
const PHONE_OTP_REQUEST_URL = `${import.meta.env.VITE_SERVER_URL}/api/auth/login/phone`;
const PHONE_OTP_VERIFY_URL = `${import.meta.env.VITE_SERVER_URL}/api/auth/phone/verify-otp`;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("phone");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    phone: "",
  });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    image: "",
    role: "customer" as Role,
  });
  const navigate = useNavigate();

  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/login`,
        {
          code: authResult["code"],
        },
      );

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const requestPhoneOtp = async () => {
    if (!loginForm.phone.trim()) {
      toast.error("Enter a phone number first.");
      return;
    }

    setLoading(true);
    try {
      setShowOtpModal(true);
      await axios.post(PHONE_OTP_REQUEST_URL, {
        phone: loginForm.phone.trim(),
      });
      toast.success("OTP sent. Enter the 6-digit code to continue.");
    } catch (error) {
      console.log(error);
      toast.error("Unable to send OTP right now.");
    } finally {
      setLoading(false);
    }
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtp("");
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(EMAIL_LOGIN_URL, {
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      toast.success(data.message || "Logged in successfully.");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Unable to login with email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loginMethod === "email") {
      await handleEmailLogin();
      return;
    }

    await requestPhoneOtp();
  };

  const handleSignupSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Signup UI is ready. Connect your registration API next.");
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(PHONE_OTP_VERIFY_URL, {
        phone: loginForm.phone.trim(),
        otp,
      });

      localStorage.setItem("token", data.token);
      setUser(data.user);
      setIsAuth(true);
      toast.success(data.message || "Logged in successfully.");
      closeOtpModal();
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center bg-[linear-gradient(180deg,#fff7f8_0%,#ffffff_45%,#fff4e8_100%)] px-4 py-8">
      <div className="w-max overflow-hidden rounded-4xl border border-white/70 bg-white shadow-[0_20px_80px_rgba(226,55,116,0.12)]">
        <div className="flex items-center p-5 sm:p-8 lg:p-10">
          <div className="">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#E23774]">
                  Tomato
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  {authMode === "login"
                    ? "Login to your account"
                    : "Create your account"}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {authMode === "login"
                    ? "Choose how you want to continue."
                    : "Fill in the details below. API wiring can come next."}
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff1f5] p-1">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    authMode === "login"
                      ? "bg-[#E23774] text-white shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    authMode === "signup"
                      ? "bg-[#E23774] text-white shadow-sm"
                      : "text-slate-600"
                  }`}
                >
                  Sign up
                </button>
              </div>
            </div>

            <button
              onClick={googleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <FcGoogle size={20} />
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                or continue with
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {authMode === "login" ? (
              <>
                <div className="mb-6 grid grid-cols-2 gap-3 rounded-3xl bg-slate-100 p-1.5">
                  <button
                    type="button"
                    onClick={() => setLoginMethod("phone")}
                    className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                      loginMethod === "phone"
                        ? "bg-white text-[#E23774] shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Phone number
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod("email")}
                    className={`rounded-[20px] px-4 py-3 text-sm font-semibold transition ${
                      loginMethod === "email"
                        ? "bg-white text-[#E23774] shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Email & password
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {loginMethod === "email" ? (
                    <>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                          Email address
                        </span>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                          <FiMail className="text-slate-400" />
                          <input
                            type="email"
                            value={loginForm.email}
                            onChange={(event) =>
                              setLoginForm((current) => ({
                                ...current,
                                email: event.target.value,
                              }))
                            }
                            placeholder="name@example.com"
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                          Password
                        </span>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                          <FiLock className="text-slate-400" />
                          <input
                            type="password"
                            value={loginForm.password}
                            onChange={(event) =>
                              setLoginForm((current) => ({
                                ...current,
                                password: event.target.value,
                              }))
                            }
                            placeholder="Enter your password"
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                          />
                        </div>
                      </label>
                    </>
                  ) : (
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        Phone number
                      </span>
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                        <FiPhone className="text-slate-400" />
                        <input
                          type="tel"
                          value={loginForm.phone}
                          onChange={(event) =>
                            setLoginForm((current) => ({
                              ...current,
                              phone: event.target.value,
                            }))
                          }
                          placeholder="+91 98765 43210"
                          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        We&apos;ll send a 6-digit OTP to this number.
                      </p>
                    </label>
                  )}

                  {loginMethod === "email" ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-[#E23774] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c92d66] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Logging in..." : "Login with email"}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-2xl bg-[#E23774] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c92d66] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                  )}
                </form>
              </>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Full name
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                      <FiUser className="text-slate-400" />
                      <input
                        type="text"
                        value={signupForm.name}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Your name"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Email
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                      <FiMail className="text-slate-400" />
                      <input
                        type="email"
                        value={signupForm.email}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="name@example.com"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Phone number
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                      <FiPhone className="text-slate-400" />
                      <input
                        type="tel"
                        value={signupForm.phone}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                        placeholder="+91 98765 43210"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Profile image URL
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                      <FiUploadCloud className="text-slate-400" />
                      <input
                        type="url"
                        value={signupForm.image}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            image: event.target.value,
                          }))
                        }
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Password
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                      <FiLock className="text-slate-400" />
                      <input
                        type="password"
                        value={signupForm.password}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }))
                        }
                        placeholder="Create a password"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Confirm password
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[#E23774] focus-within:ring-2 focus-within:ring-[#E23774]/15">
                      <FiLock className="text-slate-400" />
                      <input
                        type="password"
                        value={signupForm.confirmPassword}
                        onChange={(event) =>
                          setSignupForm((current) => ({
                            ...current,
                            confirmPassword: event.target.value,
                          }))
                        }
                        placeholder="Repeat password"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>
                </div>

                <div>
                  <span className="mb-3 block text-sm font-medium text-slate-700">
                    Select role
                  </span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() =>
                          setSignupForm((current) => ({
                            ...current,
                            role,
                          }))
                        }
                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold capitalize transition ${
                          signupForm.role === role
                            ? "border-[#E23774] bg-[#fff1f5] text-[#E23774]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#E23774] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#c92d66]"
                >
                  Create account
                </button>
              </form>
            )}

            <p className="mt-6 text-center text-xs leading-6 text-slate-400">
              By continuing, you agree to Tomato&apos;s terms of service and
              privacy policy.
            </p>
          </div>
        </div>
      </div>

      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#E23774]">
                  Verify OTP
                </p>
                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  Enter the code sent to your phone
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  We sent a 6-digit code to {loginForm.phone || "your phone"}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeOtpModal}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500 transition hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-6">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">
                  6-digit OTP
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] text-slate-900 outline-none transition placeholder:tracking-[0.3em] placeholder:text-slate-300 focus:border-[#E23774] focus:ring-2 focus:ring-[#E23774]/15"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeOtpModal}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                className="flex-1 rounded-2xl bg-[#E23774] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c92d66] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>

            <button
              type="button"
              onClick={requestPhoneOtp}
              className="mt-4 w-full text-sm font-semibold text-[#E23774]"
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
