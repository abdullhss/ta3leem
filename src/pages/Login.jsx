import React, { useState } from "react";
import logo from "../assets/logo.webp"
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative h-screen flex flex-col items-center justify-center flex-1">
            <div className="bg-white w-full max-w-3xl px-6 flex flex-col items-center">

                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-60">
                        <img src={logo}></img>
                    </div>
                    <h1 className="text-3xl font-bold text-center">
                        وزارة التربية والتعليم - 
                        إدارة التعليم الخاص
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
                    {/* Email / Username */}
                    <div className="mb-4">
                        <label className="block mb-1 text-sm">
                            البريد الإلكتروني أو اسم المستخدم
                        </label>
                        <input
                        type="text"
                        placeholder="برجاء إدخال البريد الإلكتروني أو اسم المستخدم"
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-2 relative">
                        <label className="block mb-1 text-sm">
                            كلمة المرور
                        </label>

                        <input
                            type={showPassword ? "text" : "password"}
                            className="w-full border rounded-lg px-3 py-2 pr-12
                            focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                        />

                        {/* Show / Hide Button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-3 top-9 text-sm text-[#BE8D4A] font-semibold"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {/* Forgot password */}
                    <div className="text-right mb-6">
                        <button className="text-sm text-[#BE8D4A] hover:underline">
                        هل نسيت كلمة المرور ؟
                        </button>
                    </div>

                    {/* Login Button */}
                    <button className="w-full bg-[#BE8D4A] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition">
                        تسجيل الدخول
                    </button>

                    {/* Signup */}
                    <p className="text-center text-sm mt-4">
                        ليس لديك حساب؟
                        <Link to={"/signup"} className="text-[#BE8D4A] cursor-pointer mr-1 underline font-bold underline-offset-2">
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
