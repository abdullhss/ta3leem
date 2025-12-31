import React, { useState } from "react";
import logo from "../assets/logo.webp";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { executeProcedure } from "../services/apiServices";
import { z } from "zod";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { login } from "../store/slices/authSlice";

/* Zod Schema */
const loginSchema = z.object({
  Email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب ألا تقل عن 6 أحرف"),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  /* Handle Change */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* Handle Login */
  const handleLogin = async () => {
    try {
      // Validation
      loginSchema.parse(formData);
      setErrors({});

      // FormData
      const data = new FormData();
      data.append("Email", formData.Email);
      data.append("Password", formData.password);

      const payload = `${formData.Email}#${formData.password}#$????`;

      const response = await executeProcedure(
        "7lgMl3DLGpYu7xln2ZexiA==",
        payload
      );
      if(response.success){
        if(response.decrypted._0){
            toast.info(response.decrypted._0)
        }
        else{
            // Save user data to auth slice
            console.log(response.decrypted.userData?JSON.parse(response.decrypted.userData)[0]:null);
            dispatch(login(response.decrypted.userData?JSON.parse(response.decrypted.userData)[0]:null));
            // dispatch(login(response.decrypted));
            toast.success("تم تسجيل الدخول بنجاح");
            // Navigate to dashboard after successful login
            navigate("/dashboard");
        }
      } else {
        toast.error("فشل تسجيل الدخول. يرجى المحاولة مرة أخرى");
      }

      console.log(response);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          fieldErrors[e.path[0]] = e.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center flex-1">
      <div className="bg-white w-full max-w-3xl px-6 flex flex-col items-center">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-60">
            <img src={logo} />
          </div>
          <h1 className="text-3xl font-bold text-center">
            وزارة التربية والتعليم - إدارة التعليم الخاص
          </h1>
        </div>

        {/* Welcome */}
        <h2 className="text-3xl font-bold text-center mb-1">
          مرحبًا بك!
        </h2>
        <p className="text-center text-[#828282] my-3">
          مرحباً بعودتك قم بتسجيل الدخول إلى حسابك
        </p>

        <div className="w-full max-w-md">

          {/* Email */}
          <div className="mb-4">
            <label className="block mb-1 text-sm">
              البريد الإلكتروني أو اسم المستخدم
            </label>
            <input
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              type="text"
              placeholder="برجاء إدخال البريد الإلكتروني"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
            />
            {errors.Email && (
              <p className="text-red-500 text-sm mt-1">{errors.Email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-2 relative">
            <label className="block mb-1 text-sm">كلمة المرور</label>
            <input
              name="password"
              value={formData.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-9 text-[#BE8D4A]"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot */}
          <div className="text-right mb-6">
            <button className="text-sm text-[#BE8D4A] hover:underline">
              هل نسيت كلمة المرور ؟
            </button>
          </div>

          {/* Login */}
          <button
            onClick={handleLogin}
            className="w-full bg-[#BE8D4A] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            تسجيل الدخول
          </button>

          {/* Signup */}
          <p className="text-center text-sm mt-4">
            ليس لديك حساب؟
            <Link
              to="/signup"
              className="text-[#BE8D4A] mr-1 underline font-bold"
            >
              إنشاء حساب
            </Link>
          </p>

        </div>
      </div>

      <span className="absolute bottom-5 text-sm font-semibold">
        © 2025 جميع الحقوق محفوظة لمنصة وزارة التربية و التعليم
      </span>
    </div>
  );
};

export default Login;
