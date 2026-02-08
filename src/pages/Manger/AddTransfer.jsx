import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Paperclip, X } from 'lucide-react'
import useSchools from '../../hooks/schools/useSchools'
import useBaladias from '../../hooks/useBaladia'
import useBaldiaOffice from '../../hooks/useBaldiaOffice'
import useEducationClassForSchool from '../../hooks/schools/useEducationClassForSchool'
import useEducationLevelForSchool from '../../hooks/schools/useEducationLevelForSchool'
import useEducationPeriodForSchool from '../../hooks/schools/useEducationPeriodForSchool'
import useEducationSecondaryLevelType from '../../hooks/useEducationSecondaryLevelType'
import useStudentsByClass from '../../hooks/schools/useStudentsByClass'
import useUploadFiles from '../../hooks/useUploadFiles'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { DoTransaction } from '../../services/apiServices'
import useSchoolClass from '../../hooks/useSchoolClass'
import useSchoolsByOffice from '../../hooks/schools/useSchoolsByOffice'

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

// Zod validation schema for transfer - Updated to include baladiaId
const addTransferSchema = z.object({
  educationalStage: z.string().min(1, "المرحلة الدراسية مطلوبة"),
  grade: z.string().min(1, "الصف الدراسي مطلوب"),
  semester: z.string().min(1, "الفصل الدراسي مطلوب"),
  educationSecondaryLevelType: z.string().optional(),
  studentId: z.string().min(1, "اسم الطالب مطلوب"),
  baladiaId: z.string().min(1, "البلدية مطلوبة"), // Added baladiaId
  baladiaOfficeId: z.string().min(1, "المكتب مطلوب"),
  targetSchoolId: z.string().min(1, "المدرسة المراد الانتقال لها مطلوبة"),
  behaviorFileId: z.number().min(1, "سيرة و السلوك مطلوبة"),
  reason: z.string()
    .min(10, "السبب يجب أن يكون على الأقل 10 أحرف")
    .max(500, "السبب يجب أن لا يتجاوز 500 حرف")
})

const AddTransfer = () => {
  const { userData, educationYearData } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const { uploadSingleFile } = useUploadFiles()

  // State for uploaded file
  const [behaviorFile, setBehaviorFile] = useState(null)
  const [behaviorFileId, setBehaviorFileId] = useState(null)

  // State for dependent selects
  const [selectedEducationalStage, setSelectedEducationalStage] = useState('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedSemester, setSelectedSemester] = useState('')
  const [selectedBaladia, setSelectedBaladia] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState(null)
  
  // Fetch data hooks
  const { Baladias, loading: baladiasLoading } = useBaladias()
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addTransferSchema),
    defaultValues: {
      educationalStage: "",
      grade: "",
      semester: "",
      educationSecondaryLevelType: "",
      studentId: "",
      baladiaId: "", // Added default value
      baladiaOfficeId: "",
      targetSchoolId: "",
      reason: ""
    }
  })  
  // Get the selected office ID from the form
  // Watch form values
  const watchBaladiaOfficeId = watch("baladiaOfficeId")
  const watchEducationalStage = watch("educationalStage")
  const watchGrade = watch("grade")
  const watchSemester = watch("semester")
  const watchBaladiaId = watch("baladiaId")
  const watchTargetSchoolId = watch("targetSchoolId")
  
  // Fetch schools by office ID
  const { schools: schoolsByOffice, loading: schoolsByOfficeLoading } = useSchoolsByOffice(
    watchBaladiaOfficeId || 0, // Pass the selected office ID or 0 if not selected
    -1,
    "",
    1, 
    10000,
  )
  
  // Use BaldiaOffice hook for offices of selected baladia
  const { BaldiaOffice, loading: baladiaOfficeLoading } = useBaldiaOffice(
    selectedBaladia?.Id
  )
  
  const { EducationClasses, loading: educationClassesLoading } = useEducationClassForSchool({
    school_id: userData.School_Id
  })
  
  const { EducationLevels, loading: educationLevelsLoading } = useEducationLevelForSchool({
    school_id: userData.School_Id
  })
  
  const { EducationPeriods, loading: educationPeriodsLoading } = useEducationPeriodForSchool({
    school_id: userData.School_Id
  })
  
  const { EducationSecondaryLevelTypes, loading: educationSecondaryLevelTypesLoading } = useEducationSecondaryLevelType()
  
  const { SchoolClasses, loading: schoolClassesLoading } = useSchoolClass(
    userData.School_Id, 
    "", 
    1, 
    10000
  )

  // Filter schools - only show schools from the selected office that are not the current school
  const filteredSchools = schoolsByOffice.filter(school => 
    school.Id !== userData.School_Id
  )

  // Filter education classes by selected educational stage
  const allowedEducationClasses = EducationClasses.filter(
    ec => ec.EducationLevel_Id == selectedEducationalStage
  )

  // Filter school classes by selected educational stage and grade
  const allowedSchoolClasses = SchoolClasses.filter(
    sc => sc.EducationLevel_Id == selectedEducationalStage && 
          sc.EducationClass_Id == selectedGrade
  )

  // Fetch students based on selected filters
  const { Students, loading: studentsLoading } = useStudentsByClass({
    School_id: userData.School_Id,
    EducationYear_Id: educationYearData?.Id || 0,
    SchoolClass_id: selectedSemester || 0,
    EducationPeriod_id: -1,
    value: "",
    StartNum: 1,
    Count: 10000
  })



  // Update state when form values change
  useEffect(() => {
    setSelectedEducationalStage(watchEducationalStage)
  }, [watchEducationalStage])

  useEffect(() => {
    setSelectedGrade(watchGrade)
  }, [watchGrade])

  useEffect(() => {
    setSelectedSemester(watchSemester)
  }, [watchSemester])

  // Update selected baladia when baladiaId changes
  useEffect(() => {
    if (watchBaladiaId) {
      const baladia = Baladias.find(b => b.Id == watchBaladiaId)
      setSelectedBaladia(baladia)
    } else {
      setSelectedBaladia(null)
    }
  }, [watchBaladiaId, Baladias])

  // Clear dependent fields when educational stage changes
  useEffect(() => {
    if (selectedEducationalStage) {
      setValue("grade", "")
      setValue("semester", "")
      setValue("studentId", "")
    }
  }, [selectedEducationalStage, setValue])

  // Clear dependent fields when grade changes
  useEffect(() => {
    if (selectedGrade) {
      setValue("semester", "")
      setValue("studentId", "")
    }
  }, [selectedGrade, setValue])

  // Clear dependent fields when baladia changes
  useEffect(() => {
    if (selectedBaladia) {
      setValue("baladiaOfficeId", "")
      setValue("targetSchoolId", "")
      setSelectedSchool(null)
    }
  }, [selectedBaladia, setValue])

  // Clear dependent fields when office changes
  useEffect(() => {
    if (watchBaladiaOfficeId) {
      setValue("targetSchoolId", "")
      setSelectedSchool(null)
    }
  }, [watchBaladiaOfficeId, setValue])

  // Handle school selection
  const handleSchoolChange = (schoolId) => {
    const school = filteredSchools.find(s => s.Id == schoolId)
    setSelectedSchool(school)
  }

  // File upload handler
  const handleFileUpload = async (file) => {
    if (!file) return
    
    const fileObj = {
      uid: Date.now(),
      originFileObj: file,
      name: file.name
    }

    try {
      const uploadedFileId = await uploadSingleFile(fileObj)
      if (uploadedFileId) {
        setBehaviorFile({
          id: uploadedFileId,
          name: file.name
        })
        setBehaviorFileId(uploadedFileId)
        setValue("behaviorFileId", uploadedFileId)
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("فشل في تحميل الملف")
    }
  }

  const removeFile = () => {
    setBehaviorFile(null)
    setBehaviorFileId(null)
    setValue("behaviorFileId", null)
  }

  // Form submission
  const onSubmit = async (data) => {
    console.log("Form Data:", data)
    
    try {
      // Prepare payload based on API requirements
      const payload = [
            0,                               // Id
            userData.School_Id,              // School_Id
            educationYearData?.Id || 0,       // EducationYear_Id
            data.educationalStage,            // EducationLevel_Id
            data.grade,                       // EducationClass_Id
            data.semester,                    // SchoolClass_Id
            data.studentId,                   // Student_id
            data.baladiaOfficeId,             // WantedOffice_Id
            data.targetSchoolId,              // WantedSchool_Id
            data.behaviorFileId || 0,         // SerahAndSlokAttach
            data.reason,                      // Reason
            "default",                               // CreatedDate
            userData.Id || userData.id ,                      // CreatedBy
            0,                                // SchoolApproved
            0,                                // SchoolApproveBy
            "default",                               // SchoolApproveDate
            "",                               // SchoolApproveRemarks
            0,                                // OfficeApproved
            0,                                // OfficeApproveBy
            "default",                               // OfficeApproveDate
            "",                               // OfficeApproveRemarks
            data.educationSecondaryLevelType || 0 // EducationSecondaryLevelType_Id
          ].join("#")

      console.log("API Payload:", payload)
      
      const response = await DoTransaction(
        "bODjeovmi/JdOPD2B+6n6j1y3X2IJMdguQEtVdLuTsI=",
        payload,
        0, // Action 0 = add
        "Id#School_Id#EducationYear_Id#EducationLevel_Id#EducationClass_Id#SchoolClass_Id#Student_id#WantedOffice_Id#WantedSchool_Id#SerahAndSlokAttach#Reason#CreatedDate#CreatedBy#SchoolApproved#SchoolApproveBy#SchoolApproveDate#SchoolApproveRemarks#OfficeApproved#OfficeApproveBy#OfficeApproveDate#OfficeApproveRemarks#EducationSecondaryLevelType_Id"
      )
      
      console.log("API Response:", response)
      
      if (response.success != 200) {
        toast.error(response.errorMessage || "فشل في إضافة النقل")
      } else {
        toast.success("تم إضافة النقل بنجاح")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("حدث خطأ أثناء إضافة النقل")
    }
  }

  const onError = (errors) => {
    console.log("Form Validation Errors:", errors)
  }

  return (
    <div className='flex gap-4 px-4 md:px-0 justify-center overflow-y-auto'>
      <div className='w-full relative pb-8 bg-white rounded-lg p-6'>
        <span className="text-lg font-bold">نقل طالب</span>
        
        <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-10">
          <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* المرحلة الدراسية */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>المرحلة الدراسية</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("educationalStage")}
                disabled={educationLevelsLoading}
              >
                <option value="">اختر المرحلة الدراسية</option>
                {EducationLevels.map((level) => (
                  <option key={level.Id || level.id} value={level.Id || level.id}>
                    {level.Description}
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
                disabled={!selectedEducationalStage || educationClassesLoading}
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

            {/* الفصل الدراسي */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>الفصل الدراسي</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("semester")}
                disabled={!selectedGrade || schoolClassesLoading}
              >
                <option value="">اختر الفصل الدراسي</option>
                {allowedSchoolClasses.map((semester) => (
                  <option key={semester.id || semester.Id} value={semester.id || semester.Id}>
                    {semester.Descrition || semester.Description || semester.SchoolClass_Description}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <span className="text-red-500 text-sm mt-1">{errors.semester.message}</span>
              )}
            </div>

            {/* الشعبة الدراسية - تظهر فقط إذا كانت المرحلة الدراسية == 4 */}
            <AnimatePresence>
              {selectedEducationalStage === "4" && (
                <motion.div
                  className="flex flex-col"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={fadeIn}
                >
                  <label className='mb-1 font-semibold'>الشعبة الدراسية مطلوبة</label>
                  <select
                    className='border border-gray-300 rounded px-3 py-2'
                    {...register("educationSecondaryLevelType")}
                    disabled={educationSecondaryLevelTypesLoading}
                  >
                    <option value="">اختر الشعبة الدراسية</option>
                    {EducationSecondaryLevelTypes.map((type) => (
                      <option key={type.Id || type.id} value={type.Id || type.id}>
                        {type.Description}
                      </option>
                    ))}
                  </select>
                  {errors.educationSecondaryLevelType && (
                    <span className="text-red-500 text-sm mt-1">{errors.educationSecondaryLevelType.message}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* اسم الطالب */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>اسم الطالب</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("studentId")}
                disabled={!selectedSemester || studentsLoading}
              >
                <option value="">اختر اسم الطالب</option>
                {Students.map((student) => (
                  <option key={student.Id || student.id} value={student.Id || student.id}>
                    {student.FullName}
                  </option>
                ))}
              </select>
              {errors.studentId && (
                <span className="text-red-500 text-sm mt-1">{errors.studentId.message}</span>
              )}
            </div>

            {/* البلدية - New Field */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>البلدية</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("baladiaId")}
                disabled={baladiasLoading}
              >
                <option value="">اختر البلدية</option>
                {Baladias.map((baladia) => (
                  <option key={baladia.Id} value={baladia.Id}>
                    {baladia.FullName}
                  </option>
                ))}
              </select>
              {errors.baladiaId && (
                <span className="text-red-500 text-sm mt-1">{errors.baladiaId.message}</span>
              )}
            </div>

            {/* المكتب */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>المكتب</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("baladiaOfficeId")}
                disabled={!selectedBaladia || baladiaOfficeLoading}
              >
                <option value="">اختر المكتب</option>
                {BaldiaOffice.map((office) => (
                  <option key={office.Id} value={office.Id}>
                    {office.Description || office.OfficeName}
                  </option>
                ))}
              </select>
              {errors.baladiaOfficeId && (
                <span className="text-red-500 text-sm mt-1">{errors.baladiaOfficeId.message}</span>
              )}
            </div>

            {/* المدرسة المراد الانتقال لها */}
            <div className='flex flex-col'>
              <label className='mb-1 font-semibold'>المدرسة المراد الانتقال لها</label>
              <select
                className='border border-gray-300 rounded px-3 py-2'
                {...register("targetSchoolId")}
                onChange={(e) => handleSchoolChange(e.target.value)}
                disabled={!watchBaladiaOfficeId || schoolsByOfficeLoading}
              >
                <option value="">اختر المدرسة</option>
                {filteredSchools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.School_FullName}
                  </option>
                ))}
              </select>
              {errors.targetSchoolId && (
                <span className="text-red-500 text-sm mt-1">{errors.targetSchoolId.message}</span>
              )}
            </div>

            {/* سيرة و السلوك - ملفات uploader */}
            <div className='flex flex-col md:col-span-2'>
              <label className='mb-1 font-semibold'>سيرة و السلوك</label>
              <div className='flex items-center gap-6'>
                <button
                  type="button"
                  className='flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2'
                  onClick={() => document.getElementById('behavior-file').click()}
                >
                  <Paperclip />
                  تحميل سيرة و السلوك
                </button>
                <input
                  id="behavior-file"
                  type="file"
                  hidden
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                />
                
                {/* Display uploaded file */}
                {behaviorFile && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2 border border-green-500 rounded-lg py-1.5 px-6 flex items-center justify-between bg-green-50 flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip size={16} className="text-green-600" />
                      <span className="text-sm text-green-700 font-medium truncate max-w-[200px]">
                        {behaviorFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                )}
              </div>
              {errors.behaviorFileId && (
                <span className="text-red-500 text-sm mt-1">{errors.behaviorFileId.message}</span>
              )}
            </div>

            {/* السبب - text area */}
            <div className='flex flex-col md:col-span-2'>
              <label className='mb-1 font-semibold'>السبب</label>
              <textarea
                className='border border-gray-300 rounded px-3 py-2 h-32 resize-none'
                placeholder="اكتب سبب النقل هنا..."
                {...register("reason")}
              />
              {errors.reason && (
                <span className="text-red-500 text-sm mt-1">{errors.reason.message}</span>
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
              إضافة نقل
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTransfer