import { ChevronRight, Paperclip, X, MapPin, Building } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from "framer-motion"
import useUploadFiles from '../hooks/useUploadFiles'
import { Button } from '../ui/button'
import useBaladia from '../hooks/useBaladia'
import useBaldiaOffice from '../hooks/useBaldiaOffice'
import MapPicker from '../components/MapPicker'
import FileViewer from '../components/FileViewer'
import { DoTransaction } from '../services/apiServices'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useNavigate, useLocation } from 'react-router-dom'
import useSchools from '../hooks/schools/useSchools'
// import useSchools from '../../hooks/useSchools'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const TransferSchoolRequest = () => {
  const siteImagesRef = useRef(null)
  const neighborsApprovalRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { transferRequest, action = 0 } = location.state || {}
  const isEditMode = action === 1
  
  const [uploadedFiles, setUploadedFiles] = useState({
    siteImages: null,
    neighborsApproval: null,
  })
  
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState(null)
  
  const userData = useSelector((state) => state.auth.userData)
  
  const { Baladias, loading: baladiasLoading } = useBaladia()
  const { BaldiaOffice } = useBaldiaOffice(selectedSchool?.Baldia_Id || selectedSchool?.BaldiaId)
  const { schools, loading: schoolsLoading } = useSchools(-1, "", 1, 10000, "Exist")
  const { uploadSingleFile } = useUploadFiles()
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  // Set user data when component loads
  useEffect(() => {
    if (userData) {
      setValue("delegateName", userData.FullName, { shouldValidate: true })
      setValue("companyName", userData.CompanyName, { shouldValidate: true })
    }
  }, [userData, setValue])

  // When school is selected, populate municipality and office
  useEffect(() => {
    if (selectedSchool) {
      // Set municipality preview (read-only)
      const municipalityName = Baladias?.find(b => 
        b.Id.toString() === (selectedSchool.Baldia_Id || selectedSchool.BaldiaId)?.toString()
      )?.FullName || selectedSchool.MunicipalityName
      
      setValue("municipalityPreview", municipalityName, { shouldValidate: true })
      
      // Set office preview (read-only)
      if (BaldiaOffice && selectedSchool.Office_Id) {
        const officeName = BaldiaOffice.find(o => 
          o.Id.toString() === selectedSchool.Office_Id?.toString()
        )?.OfficeName || selectedSchool.OfficeName
        
        setValue("officePreview", officeName, { shouldValidate: true })
      }
      
      // Set school name in hidden field for submission
      setValue("schoolId", selectedSchool.Id || selectedSchool.id, { shouldValidate: true })
      setValue("schoolName", selectedSchool.School_FullName || selectedSchool.FullName, { shouldValidate: true })
    }
  }, [selectedSchool, Baladias, BaldiaOffice, setValue])

  // Set form values when location is selected
  useEffect(() => {
    if (selectedLocation) {
      setValue("latitude", selectedLocation.lat)
      setValue("longitude", selectedLocation.lng)
    }
  }, [selectedLocation, setValue])

  // Prefill form when editing – pass data and preview for editing
  useEffect(() => {
    if (!isEditMode || !transferRequest) return
    const lat = transferRequest.Request_latitude ?? transferRequest.latitude
    const lng = transferRequest.Request_longitude ?? transferRequest.longitude

    setValue("schoolId", transferRequest.School_Id)
    setValue("latitude", lat)
    setValue("longitude", lng)
    setValue("schoolName", transferRequest.School_FullName || "")
    setValue("delegateName", userData?.FullName || "")
    setValue("companyName", userData?.CompanyName || "")

    if (lat != null && lng != null) {
      setSelectedLocation({ lat, lng })
    }

    if (schools?.length) {
      const school = schools.find(s => (s.id || s.Id)?.toString() === String(transferRequest.School_Id))
      if (school) {
        setSelectedSchool(school)
        setValue("schoolSelect", (school.id ?? school.Id)?.toString())
      } else {
        setValue("schoolSelect", String(transferRequest.School_Id))
      }
    }

    // Prefill existing attachments so they are shown and editable
    const locationAttach = transferRequest.LocationPictureAttach ?? transferRequest.locationPictureAttach
    const neighborsAttach = transferRequest.neighborsApproveAttch ?? transferRequest.neighborsApproveAttach ?? transferRequest.NeighborsApproveAttach
    if (locationAttach && locationAttach !== 0) {
      setValue("siteImagesFileId", locationAttach, { shouldValidate: true })
      setUploadedFiles(prev => ({
        ...prev,
        siteImages: { id: locationAttach, name: "مرفق صور الموقع الحالي", type: "siteImages" }
      }))
    }
    if (neighborsAttach && neighborsAttach !== 0) {
      setValue("neighborsApprovalFileId", neighborsAttach, { shouldValidate: true })
      setUploadedFiles(prev => ({
        ...prev,
        neighborsApproval: { id: neighborsAttach, name: "مرفق موافقة الجيران الحالي", type: "neighborsApproval" }
      }))
    }
  }, [isEditMode, transferRequest, schools, setValue, userData])

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

        if (type === "siteImages") {
          setValue("siteImagesFileId", fileId, { shouldValidate: true })
        }

        if (type === "neighborsApproval") {
          setValue("neighborsApprovalFileId", fileId, { shouldValidate: true })
        }
      }
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("فشل في رفع الملف")
    }
  }

  const removeFile = (type) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: null
    }))

    if (type === "siteImages") {
      setValue("siteImagesFileId", null, { shouldValidate: true })
    }

    if (type === "neighborsApproval") {
      setValue("neighborsApprovalFileId", null, { shouldValidate: true })
    }
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
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
    try {
      const requestId = isEditMode && transferRequest?.id ? transferRequest.id : 0
      const siteImagesId = data.siteImagesFileId || (isEditMode && (transferRequest?.LocationPictureAttach ?? transferRequest?.locationPictureAttach)) || 0
      const neighborsId = data.neighborsApprovalFileId || (isEditMode && (transferRequest?.neighborsApproveAttch ?? transferRequest?.neighborsApproveAttach ?? transferRequest?.NeighborsApproveAttach)) || 0
      const columnsValues = `${requestId}#${data.schoolId || 0}#${data.latitude || 0}#${data.longitude || 0}#${selectedSchool ? (selectedSchool.Baldia_Id || selectedSchool.BaldiaId || 0) : 0}#${siteImagesId}#${neighborsId}#0#0#0#default#${userData?.Id || 0}#0#0#0#default#0#0#default##`
      const response = await DoTransaction(
        "Gpy06t4isIWQFbF36glkdNPH9xRbgbMiBKqH6ViGbKU=",
        columnsValues,
        isEditMode ? 1 : 0, // 1 = edit, 0 = add
        "Id#School_Id#latitude#longitude#Baldia_Id#LocationPictureAttach#neighborsApproveAttch#SanadMelkiaAttach#KorokiDrawAttach#AirMapAttach#RequestDate#RequestBy#EducationYear_Id#InitialApproveStatus#InitialApproveBy#InitialApproveDate#FinalApproveStatus#FinalApproveBy#FinalApproveDate#InitialApproveRemarks#FinalApproveRemarks"
      )
      
      if (response.success === 200) {
        toast.success(isEditMode ? "تم تحديث طلب النقل بنجاح" : "تم تقديم طلب نقل المدرسة بنجاح")
        navigate(isEditMode ? "/transfer-requests" : -1)
      } else {
        toast.error(response.errorMessage || (isEditMode ? "فشل في تحديث الطلب" : "فشل في تقديم طلب نقل المدرسة"))
      }
    } catch (error) {
      console.error("Transfer error:", error)
      toast.error("حدث خطأ في تقديم الطلب")
    }
  }

  return (
    <div className='flex flex-col gap-6 w-full'>
      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
      
      <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
        <span className="bg-black rounded-md flex-shrink-0" onClick={() => navigate(-1)}>
          <ChevronRight className="text-white cursor-pointer" height={20} width={20} />
        </span>
        <h1 className="text-lg md:text-xl">{isEditMode ? 'تعديل طلب النقل' : 'تقديم طلب نقل مدرسة'}</h1>
      </div>

      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6 p-4 md:p-6 bg-white rounded-md"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Hidden fields for form data */}
          <input type="hidden" {...register("schoolId", { required: true })} />
          <input type="hidden" {...register("latitude", { required: true })} />
          <input type="hidden" {...register("longitude", { required: true })} />
          <input type="hidden" {...register("schoolName", { required: true })} />

          {/* اسم المفوض */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">اسم المفوض</label>
            <input
              type="text"
              className="border border-gray-300 bg-gray-200 rounded px-3 py-2"
              placeholder="اسم المفوض"
              readOnly
              {...register("delegateName", { required: true })}
            />
            {errors.delegateName && <span className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</span>}
          </div>

          {/* اسم الشركة */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">اسم الشركة</label>
            <input
              type="text"
              className="border border-gray-300 bg-gray-200 rounded px-3 py-2"
              placeholder="اسم الشركة"
              readOnly
              {...register("companyName", { required: true })}
            />
            {errors.companyName && <span className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</span>}
          </div>

          {/* المدرسة */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="mb-1 font-semibold">المدرسة</label>
            <div className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2">
              <Building size={18} className="text-gray-500" />
              <select
                className="flex-1 bg-transparent border-none outline-none"
                {...register("schoolSelect", { required: true })}
                onChange={(e) => {
                  const schoolId = e.target.value
                  const school = schools.find(s => s.id.toString() === schoolId)
                  setSelectedSchool(school)
                }}
              >
                <option value="">اختر المدرسة</option>
                {schoolsLoading ? (
                  <option value="" disabled>جاري تحميل المدارس...</option>
                ) : (
                  schools.map((school) => (
                    <option key={school.id} value={school.id.toString()}>
                      {school.School_FullName || school.FullName}
                    </option>
                  ))
                )}
              </select>
            </div>
            {errors.schoolSelect && <span className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</span>}
            
            {/* Display selected school details */}
            {/* {selectedSchool && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 border border-green-200 rounded-lg bg-green-50"
              >
                <div className="text-sm text-gray-700">
                  <div className="font-medium mb-1">تفاصيل المدرسة المختارة:</div>
                  <div><span className="font-semibold">الاسم:</span> {selectedSchool.School_FullName || selectedSchool.FullName}</div>
                  <div><span className="font-semibold">الكود:</span> {selectedSchool.Code || selectedSchool.SchoolCode}</div>
                </div>
              </motion.div>
            )} */}
          </div>

          {/* موقع المدرسة الجديد */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="mb-1 font-semibold">موقع المدرسة الجديد</label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white py-2 rounded font-semibold hover:bg-[#a67a3f] transition-colors"
              >
                <MapPin size={18} />
                تحديد موقع المدرسة الجديد
              </button>
              {(errors.latitude || errors.longitude) && (
                <span className="text-red-500 text-sm">
                  يرجى تحديد موقع المدرسة الجديد على الخريطة
                </span>
              )}

              {selectedLocation && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-3 border border-green-500 rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-2 text-green-700">
                    <MapPin size={16} />
                    <span className="font-medium">الموقع الجديد المحدد:</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>خط العرض: {selectedLocation.lat}</div>
                    <div>خط الطول: {selectedLocation.lng}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLocation(null)
                      setValue("latitude", "")
                      setValue("longitude", "")
                    }}
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                  >
                    إزالة الموقع
                  </button>
                </motion.div>
              )}
              
              {!selectedLocation && (
                <p className="text-sm text-gray-500 mt-1">
                  انقر على الزر أعلاه لتحديد موقع المدرسة الجديد على الخريطة
                </p>
              )}
            </div>
          </div>

          {/* البلدية (Preview) */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">البلدية</label>
            <input
              type="text"
              className="border border-gray-300 bg-gray-200 rounded px-3 py-2"
              placeholder="سيتم تعبئته تلقائياً"
              readOnly
              {...register("municipalityPreview")}
            />
            {!selectedSchool && (
              <p className="text-sm text-gray-500 mt-1">اختر مدرسة أولاً</p>
            )}
          </div>

          {/* المكتب (Preview) */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">المكتب</label>
            <input
              type="text"
              className="border border-gray-300 bg-gray-200 rounded px-3 py-2"
              placeholder="سيتم تعبئته تلقائياً"
              readOnly
              {...register("officePreview")}
            />
            {!selectedSchool && (
              <p className="text-sm text-gray-500 mt-1">اختر مدرسة أولاً</p>
            )}
          </div>

          {/* المرفقات */}
          <div className="flex flex-col gap-3 col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg">مرفقات أولية</h3>

            <div className="flex flex-col md:flex-row gap-4">
              {/* تحميل صور الموقع */}
              <div className="flex flex-col w-full md:w-1/2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <button
                    type="button"
                    onClick={() => siteImagesRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2"
                  >
                    <Paperclip />
                    تحميل صور الموقع
                  </button>
                  {!isEditMode && errors.siteImagesFileId && (
                    <span className="text-red-500 text-sm mt-1">
                      رفع صور الموقع مطلوب
                    </span>
                  )}

                  <FileDisplay file={uploadedFiles.siteImages} />
                </div>
                <input
                  type="file"
                  hidden
                  {...register("siteImagesFileId", { required: !isEditMode })}
                  ref={siteImagesRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "siteImages")}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>

              {/* تحميل موافقة الجيران */}
              <div className="flex flex-col w-full md:w-1/2">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <button
                    type="button"
                    onClick={() => neighborsApprovalRef.current.click()}
                    className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white px-4 py-2 rounded mt-1 w-full md:w-1/2"
                  >
                    <Paperclip />
                    تحميل موافقة الجيران
                  </button>
                  {!isEditMode && errors.neighborsApprovalFileId && (
                    <span className="text-red-500 text-sm mt-1">
                      رفع موافقة الجيران مطلوب
                    </span>
                  )}

                  <FileDisplay file={uploadedFiles.neighborsApproval} />
                </div>
                <input
                  type="file"
                  hidden
                  {...register("neighborsApprovalFileId", { required: !isEditMode })}
                  ref={neighborsApprovalRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "neighborsApproval")}
                  accept="image/*,.pdf,.doc,.docx"
                />
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="mb-1 font-semibold">ملاحظات</label>
            <textarea
              rows={4}
              className="border border-gray-300 rounded px-3 py-2 resize-none"
              placeholder="اكتب أي ملاحظات هنا"
              {...register("notes")}
            />
          </div>
        </form>
      </motion.div>

      <div className="flex flex-col items-center font-bold gap-6 p-4 md:p-6 bg-white rounded-md">
        <div className='flex items-center justify-between w-full gap-12'>
          <Button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-4 rounded font-semibold w-full border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            إلغاء
          </Button>

          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={!selectedSchool || !selectedLocation}
            className={`px-6 py-4 rounded font-semibold w-full transition-colors ${
              !selectedSchool || !selectedLocation 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#BE8D4A] hover:bg-[#a67a3f] text-white'
            }`}
          >
            {isEditMode ? 'حفظ التعديلات' : 'تقديم طلب النقل'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TransferSchoolRequest