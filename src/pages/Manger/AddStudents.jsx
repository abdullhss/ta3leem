import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Paperclip, X, Plus } from 'lucide-react'
import useNationality from '../../hooks/useNationality'
import useUploadFiles from '../../hooks/useUploadFiles'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useEducationLevel from '../../hooks/useEducationLevel'
import useEducationSecondaryLevelType from '../../hooks/useEducationSecondaryLevelType'
import useEducationClass from '../../hooks/useEducationClass'
import useStudentParents from '../../hooks/useStudentParents'
import useGender from '../../hooks/useGender'
import useStudentStatus from '../../hooks/useStudentStatus'
import useStudentTransStatus from '../../hooks/useStudentTransStatus'
import useEducationPeriod from '../../hooks/useEducationPeriod'

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
const addStudentSchema = z.object({
  studentName: z
    .string()
    .min(3, "اسم الطالب يجب أن يكون على الأقل 3 أحرف")
    .regex(/^[\u0600-\u06FF\s]+$/, "اسم الطالب يجب أن يكون باللغة العربية"),

  nationalityId: z.string().min(1, "الجنسية مطلوبة"),

  gender: z.enum(['male', 'female'], {
    required_error: "الجنس مطلوب"
  }),

  nationalId: z.string().optional(),
  nationalFileId: z.number().optional(),
  genderId: z.string().min(1, "الجنس مطلوب"),
  passportNumber: z.string().optional(),
  passportFileId: z.number().optional(),

  administrativeNumber: z.string().optional(),

  residenceNumber: z.string().optional(),
  residenceExpiry: z.string().optional(),
  residenceFileId: z.number().optional(),

  studentStatus: z.string().min(1, "حالة الطالب مطلوبة"),
  transportDetails: z.string().min(1, "تفاصيل النقل مطلوبة"),
  grade: z.string().min(1, "الصف الدراسي مطلوب"),
  educationalStage: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  semester: z.string().min(1, "الفصل الدراسي مطلوب"),
  guardianId: z.string().min(1, "ولي الأمر مطلوب"),

  papersFileId: z.number().optional(),
  healthFileId: z.number().optional()
})
.superRefine((data, ctx) => {
  // إذا كان الطالب سعودي
  if (data.nationalityId === "1") {
    if (!data.nationalId) {
      ctx.addIssue({
        path: ["nationalId"],
        message: "الرقم الوطني للطالب مطلوب",
      });
    }

    if (!data.nationalFileId) {
      ctx.addIssue({
        path: ["nationalFileId"],
        message: "مرفق الرقم الوطني مطلوب",
      });
    }

    if (!data.administrativeNumber) {
      ctx.addIssue({
        path: ["administrativeNumber"],
        message: "الرقم الإداري مطلوب",
      });
    }
  }

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

  // الملفات العامة المطلوبة لجميع الطلاب
  if (!data.papersFileId) {
    ctx.addIssue({
      path: ["papersFileId"],
      message: "مرفق الصحائف مطلوب",
    });
  }

  if (!data.healthFileId) {
    ctx.addIssue({
      path: ["healthFileId"],
      message: "الملف الصحي مطلوب",
    });
  }
});

