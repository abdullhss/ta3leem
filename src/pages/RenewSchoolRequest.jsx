import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import useSchools from '../hooks/schools/useSchools'
import { DoTransaction } from '../services/apiServices'
import { useSelector } from 'react-redux'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const RenewSchoolRequest = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({ mode: 'onChange' })
  
  const navigate = useNavigate()
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
  
  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      const response = await DoTransaction(
        "Jf6ubvBmZQ4bzGJbt/ux9edm/YG1+BQ0qmTwv4U3uy8=",
        `0#${data.schoolId}#${"default"}#${userData.Id}#${educationYearData.Id}#0#0#default#0#0#default###0#0#default#`,
        0,
        "Id#School_Id#RequestDate#RequestBy#EducationYear_Id#InitialApproveStatus#InitialApproveBy#InitialApproveDate#FinalApproveStatus#FinalApproveBy#FinalApproveDate#InitialApproveRemarks#FinalApproveRemarks#MainApproveStatus#MainApproveBy#MainApproveDate#MainApproveRemarks"
      );
      if(response.success == 200){
        toast.success('تم إرسال طلب التجديد بنجاح')
        navigate("/requests/renewal")
      }
      else{
        toast.error(response.errorMessage)
      }
    } catch (error) {
      console.error('Submission failed:', error)
      toast.error('فشل في إرسال طلب التجديد')
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
            تقديم طلبات التجديد
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
              {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default RenewSchoolRequest