import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import useSchools from '../hooks/schools/useSchools'
import { DoTransaction } from '../services/apiServices'
import { useSelector } from 'react-redux'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const VisitRequest = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid }
  } = useForm()
  
  const navigate = useNavigate()
  const location = useLocation()
  const { visitRequest, action = 0 } = location.state || {}
  const isEditMode = action === 1
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userData = useSelector((state) => state.auth.userData)
  const educationYearData = useSelector((state) => state.auth.educationYearData)
  // Fetch schools
  const { schools, loading } = useSchools(
    -1,  // statusId
    "",  // searchText
    1,   // startNumber
    10000, // rowsPerPage
    "Exist" // schoolType
  )
  
  useEffect(() => {
    if (isEditMode && visitRequest) {
      setValue('schoolId', visitRequest.School_Id)
      setValue('reason', visitRequest.Reason || visitRequest.reason || '')
    }
  }, [isEditMode, visitRequest, setValue])
  
  // Handle form submission
  const onSubmit = async (data) => {
    const requestId = isEditMode && visitRequest?.id ? visitRequest.id : 0
    const columnsValues = `${requestId}#${data.schoolId}#${data.reason}#${"default"}#${userData.Id}#${educationYearData.Id}#0#0#default#0#0#default##`
    const response = await DoTransaction(
      "0wIGNXjA6Ttti4KZHVApAe4w6uMqn+cmKe+S1I64XGE=",
      columnsValues,
      isEditMode ? 1 : 0,
      "Id#School_Id#Reason#RequestDate#RequestBy#EducationYear_Id#InitialApproveStatus#InitialApproveBy#InitialApproveDate#FinalApproveStatus#FinalApproveBy#FinalApproveDate#InitialApproveRemarks#FinalApproveRemarks"
    );
    if(response.success == 200){
      toast.success(isEditMode ? 'تم تحديث طلب الزيارة بنجاح' : 'تم إرسال طلب الزيارة بنجاح')
      navigate("/requests/visit")
    }
    else{
      toast.error(response.errorMessage)
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
            {isEditMode ? 'تعديل طلب الزيارة' : 'طلب زيارة'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* المدرسة */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">المدرسة</label>
              <select
                {...register('schoolId', { required: 'هذا الحقل مطلوب' })}
                className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A]"
                disabled={loading}
              >
                <option value="">اختر المدرسة</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.School_FullName}
                  </option>
                ))}
              </select>
              {errors.schoolId && (
                <p className="text-red-500 text-sm mt-1">{errors.schoolId.message}</p>
              )}
              {loading && (
                <p className="text-gray-500 text-sm mt-1">جاري تحميل المدارس...</p>
              )}
            </div>
            
            {/* السبب */}
            <div className="flex flex-col gap-2">
              <label className="font-medium">السبب</label>
              <textarea
                {...register('reason', { 
                  required: 'هذا الحقل مطلوب',
                  minLength: {
                    value: 10,
                    message: 'يجب أن يكون السبب على الأقل 10 أحرف'
                  }
                })}
                rows={6}
                placeholder="اكتب سبب طلب الزيارة هنا..."
                className="border rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] resize-none"
              />
              {errors.reason && (
                <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
              )}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-4 mt-4">
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
              {isSubmitting ? 'جاري الإرسال...' : (isEditMode ? 'حفظ التعديلات' : 'إرسال الطلب')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default VisitRequest