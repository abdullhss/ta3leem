import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import logo from "../assets/logo.webp"
import { Paperclip, X } from 'lucide-react'
import { Eye, EyeOff } from "lucide-react"
import useGender from '../hooks/useGender'
import useNationality from '../hooks/useNationality'
import useUploadFiles from '../hooks/useUploadFiles'
import { DoTransaction } from '../services/apiServices'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

// Animation variants
const fadeIn = {
  initial: { opacity: 0, height: 0 },
  animate: { 
    opacity: 1, 
    height: "auto",
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    height: 0,
    transition: { duration: 0.2 }
  }
}

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
}

// Zod validation schema

export const signupSchema = z.object({
  name: z
    .string()
    .regex(
      /^([\u0600-\u06FF]+ ){3}[\u0600-\u06FF]+$/,
      "الاسم يجب أن يكون رباعي وبالحروف العربية فقط"
    ),

  genderId: z.string().min(1, "الجنس مطلوب"),

  phone: z
    .string()
    .regex(/^09[0-9]{8}$/, "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام"),

  email: z.string().email("بريد إلكتروني غير صالح"),

  username: z
    .string()
    .regex(/^[a-zA-Z]+$/, "اسم المستخدم يجب أن يحتوي على حروف فقط"),

  nationalityId: z.string().min(1, "الجنسية مطلوبة"),

  nationalId: z.string().optional(),
  nationalFileId: z.number().optional(),

  passportNumber: z.string().optional(),
  passportFileId: z.number().optional(),

  residenceNumber: z.string().optional(),
  residenceExpiry: z.string().optional(),
  residenceFileId: z.number().optional(),

  companyName: z.string().min(2, "اسم الشركة يجب أن يكون على الأقل حرفين"),

  password: z.string().min(8, "كلمة المرور يجب أن تكون على الأقل 8 أحرف"),
  confirmPassword: z.string(),

  negativeCertFileId: z.number().optional(),
})
.superRefine((data, ctx) => {
  /** تطابق كلمة المرور */
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "كلمات المرور غير متطابقة",
    });
  }

  /** لو ليبي */
  if (data.nationalityId === "1") {
    if (!data.nationalId) {
      ctx.addIssue({
        path: ["nationalId"],
        message: "الرقم الوطني مطلوب",
      });
    }

    if (!data.nationalFileId) {
      ctx.addIssue({
        path: ["nationalFileId"],
        message: "مرفق الرقم الوطني مطلوب",
      });
    }
  }

  /** لو غير ليبي */
  if (data.nationalityId !== "1") {
    const requiredFields = [
      { key: "passportNumber", msg: "رقم جواز السفر مطلوب" },
      { key: "passportFileId", msg: "مرفق جواز السفر مطلوب" },
      { key: "residenceNumber", msg: "رقم الإقامة مطلوب" },
      { key: "residenceExpiry", msg: "تاريخ انتهاء الإقامة مطلوب" },
      { key: "residenceFileId", msg: "مرفق الإقامة مطلوب" },
    ];

    requiredFields.forEach((field) => {
      if (!data[field.key]) {
        ctx.addIssue({
          path: [field.key],
          message: field.msg,
        });
      }
    });
  }
});
const Signup = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState({
    national: null,
    passport: null,
    negative: null,
    residence: null
  })

  const nationalFileRef = useRef(null)
  const passportFileRef = useRef(null)
  const negativeCertRef = useRef(null)
  const residenceFileRef = useRef(null)

  const { genders, loading: loadingGenders } = useGender()
  const { nationalities, loading: loadingNationalities } = useNationality()
  const { uploadSingleFile } = useUploadFiles()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nationalityId: "",
      genderId: ""
    }
  })

  const selectedNationality = watch("nationalityId")

  const handleFileUpload = async (file, type) => {
    if (!file) return
    
    const fileObj = {
      uid: Date.now(),
      originFileObj: file,
      name: file.name
    }

    try {
      const fileId = await uploadSingleFile(fileObj)
      if (fileId) {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: {
            id: fileId,
            name: file.name,
            type: type
          }
        }))

        if (type === "national") setValue("nationalFileId", fileId)
        if (type === "passport") setValue("passportFileId", fileId)
        if (type === "negative") setValue("negativeCertFileId", fileId)
        if (type === "residence") setValue("residenceFileId", fileId)
      }
    } catch (error) {
      console.error("Upload failed:", error)
    }
  }

  const removeFile = (type) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }))

    if (type === "national") setValue("nationalFileId", null)
    if (type === "passport") setValue("passportFileId", null)
    if (type === "negative") setValue("negativeCertFileId", null)
    if (type === "residence") setValue("residenceFileId", null)
  }

  const FileDisplay = ({ file }) => {
    if (!file) return null
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-2 border border-green-500 rounded-lg py-1.5 px-6 flex items-center justify-between bg-green-50"
      >
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-green-600" />
          <span className="text-sm text-green-700 font-medium truncate max-w-[200px]">
            {file.name}
          </span>
        </div>
        <button
          type="button"
          onClick={() => removeFile(file.type)}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
        >
          <X size={18} />
        </button>
      </motion.div>
    )
  }
    const formatDate = (dateStr) => {
    if (!dateStr) return 0;

    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
    };

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const formData = {
        ...data,
        uploadedFiles: uploadedFiles
      }
      const payload = `0#${formData.name}#${formData.genderId}#${formData.phone}#${formData.email}#${formData.nationalityId || 0}#${formData.nationalId || formData.passportNumber}#${formData.passportNumber || formData.nationalId}#${formData.residenceNumber || formData.nationalId}#${formatDate(formData.residenceExpiry)}#${formData.uploadedFiles?.national?.id || 0}#${formData.uploadedFiles?.negative?.id || 0}#${formData.uploadedFiles?.passport?.id || 0}#${formData.uploadedFiles?.residence?.id || 0}#0#0#0#0#0#${formData.companyName}#${formData.username}#${formData.password}#0#0#default#0#0#`

      console.log("Form Submission Data:", formData) ;
      const response = await DoTransaction("ekiVNGTkL2f4U3z4PaxoxA==" ,
        payload,
        0,
        "Id#FullName#Gender_Id#MobileNum#Email#Nationality_Id#NationalNum#PassportNum#ResidenseNum#ResidenseEndDate#NationalNumAttach#SalbyCertificateAttach#PassportNumAttach#ResidenseNumAttach#BirthCertificateAttach#HealthCardAttach#SecurityCardAttach#WorkOfficeStatementAttach#WorkforceCardAttach#CompanyName#LoginName#Password#IsApproved#ApprovedBy#ApprovedDate#PictureAttach#User_Id#ApprovedRemarks"
      ) ;
      
      if(response.success == 200){
         toast.success("تم انشاء الحساب بنجاح");
         navigate("/login")
      }
      else{
         toast.error(response.errorMessage);
      }
      
    } catch (error) {
      console.error("Submission error:", error)
    //   alert("حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='h-screen flex gap-4 px-4 md:px-0 justify-center overflow-y-auto'>
      <div className='w-full max-w-6xl relative mt-8 md:mt-24 pb-8'>
        <div className='flex justify-center items-center'>
          <h1 className='text-3xl font-bold'>انشاء حساب</h1>
          <img src={logo} className='h-24 w-24 md:h-48 md:w-48 absolute left-0' alt="logo"/>
        </div>

        <div className='flex items-center justify-between mt-8'>
          <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>مرحبا بك!</h2>
            <span className='text-xl text-[#828282]'>إنشاء حساب </span>
          </div>
          
          <div className='flex flex-col gap-4'>
            <h2 className='text-sm md:text-xl font-bold mt-8 w-24 md:mt-16 md:w-48'>
              وزارة التربية والتعليم - إدارة التعليم الخاص
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* اسم المفوض */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>اسم المفوض</label>
              <input
                type="text"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل اسم المفوض"
                {...register("name")}
              />
              {errors.name && (
                <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>
              )}
            </div>

            {/* الجنس */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الجنس</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("genderId")}
                disabled={loadingGenders}
              >
                <option value="">اختر الجنس</option>
                {genders.map((gender) => (
                  <option key={gender.Id} value={gender.Id}>
                    {gender.Name}
                  </option>
                ))}
              </select>
              {errors.genderId && (
                <span className="text-red-500 text-sm mt-1">{errors.genderId.message}</span>
              )}
            </div>
            <div className='flex flex-col'>
                <label className='mb-1 font-semibold'>اسم المستخدم</label>
                <input
                    type="username"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="username"
                    {...register("username")}
                />
                {errors.username && (
                    <span className="text-red-500 text-sm mt-1">{errors.username.message}</span>
                )}
            </div>
            {/* رقم الهاتف */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>رقم الهاتف</label>
              <input
                type="tel"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="09xxxxxxxx"
                {...register("phone")}
              />
              {errors.phone && (
                <span className="text-red-500 text-sm mt-1">{errors.phone.message}</span>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>البريد الإلكتروني</label>
              <input
                type="email"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="example@mail.com"
                {...register("email")}
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>
              )}
            </div>

            {/* الجنسية */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الجنسية</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("nationalityId")}
                disabled={loadingNationalities}
              >
                <option value="">اختر الجنسية</option>
                {nationalities.map((nationality) => (
                  <option key={nationality.Id} value={nationality.Id}>
                    {nationality.Name}
                  </option>
                ))}
              </select>
              {errors.nationalityId && (
                <span className="text-red-500 text-sm mt-1">{errors.nationalityId.message}</span>
              )}
            </div>

            {/* السعودي - الرقم الوطني */}
            <AnimatePresence>
              {selectedNationality === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>الرقم الوطني</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل الرقم الوطني"
                    {...register("nationalId")}
                  />
                  {errors.nationalId && (
                    <span className="text-red-500 text-sm mt-1">{errors.nationalId.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* السعودي - مرفق الرقم الوطني */}
            <AnimatePresence>
              {selectedNationality === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>مرفق الرقم الوطني</label>
                  <div className='flex items-center gap-6'>
                    <button
                        type="button"
                        className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                        onClick={() => nationalFileRef.current.click()}
                    >
                        <Paperclip />
                        تحميل مرفق الرقم الوطني
                    </button>
                    <input
                        type="file"
                        ref={nationalFileRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "national")}
                    />
                    <FileDisplay file={uploadedFiles.national} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* شهادة سلبية للسعوديين */}
            <AnimatePresence>
                {selectedNationality === "1" && (
                <motion.div
                    className="flex flex-col"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={fadeIn}
                >
                    <div className='flex flex-col'>
                        <label className='mb-1 font-semibold'>شهادة سلبية</label>
                        <div className='flex items-center gap-6'>
                            <button
                            type="button"
                            className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                            onClick={() => negativeCertRef.current.click()}
                            >
                            <Paperclip />
                            تحميل شهادة سلبية
                            </button>
                            <input
                            type="file"
                            ref={negativeCertRef}
                            hidden
                            onChange={(e) => handleFileUpload(e.target.files[0], "negative")}
                            />
                            <FileDisplay file={uploadedFiles.negative} />
                        </div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            {/* غير السعودي - رقم جواز السفر */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>رقم جواز السفر</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل رقم جواز السفر"
                    {...register("passportNumber")}
                  />
                  {errors.passportNumber && (
                    <span className="text-red-500 text-sm mt-1">{errors.passportNumber.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - مرفق جواز السفر */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>مرفق جواز السفر</label>
                  <div className='flex items-center gap-6'>
                    <button
                        type="button"
                        className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                        onClick={() => passportFileRef.current.click()}
                    >
                        <Paperclip />
                        تحميل مرفق جواز السفر
                    </button>
                    <input
                        type="file"
                        ref={passportFileRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "passport")}
                    />
                    <FileDisplay file={uploadedFiles.passport} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - رقم الإقامة */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>رقم الإقامة</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل رقم الإقامة"
                    {...register("residenceNumber")}
                  />
                  {errors.residenceNumber && (
                    <span className="text-red-500 text-sm mt-1">{errors.residenceNumber.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - مرفق رقم الإقامة */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>مرفق رقم الإقامة</label>
                  <div className='flex items-center gap-6'>
                    <button
                        type="button"
                        className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                        onClick={() => residenceFileRef.current.click()}
                    >
                        <Paperclip />
                        تحميل مرفق رقم الإقامة
                    </button>
                    <input
                        type="file"
                        ref={residenceFileRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "residence")}
                    />
                    <FileDisplay file={uploadedFiles.residence} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير السعودي - تاريخ إنتهاء الإقامة */}
            <AnimatePresence>
              {selectedNationality && selectedNationality !== "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={slideIn}
                >
                  <label className='mb-1 font-semibold'>تاريخ إنتهاء الإقامة</label>
                  <input
                    type="date"
                    className='border border-gray-300 rounded px-3 py-2'
                    {...register("residenceExpiry")}
                  />
                  {errors.residenceExpiry && (
                    <span className="text-red-500 text-sm mt-1">{errors.residenceExpiry.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className='flex flex-col gap-4 mt-10'>
            <h2 className='text-xl font-bold'>بيانات الشركة</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* اسم الشركة - full width for Saudis, half for non-Saudis */}
              <div className={`flex flex-col ${selectedNationality !== "1" ? "col-span-1" : "col-span-2"}`}>
                <label className='mb-1 font-semibold'>اسم الشركة</label>
                <input
                  type="text"
                  className='border border-gray-300 rounded px-3 py-2'
                  placeholder="برجاء إدخال اسم الشركة"
                  {...register("companyName")}
                />
                {errors.companyName && (
                  <span className="text-red-500 text-sm mt-1">{errors.companyName.message}</span>
                )}
              </div>

              {/* شهادة سلبية لغير السعوديين */}
              <AnimatePresence>
                {selectedNationality && selectedNationality !== "1" && (
                  <motion.div
                    className="flex flex-col"
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={slideIn}
                  >
                    <label className='mb-1 font-semibold'>شهادة سلبية</label>
                    <div className='flex items-center gap-6'>
                        <button
                        type="button"
                        className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                        onClick={() => negativeCertRef.current.click()}
                        >
                        <Paperclip />
                        تحميل شهادة سلبية
                        </button>
                        <input
                        type="file"
                        ref={negativeCertRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "negative")}
                        />
                        <FileDisplay file={uploadedFiles.negative} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* كلمة المرور */}
              <div className="flex flex-col relative">
                <label className="mb-1 font-semibold">كلمة المرور</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className='border border-gray-300 rounded px-3 py-2 pr-10'
                  placeholder="برجاء إدخال كلمة المرور"
                  {...register("password")}
                />
                <span
                  className="absolute top-10 left-3 cursor-pointer text-[#BE8D4A]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>
                )}
              </div>

              {/* تاكيد كلمة المرور */}
              <div className="flex flex-col relative">
                <label className="mb-1 font-semibold">تأكيد كلمة المرور</label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className='border border-gray-300 rounded px-3 py-2 pr-10'
                  placeholder="برجاء إدخال كلمة المرور مرة أخرى"
                  {...register("confirmPassword")}
                />
                <span
                  className="absolute top-10 left-3 cursor-pointer text-[#BE8D4A]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
                {errors.confirmPassword && (
                  <span className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#BE8D4A] text-white py-3 rounded text-lg font-semibold mt-10 ${
              isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'جاري الإرسال...' : 'طلب إنشاء حساب'}
          </button>
          <Link to="/login" className='text-center text-sm mt-4 w-full flex items-center justify-center'>
            لديك حساب؟
            <Link
              to="/login"
              className="text-[#BE8D4A] mr-1 underline font-bold"
            >
              تسجيل الدخول
            </Link>
          </Link>
        </form>

        <footer className='w-full flex items-center justify-center my-6'>
            © 2025 جميع الحقوق محفوظة لمنصة وزارة التربية و التعليم
        </footer>
      </div>
    </div>
  )
}

export default Signup