const AddStudents = () => {
  const [uploadedFiles, setUploadedFiles] = useState({
    national: null,
    passport: null,
    residence: null,
    papers: null,
    health: null
  })

  const nationalFileRef = useRef(null)
  const passportFileRef = useRef(null)
  const residenceFileRef = useRef(null)
  const papersFileRef = useRef(null)
  const healthFileRef = useRef(null)

  const { nationalities, loading: loadingNationalities } = useNationality()
  const { uploadSingleFile } = useUploadFiles()
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const { EducationLevels, loading: loadingEducationLevels } = useEducationLevel()
  const { EducationSecondaryLevelTypes, loading: loadingEducationSecondaryLevelTypes } = useEducationSecondaryLevelType()
  const { EducationClasses, loading: loadingEducationClasses } = useEducationClass()
  const [selectedEducationalStage, setSelectedEducationalStage] = useState(null)
  const [allowedEducationClasses, setAllowedEducationClasses] = useState([])
  const { StudentParents, StudentParentCount, loading, error } = useStudentParents(
    userData.School_Id || 0,
    "",
    1,
    10
  );
  const {genders , loading: loadingGenders} = useGender() ; 

  const { StudentTransStatuses, loading: loadingStudentTransStatuses } = useStudentTransStatus()
  
  const { EducationPeriods, loading: loadingEducationPeriods } = useEducationPeriod()

  useEffect(() => {      
    if (selectedEducationalStage) {
    setAllowedEducationClasses(
        EducationClasses.filter(
        (c) => c.EducationLevel_Id == selectedEducationalStage
        )
    )
    }
}, [selectedEducationalStage])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      nationalityId: "",
      gender: "",
      studentStatus: "",
      transportDetails: "",
      grade: "",
      educationalStage: "",
      semester: "",
      guardianId: ""
    }
  })

  const selectedNationality = watch("nationalityId")

  // هذه البيانات افتراضية - في التطبيق الحقيقي سيتم جلبها من API
  const studentStatusOptions = [
    { id: '1', name: 'نشط' },
    { id: '2', name: 'منقطع' },
    { id: '3', name: 'متخرج' },
    { id: '4', name: 'محول' }
  ]

  const transportOptions = [
    { id: '1', name: 'نقل مدرسي' },
    { id: '2', name: 'نقل خاص' },
    { id: '3', name: 'مشي' }
  ]


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
        if (type === "residence") setValue("residenceFileId", fileId)
        if (type === "papers") setValue("papersFileId", fileId)
        if (type === "health") setValue("healthFileId", fileId)
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("فشل في تحميل الملف")
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
    if (type === "papers") setValue("papersFileId", null)
    if (type === "health") setValue("healthFileId", null)
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

  const onSubmit = async (data) => {
    console.log("Form Data:", data)
    try {
      // هنا سيتم إضافة منطق API
      toast.success("تم إضافة الطالب بنجاح")
    } catch (error) {
      console.error("Error:", error)
      toast.error("حدث خطأ أثناء إضافة الطالب")
    }
  }

    const handleAddGroup = () => {
        navigate("/education-levels/groups")
    }

    const handleAddGuardian = () => {
        navigate("/education-levels/parents/add")
    }

  return (
    <div className='flex gap-4 px-4 md:px-0 justify-center overflow-y-auto'>
      <div className='w-full relative pb-8 bg-white rounded-lg p-6'>
        <span className="text-lg font-bold">إضافة طالب</span>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* اسم الطالب */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>اسم الطالب</label>
              <input
                type="text"
                className='border border-gray-300 rounded px-3 py-2'
                placeholder="ادخل اسم الطالب كاملاً"
                {...register("studentName")}
              />
              {errors.studentName && (
                <span className="text-red-500 text-sm mt-1">{errors.studentName.message}</span>
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

            {/* الجنس */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الجنس</label>
              <div className="flex gap-6 mt-2">
                {
                  genders.map((gender) => (
                    <label className="flex items-center gap-2" key={gender.Id}>
                      <input
                          type="radio"
                          value={gender.Id}
                          {...register("gender")}
                          className="w-5 h-5 accent-[#BE8D4A]"
                        />
                      <span>{gender.Name}</span>
                    </label>
                  ))
                }
              </div>
              {errors.gender && (
                <span className="text-red-500 text-sm mt-1">{errors.gender.message}</span>
              )}
            </div>

            {/* السعودي - الرقم الوطني للطالب */}
            <AnimatePresence>
              {selectedNationality === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>الرقم الوطني للطالب</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل الرقم الوطني للطالب"
                    {...register("nationalId")}
                  />
                  {errors.nationalId && (
                    <span className="text-red-500 text-sm mt-1">{errors.nationalId.message}</span>
                  )}
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

            {/* السعودي - الرقم الإداري */}
            <AnimatePresence>
              {selectedNationality === "1" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>الرقم الإداري</label>
                  <input
                    type="text"
                    className='border border-gray-300 rounded px-3 py-2'
                    placeholder="ادخل الرقم الإداري"
                    {...register("administrativeNumber")}
                  />
                  {errors.administrativeNumber && (
                    <span className="text-red-500 text-sm mt-1">{errors.administrativeNumber.message}</span>
                  )}
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

            {/* حالة الطالب */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>حالة الطالب</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("studentStatus")}
              >
                <option value="">اختر حالة الطالب</option>
                {studentStatusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              {errors.studentStatus && (
                <span className="text-red-500 text-sm mt-1">{errors.studentStatus.message}</span>
              )}
            </div>

            {/* تفاصيل النقل */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>تفاصيل النقل</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("transportDetails")}
              >
                <option value="">اختر تفاصيل النقل</option>
                {transportOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {errors.transportDetails && (
                <span className="text-red-500 text-sm mt-1">{errors.transportDetails.message}</span>
              )}
            </div>

            
            {/* المرحلة الدراسية */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>المرحلة الدراسية</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("educationalStage")}
                onChange={(e) => setSelectedEducationalStage(e.target.value)}
              >
                <option value="">اختر المرحلة الدراسية</option>
                {EducationLevels.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.Description}
                  </option>
                ))}
              </select>
              {errors.educationalStage && (
                <span className="text-red-500 text-sm mt-1">{errors.educationalStage.message}</span>
              )}
            </div>
            
            {/* الصف الدراسي */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الصف الدراسي</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("grade")}
              >
                <option value="">اختر الصف الدراسي</option>
                {allowedEducationClasses.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.Description}
                  </option>
                ))}
              </select>
              {errors.grade && (
                <span className="text-red-500 text-sm mt-1">{errors.grade.message}</span>
              )}
            </div>

            {/* الفصل الدراسي مع زر إضافة مجموعة */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 flex flex-col'>
                <label className='mb-1 font-semibold'>الفصل الدراسي</label>
                <select
                  className='border border-gray-300 rounded px-3 py-2'
                  {...register("semester")}
                >
                  <option value="">اختر الفصل الدراسي</option>
                  {EducationClasses.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.Description}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <span className="text-red-500 text-sm mt-1">{errors.semester.message}</span>
                )}
              </div>
              <div className='flex items-end'>
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded h-[42px]'
                >
                  <Plus size={18} />
                  إضافة مجموعة
                </button>
              </div>
            </div>

            {/* ولي الأمر مع زر إضافة ولي الأمر */}
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 flex flex-col'>
                <label className='mb-1 font-semibold'>ولي الأمر</label>
                <select
                  className='border border-gray-300 rounded px-3 py-2'
                  {...register("guardianId")}
                >
                  <option value="">اختر ولي الأمر</option>
                  {StudentParents.map((guardian) => (
                    <option key={guardian.id} value={guardian.id}>
                      {guardian.FullName}
                    </option>
                  ))}
                </select>
                {errors.guardianId && (
                  <span className="text-red-500 text-sm mt-1">{errors.guardianId.message}</span>
                )}
              </div>
              <div className='flex items-end'>
                <button
                  type="button"
                  onClick={handleAddGuardian}
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2.5 rounded h-[42px]'
                >
                  <Plus size={18} />
                  إضافة ولي الأمر
                </button>
              </div>
            </div>

            {/* الصحائف - ملفات uploader */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الصحائف</label>
              <div className='flex items-center gap-6'>
                <button
                  type="button"
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                  onClick={() => papersFileRef.current.click()}
                >
                  <Paperclip />
                  تحميل الصحائف
                </button>
                <input
                  type="file"
                  ref={papersFileRef}
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0], "papers")}
                />
                <FileDisplay file={uploadedFiles.papers} />
              </div>
              {errors.papersFileId && (
                <span className="text-red-500 text-sm mt-1">{errors.papersFileId.message}</span>
              )}
            </div>

            {/* الملف الصحي - ملفات uploader */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الملف الصحي</label>
              <div className='flex items-center gap-6'>
                <button
                  type="button"
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                  onClick={() => healthFileRef.current.click()}
                >
                  <Paperclip />
                  تحميل الملف الصحي
                </button>
                <input
                  type="file"
                  ref={healthFileRef}
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0], "health")}
                />
                <FileDisplay file={uploadedFiles.health} />
              </div>
              {errors.healthFileId && (
                <span className="text-red-500 text-sm mt-1">{errors.healthFileId.message}</span>
              )}
            </div>
          </div>

          {/* أزرار الإضافة والإلغاء */}
          <div className="flex w-full gap-4 mt-10">
            <button
            type="button"
            className="w-full text-red-500 border border-red-500 transition-all duration-300 px-8 py-3 rounded text-lg font-semibold hover:bg-red-500 hover:text-white"
            onClick={() => navigate(-1)}
            >
            إلغاء
            </button>
            <button
            type="submit"
            className="bg-[#BE8D4A] w-full text-white px-8 py-3 rounded text-lg font-semibold hover:bg-[#a67c42]"
            >
            إضافة طالب
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStudents