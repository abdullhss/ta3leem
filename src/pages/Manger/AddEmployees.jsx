import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Paperclip, X } from 'lucide-react'
import useGender from '../../hooks/useGender'
import useNationality from '../../hooks/useNationality'
import useUploadFiles from '../../hooks/useUploadFiles'
import { toast } from 'react-toastify'
import FileViewer from '../../components/FileViewer'
import useEducationMaterials from '../../hooks/useEducationMaterials'
import { MultiSelect } from '../../ui/multi-select'
import { DoTransaction } from '../../services/apiServices'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useSchoolDepartment from '../../hooks/manger/useSchoolDepartment'
import useSchoolDevision from '../../hooks/manger/useSchoolDevision'

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

// Employee type options
const employeeTypes = [
  { id: "1", name: "اداري" },
  { id: "2", name: "معلم" },
]

// Zod validation schema
const employeeSchema = z.object({
  employeeType: z.string().min(1, "نوع الموظف مطلوب"),
  employeeName: z.string().min(3, "اسم الموظف يجب أن يكون على الأقل 3 أحرف"),
  employeeNumber: z.string().min(1, "رقم الموظف مطلوب"),
  genderId: z.string().min(1, "الجنس مطلوب"),
  phone: z
    .string()
    .regex(/^09[0-9]{8}$/, "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  loginName: z.string().min(3, "اسم المستخدم يجب أن يكون على الأقل 3 أحرف"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون على الأقل 6 أحرف"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  nationalityId: z.string().min(1, "الجنسية مطلوبة"),
  
  nationalId: z
    .string()
    .regex(/^[0-9]{12}$/, "الرقم الوطني يجب أن يتكون من 12 رقم")
    .optional(),
  nationalFileId: z.number().optional(),

  passportNumber: z.string().optional(),
  passportFileId: z.number().optional(),

  residenceNumber: z.string().optional(),
  residenceExpiry: z.string().optional(),
  residenceFileId: z.number().optional(),

  motherName: z.string().min(3, "اسم الأم يجب أن يكون على الأقل 3 أحرف"),
  
  educationalQualificationFileId: z.number().min(1, "المؤهل التربوي مطلوب"),
  cvFileId: z.number().min(1, "السيرة الذاتية مطلوبة"),
  
  yearsOfExperience: z.string().min(1, "سنوات الخبرة مطلوبة"),
  subjects: z.array(z.number()).optional(),
  schoolDepartmentId: z.string().optional(),
  schoolDevisionId: z.string().optional()
})
.superRefine((data, ctx) => {
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

  // Validate password confirmation
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      path: ["confirmPassword"],
      message: "كلمة المرور وتأكيد كلمة المرور غير متطابقين",
    });
  }

  // Validate based on employee type
  if (data.employeeType === "1") {
    // اداري - require department and division, not subjects
    if (!data.schoolDepartmentId) {
      ctx.addIssue({
        path: ["schoolDepartmentId"],
        message: "الادارة مطلوبة",
      });
    }
    if (!data.schoolDevisionId) {
      ctx.addIssue({
        path: ["schoolDevisionId"],
        message: "القسم مطلوب",
      });
    }
  } else if (data.employeeType === "2") {
    // معلم - require subjects, not department/division
    if (!data.subjects || data.subjects.length === 0) {
      ctx.addIssue({
        path: ["subjects"],
        message: "المواد المقررة مطلوبة",
      });
    }
  }
});

const AddEmployees = () => {
  const [uploadedFiles, setUploadedFiles] = useState({
    national: null,
    passport: null,
    residence: null,
    educationalQualification: null,
    cv: null
  })
  const { educationMaterials, totalCount, loading: loadingEducationMaterials } = useEducationMaterials("", 1);
  
  const nationalFileRef = useRef(null)
  const passportFileRef = useRef(null)
  const residenceFileRef = useRef(null)
  const educationalQualificationRef = useRef(null)
  const cvFileRef = useRef(null)

  const { genders, loading: loadingGenders } = useGender()
  const { nationalities, loading: loadingNationalities } = useNationality()
  const { uploadSingleFile } = useUploadFiles()
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nationalityId: "",
      genderId: "",
      employeeType: "",
      yearsOfExperience: "",
      subjects: [],
      schoolDepartmentId: "",
      schoolDevisionId: ""
    }
  })

  const selectedNationality = watch("nationalityId")
  const selectedSubjects = watch("subjects") || []
  const selectedEmployeeType = watch("employeeType")
  const selectedDepartmentId = watch("schoolDepartmentId")
  const selectedDevisionId = watch("schoolDevisionId")
  
  const { SchoolDepartments, loading: loadingDepartments } = useSchoolDepartment(userData?.School_Id || 0, "")
  const { SchoolDevisions, loading: loadingDevisions } = useSchoolDevision(userData?.School_Id || 0, selectedDepartmentId || 0, "")
  
  // Reset division when department changes
  useEffect(() => {
    setValue("schoolDevisionId", "")
  }, [selectedDepartmentId, setValue])

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    // Validate file type - only accept PDF
    const allowedTypes = ['application/pdf'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && fileExtension !== 'pdf') {
      toast.error("يرجى تحميل ملف PDF فقط");
      return;
    }

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
        if (type === "residence") setValue("residenceFileId", fileId)
        if (type === "educationalQualification") setValue("educationalQualificationFileId", fileId)
        if (type === "cv") setValue("cvFileId", fileId)
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("فشل تحميل الملف. يرجى المحاولة مرة أخرى");
    }
  }

  const removeFile = (type) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }))

    if (type === "national") setValue("nationalFileId", null)
    if (type === "passport") setValue("passportFileId", null)
    if (type === "residence") setValue("residenceFileId", null)
    if (type === "educationalQualification") setValue("educationalQualificationFileId", null)
    if (type === "cv") setValue("cvFileId", null)
  }
  const formatDate = (dateInput) => {
    const date = new Date(dateInput);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
  
    return `${day}/${month}/${year}`;
  }
  
  console.log(errors)
  
  const onSubmit = async (data) => {
    const residenceExpiryFormatted = data.residenceExpiry ? formatDate(data.residenceExpiry) : "default";

    try {
      const response = await DoTransaction(
        "ps1zVpV4q7/4qh8wV8pzqA==" ,
        `${0}#${userData.School_Id}#${data.employeeType}#${data.employeeName}#${data.employeeNumber}#${data.phone}#${data.genderId}#${data.email}#${data.loginName}#${data.password}#${data.nationalityId}#${data.nationalId || data.passportNumber}#${data.passportNumber || data.nationalId}#${data.residenceNumber || data.nationalId}#${data.motherName}#${uploadedFiles.national?.id || 0}#${uploadedFiles.passport?.id || 0}#${uploadedFiles.residence?.id || 0}#${residenceExpiryFormatted}#${uploadedFiles.cv?.id || 0}#${uploadedFiles.educationalQualification?.id || 0}#${data.yearsOfExperience}#${selectedSubjects.join(',')}#False#0#default#0#0#default##False#${selectedDepartmentId}#${selectedDevisionId}#0#0`, 
        0,
        "Id#School_Id#SchoolEmployeeType_Id#FullName#DefinedNum#MobileNum#Gender_Id#Email#LoginName#Password#Nationality_Id#NationalNum#PassportNum#ResidenseNum#MotherName#NationalNumAttach#PassportNumAttach#ResidenseNumAttach#ResidenseEndDate#CVAttach#EducationCertificateAttach#ExperinceYears#EducationMaterialName_Ids#IsSent#SentBy#SentDate#IsApproved#ApprovedBy#ApprovedDate#ApprovedRemarks#IsActive#SchoolDepartment_Id#SchoolDevision_Id#SchoolUserGroup_Id#User_Id"
      )
      if(response.success !== 200){
        toast.error(response.errorMessage || "حدث خطأ أثناء حفظ البيانات")
      }else{
        toast.success("تم حفظ البيانات بنجاح")
        navigate("/Employees")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("حدث خطأ أثناء حفظ البيانات")
    }
  }

  const handleAddContracts = () => {
    // Navigate to contracts page or open modal
    navigate("/Employees/Contracts/Add")
  }

  return (
    <div className='gap-4 px-4 md:px-0 overflow-y-auto'>
      <div className='w-full relative mt-8 pb-8 p-6 bg-white rounded-lg'>
        <div className='flex'>
          <h1 className='text-xl font-bold'>إضافة موظفين</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* نوع الموظف */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>نوع الموظف</label>
              <select
                className='border border-gray-300 rounded px-3 py-1'
                {...register("employeeType")}
              >
                <option value="">اختر نوع الموظف</option>
                {employeeTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.employeeType && (
                <span className="text-red-500 text-sm mt-1">{errors.employeeType.message}</span>
              )}
            </div>

            {/* اسم الموظف */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>اسم الموظف</label>
              <input
                type="text"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل اسم الموظف"
                {...register("employeeName")}
              />
              {errors.employeeName && (
                <span className="text-red-500 text-sm mt-1">{errors.employeeName.message}</span>
              )}
            </div>

            {/* رقم الموظف */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>رقم الموظف</label>
              <input
                type="text"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل رقم الموظف"
                {...register("employeeNumber")}
              />
              {errors.employeeNumber && (
                <span className="text-red-500 text-sm mt-1">{errors.employeeNumber.message}</span>
              )}
            </div>

            {/* الجنس */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الجنس</label>
              <select
                className='border border-gray-300 rounded px-3 py-1'
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

            {/* اسم المستخدم */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>اسم المستخدم</label>
              <input
                type="text"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل اسم المستخدم"
                {...register("loginName")}
              />
              {errors.loginName && (
                <span className="text-red-500 text-sm mt-1">{errors.loginName.message}</span>
              )}
            </div>

            {/* كلمة المرور */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>كلمة المرور</label>
              <input
                type="password"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل كلمة المرور"
                {...register("password")}
              />
              {errors.password && (
                <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>
              )}
            </div>

            {/* تأكيد كلمة المرور */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>تأكيد كلمة المرور</label>
              <input
                type="password"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="أعد إدخال كلمة المرور"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <span className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</span>
              )}
            </div>

            {/* الجنسية */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الجنسية</label>
              <select
                className='border border-gray-300 rounded px-3 py-1'
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

            {/* الليبي - الرقم الوطني */}
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

            {/* الليبي - مرفق الرقم الوطني */}
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
                        تحميل ملف PDF
                    </button>
                    <input
                        type="file"
                        ref={nationalFileRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "national")}
                        accept=".pdf,application/pdf"
                    />
                    <FileViewer id={uploadedFiles.national?.id} />
                  </div>
                  {errors.nationalFileId && (
                    <span className="text-red-500 text-sm mt-1">{errors.nationalFileId.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير الليبي - رقم جواز السفر */}
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

            {/* غير الليبي - مرفق جواز السفر */}
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
                        تحميل ملف PDF
                    </button>
                    <input
                        type="file"
                        ref={passportFileRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "passport")}
                        accept=".pdf,application/pdf"
                    />
                    <FileViewer id={uploadedFiles.passport?.id} />
                  </div>
                  {errors.passportFileId && (
                    <span className="text-red-500 text-sm mt-1">{errors.passportFileId.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير الليبي - رقم الإقامة */}
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

            {/* غير الليبي - مرفق رقم الإقامة */}
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
                        تحميل ملف PDF
                    </button>
                    <input
                        type="file"
                        ref={residenceFileRef}
                        hidden
                        onChange={(e) => handleFileUpload(e.target.files[0], "residence")}
                        accept=".pdf,application/pdf"
                    />
                    <FileViewer id={uploadedFiles.residence?.id} />
                  </div>
                  {errors.residenceFileId && (
                    <span className="text-red-500 text-sm mt-1">{errors.residenceFileId.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* غير الليبي - تاريخ إنتهاء الإقامة */}
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

            {/* اسم الام */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>اسم الام</label>
              <input
                type="text"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل اسم الام"
                {...register("motherName")}
              />
              {errors.motherName && (
                <span className="text-red-500 text-sm mt-1">{errors.motherName.message}</span>
              )}
            </div>

            {/* المؤهل التربوي */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>المؤهل التربوي</label>
              <div className='flex items-center gap-6'>
                <button
                  type="button"
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                  onClick={() => educationalQualificationRef.current.click()}
                >
                  <Paperclip />
                  تحميل ملف PDF
                </button>
                <input
                  type="file"
                  ref={educationalQualificationRef}
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0], "educationalQualification")}
                  accept=".pdf,application/pdf"
                />
                <FileViewer id={uploadedFiles.educationalQualification?.id} />
              </div>
              {errors.educationalQualificationFileId && (
                <span className="text-red-500 text-sm mt-1">{errors.educationalQualificationFileId.message}</span>
              )}
            </div>

            {/* السيرة الذاتية */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>السيرة الذاتية</label>
              <div className='flex items-center gap-6'>
                <button
                  type="button"
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                  onClick={() => cvFileRef.current.click()}
                >
                  <Paperclip />
                  تحميل ملف PDF
                </button>
                <input
                  type="file"
                  ref={cvFileRef}
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0], "cv")}
                  accept=".pdf,application/pdf"
                />
                <FileViewer id={uploadedFiles.cv?.id} />
              </div>
              {errors.cvFileId && (
                <span className="text-red-500 text-sm mt-1">{errors.cvFileId.message}</span>
              )}
            </div>

            {/* سنوات الخبرة */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>سنوات الخبرة</label>
              <input
                type="number"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل سنوات الخبرة"
                {...register("yearsOfExperience")}
              />
              {errors.yearsOfExperience && (
                <span className="text-red-500 text-sm mt-1">{errors.yearsOfExperience.message}</span>
              )}
            </div>

            {/* اختر الادارة - Only for اداري (employeeType == 1) */}
            <AnimatePresence>
              {selectedEmployeeType === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>اختر الادارة</label>
                  <select
                    className='border border-gray-300 rounded px-3 py-1'
                    {...register("schoolDepartmentId")}
                    disabled={loadingDepartments}
                  >
                    <option value="">اختر الادارة</option>
                    {SchoolDepartments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.Description}
                      </option>
                    ))}
                  </select>
                  {errors.schoolDepartmentId && (
                    <span className="text-red-500 text-sm mt-1">{errors.schoolDepartmentId.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* اختر القسم - Only for اداري (employeeType == 1) */}
            <AnimatePresence>
              {selectedEmployeeType === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>اختر القسم</label>
                  <select
                    className='border border-gray-300 rounded px-3 py-1'
                    {...register("schoolDevisionId")}
                    value={selectedDevisionId}
                    disabled={loadingDevisions || !selectedDepartmentId}
                  >
                    <option value="">اختر القسم</option>
                    {SchoolDevisions.map((dev) => (
                      <option key={dev.id} value={dev.id}>
                        {dev.Description}
                      </option>
                    ))}
                  </select>
                  {errors.schoolDevisionId && (
                    <span className="text-red-500 text-sm mt-1">{errors.schoolDevisionId.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* المواد المقررة - Only for معلم (employeeType == 2) */}
            <AnimatePresence>
              {selectedEmployeeType === "2" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>المواد المقررة</label>
                  <MultiSelect
                    options={educationMaterials}
                    selectedValues={selectedSubjects}
                    onSelectionChange={(values) => setValue("subjects", values)}
                    loading={loadingEducationMaterials}
                    error={null}
                    placeholder="اختر المواد المقررة"
                    emptyText="لا توجد مواد متاحة"
                    itemLabel="مادة"
                    itemsLabel="مواد"
                    getValue={(option) => option.Id}
                    getLabel={(option) => option.Description}
                    className="py-1"
                  />
                  {errors.subjects && (
                    <span className="text-red-500 text-sm mt-1">{errors.subjects.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-10">
                <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 border border-red-500 text-red-500 py-3 rounded text-lg font-semibold"
                >
                إلغاء
                </button>
                <button
                type="button"
                onClick={handleAddContracts}
                className="flex-1 bg-[#BE8D4A] text-white py-3 rounded text-lg font-semibold"
                >
                إضافة العقود للموظف
                </button>
                <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-[#BE8D4A] text-white py-3 rounded text-lg font-semibold ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                >
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
                </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEmployees