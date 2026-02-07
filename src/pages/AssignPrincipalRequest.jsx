import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import useSchoolNewManagers from '../hooks/Mofwad/useSchoolNewManagers'
import { DoTransaction } from '../services/apiServices'
import useSchools from '@/hooks/schools/useSchools' 
import useMangers from '@/hooks/manger/useMangers'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function AssignPrincipalRequest() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      schoolManagerId: '',
      schoolId: '',
      reason: ''
    }
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { assignPrincipalRequest, action = 0 } = location.state || {}
  const isEditMode = action === 1

  const [isSubmitting, setIsSubmitting] = useState(false)

  const userData = useSelector((state) => state.auth.userData)
  const educationYearData = useSelector((state) => state.auth.educationYearData)

  const { Managers: SchoolNewManagers, loading, error: mangersError } = useMangers(userData?.Id, 1, '', 1, 10000)
  const { schools, loading: schoolsLoading } = useSchools(-1, '', 1, 10000, 'All')

  const selectedSchoolId = watch('schoolId')
  const selectedManagerId = watch('schoolManagerId')
  const reason = watch('reason')

  const selectedManager = SchoolNewManagers?.find(
    (manager) => manager.id.toString() === selectedManagerId
  )

  useEffect(() => {
    if (isEditMode && assignPrincipalRequest) {
      setValue('schoolId', assignPrincipalRequest.School_Id?.toString() ?? '')
      setValue('schoolManagerId', assignPrincipalRequest.newSchoolManager_Id?.toString() ?? '')
      setValue('reason', assignPrincipalRequest.Reason || '')
    }
  }, [isEditMode, assignPrincipalRequest, setValue])

  const onSubmit = async (data) => {
    if (!selectedManager) {
      toast.error('يرجى اختيار مدير مدرسة')
      return
    }

    if (!data.reason || data.reason.trim() === '') {
      toast.error('يرجى كتابة سبب التكليف')
      return
    }

    setIsSubmitting(true)

    try {
      const requestId = isEditMode && assignPrincipalRequest?.id ? assignPrincipalRequest.id : 0
      const columnsValues = `${requestId}#${selectedSchoolId}#${selectedManagerId}#${data.reason}#${'default'}#${userData.Id}#${educationYearData.Id}#0#0#default#0`

      const response = await DoTransaction(
        'qYqLP6vzFFsEjpCmMpa4eLw4RlAPm7M1iuVVgEnI3zs=',
        columnsValues,
        isEditMode ? 1 : 0,
        'Id#School_Id#SchoolManager_Id#Reason#RequestDate#RequestBy#EducationYear_Id#ApproveStatus#ApproveBy#ApproveDate#ApproveRemarks'
      )

      if (response.success == 200) {
        toast.success(isEditMode ? 'تم تحديث طلب التكليف بنجاح' : 'تم إرسال طلب التكليف بنجاح')
        navigate(isEditMode ? '/requests/assign-principal-requests' : '/requests/assignments')
      } else {
        toast.error(response.errorMessage || 'حدث خطأ أثناء إرسال الطلب')
      }
    } catch (error) {
      toast.error('حدث خطأ غير متوقع')
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="p-6 flex flex-col gap-6 w-full">
      {/* Form */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-lg shadow"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <h1 className="text-lg font-bold">
            {isEditMode ? 'تعديل طلب تكليف مدير مدرسة' : 'طلب تكليف مدير مدرسة جديد'}
          </h1>
          
          {/* View Only Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* اسم المفوض */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">اسم المفوض</label>
              <div className="border rounded-md p-3 bg-gray-50 text-gray-700 min-h-[44px]">
                {userData?.FullName || 'غير محدد'}
              </div>
            </div>
            
            {/* اسم الشركة */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">اسم الشركة</label>
              <div className="border rounded-md p-3 bg-gray-50 text-gray-700 min-h-[44px]">
                {userData?.CompanyName || 'غير محدد'}
              </div>
            </div>
          </div>
          
          {/* Horizontal Line */}
          <hr className="border-t border-[#C0C0C0] my-2" />
          
          {/* Selection Section */}
          <div>
            <h2 className="text-lg font-semibold mb-4">
              برجاء اختيار مدير مدرسة غير مكلف
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* School Selection */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">اختر المدرسة</label>
                <select
                  {...register('schoolId')}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                  disabled={schoolsLoading}
                >
                  <option value="">جميع المدارس</option>
                  {schools?.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.School_FullName}
                    </option>
                  ))}
                </select>
                
                {schoolsLoading && (
                  <p className="text-gray-500 text-sm mt-1">جاري تحميل قائمة المدارس...</p>
                )}
                
                {!schoolsLoading && schools?.length === 0 && (
                  <p className="text-gray-500 text-sm mt-1">لا توجد مدارس متاحة</p>
                )}
              </div>

            
              {/* Manager Selection */}
              <div className="flex flex-col gap-2">
                <label className="font-medium">مدير مدرسة</label>
                <select
                  {...register('schoolManagerId', { 
                    required: 'هذا الحقل مطلوب',
                    validate: value => value !== '' || 'يرجى اختيار مدير مدرسة'
                  })}
                  className="border rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                  disabled={loading}
                >
                  <option value="">اختر مدير مدرسة</option>
                  {SchoolNewManagers?.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.FullName}
                    </option>
                  ))}
                </select>
                
                {errors.schoolManagerId && (
                  <p className="text-red-500 text-sm mt-1">{errors.schoolManagerId.message}</p>
                )}
                
                {loading && (
                  <p className="text-gray-500 text-sm mt-1">جاري تحميل البيانات...</p>
                )}
                
                {mangersError && (
                  <p className="text-red-500 text-sm mt-1">حدث خطأ في تحميل البيانات</p>
                )}
                
                {!loading && SchoolNewManagers.length === 0 && (
                  <p className="text-gray-500 text-sm mt-1">
                    {selectedSchoolId 
                      ? 'لا توجد مديرين غير مكلفين في هذه المدرسة' 
                      : 'لا توجد بيانات متاحة'}
                  </p>
                )}
              </div>
            </div>
            
            {/* Reason Text Area */}
            <div className="flex flex-col gap-2 mt-6">
              <label className="font-medium">سبب التكليف</label>
              <textarea
                {...register('reason', { 
                  required: 'هذا الحقل مطلوب',
                  minLength: {
                    value: 10,
                    message: 'يجب أن يكون السبب على الأقل 10 أحرف'
                  },
                  maxLength: {
                    value: 500,
                    message: 'يجب ألا يتجاوز السبب 500 حرف'
                  }
                })}
                className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] min-h-[120px] resize-y"
                placeholder="اكتب سبب التكليف هنا..."
                rows={4}
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
              )}
              <div className="text-gray-500 text-sm">
                عدد الأحرف: {reason?.length || 0}/500
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="border border-red-500 text-red-500 hover:bg-red-50 w-full py-3 rounded-md font-medium transition-colors"
            >
              الغاء
            </button>
            
            <button
              type="submit"
              disabled={!isValid || isSubmitting || loading}
              className={`w-full py-3 rounded-md text-white font-medium transition-colors ${
                isValid && !isSubmitting && !loading
                  ? 'bg-[#BE8D4A] hover:bg-[#a87a3f]' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}