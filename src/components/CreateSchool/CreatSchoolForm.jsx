// CreatSchoolForm.jsx (updated)
import { ChevronRight, Paperclip, X, MapPin } from 'lucide-react'
import React, { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from "framer-motion"
import useUploadFiles from '../../hooks/useUploadFiles'
import { Button } from '../../ui/button'
import useBaladia from '../../hooks/useBaladia'
import useBaldiaOffice from '../../hooks/useBaldiaOffice'
import MapPicker from '../../components/MapPicker'
import { DoTransaction, executeProcedure } from '../../services/apiServices'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { ConfirmModal } from '../../global/global-modal/ConfirmModal'

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const CreatSchoolForm = ({schoolType , setSchoolType, schoolData = null, action = 0}) => {
  const siteImagesRef = useRef(null)
  const neighborsApprovalRef = useRef(null)

  const [uploadedFiles, setUploadedFiles] = useState({
    siteImages: null,
    neighborsApproval: null,
  })
  const navigate = useNavigate() ; 
  const [selectedBaladiaId, setSelectedBaladiaId] = useState(null)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Determine the actual action: 0 = add, 1 = edit, 2 = delete
  const wantedAction = action || (schoolData ? 1 : 0)
  const isEditMode = wantedAction === 1
  const isDeleteMode = wantedAction === 2

  const userData = useSelector((state) => state.auth.userData);
  console.log(userData);
  
  const {Baladias, loading: baladiasLoading} = useBaladia() ;
  const {BaldiaOffice} = useBaldiaOffice(selectedBaladiaId);
  
  const { uploadSingleFile } = useUploadFiles()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()
  
  useEffect(() => {
    if (userData) {
      setValue("delegateName", userData.FullName, { shouldValidate: true })
      setValue("companyName", userData.CompanyName, { shouldValidate: true })
    }
  }, [userData, setValue])

  // Pre-populate form when editing
  useEffect(() => {
    if (schoolData && isEditMode && !baladiasLoading && Baladias && Baladias.length > 0) {
      // Set basic fields
      setValue("schoolName", schoolData.School_FullName || schoolData.FullName || "", { shouldValidate: true })
      
      // Set municipality - handle both Baldia_Id and BaldiaId
      const baladiaId = schoolData.Baldia_Id || schoolData.BaldiaId
      if (baladiaId) {
        // Ensure type consistency - convert to number if Baladias use number IDs
        const baladiaIdNum = typeof Baladias[0]?.Id === 'number' ? Number(baladiaId) : baladiaId.toString()
        const baladiaIdStr = baladiaIdNum.toString()
        
        // Verify the baladia exists in the list
        const baladiaExists = Baladias.some(b => b.Id.toString() === baladiaIdStr || b.Id === baladiaIdNum)
        if (baladiaExists) {
          setValue("municipality", baladiaIdStr, { shouldValidate: true })
          setSelectedBaladiaId(baladiaIdStr)
        }
      }
      
      // Set location
      const lat = schoolData.latitude || schoolData.Latitude
      const lng = schoolData.longitude || schoolData.Longitude
      if (lat && lng) {
        const location = {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }
        setSelectedLocation(location)
        setValue("latitude", location.lat, { shouldValidate: true })
        setValue("longitude", location.lng, { shouldValidate: true })
      }
      
      // Set file IDs (if they exist) - handle different field name variations
      const locationPictureAttach = schoolData.LocationPictureAttach || schoolData.locationPictureAttach
      if (locationPictureAttach) {
        setValue("siteImagesFileId", locationPictureAttach, { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          siteImages: {
            id: locationPictureAttach,
            name: "صورة الموقع المرفقة",
            type: "siteImages"
          }
        }))
      }
      
      const neighborsApproveAttach = schoolData.neighborsApproveAttach || schoolData.NeighborsApproveAttach
      if (neighborsApproveAttach) {
        setValue("neighborsApprovalFileId", neighborsApproveAttach, { shouldValidate: true })
        setUploadedFiles(prev => ({
          ...prev,
          neighborsApproval: {
            id: neighborsApproveAttach,
            name: "موافقة الجيران المرفقة",
            type: "neighborsApproval"
          }
        }))
      }
      
      // Set notes if available
      if (schoolData.notes || schoolData.Notes) {
        setValue("notes", schoolData.notes || schoolData.Notes, { shouldValidate: false })
      }
    }
  }, [schoolData, isEditMode, setValue, baladiasLoading, Baladias])

  // Set office after municipality and offices are loaded
  useEffect(() => {
    if (schoolData && isEditMode && selectedBaladiaId && BaldiaOffice && BaldiaOffice.length > 0) {
      const officeId = schoolData.Office_Id || schoolData.OfficeId
      if (officeId) {
        // Ensure type consistency
        const officeIdNum = typeof BaldiaOffice[0]?.Id === 'number' ? Number(officeId) : officeId.toString()
        const officeIdStr = officeIdNum.toString()
        
        // Verify the office exists in the list
        const officeExists = BaldiaOffice.some(o => o.Id.toString() === officeIdStr || o.Id === officeIdNum)
        if (officeExists) {
          setValue("office", officeIdStr, { shouldValidate: true })
        }
      }
    }
  }, [schoolData, isEditMode, selectedBaladiaId, BaldiaOffice, setValue])


  // Watch for municipality changes to update offices
  const selectedMunicipality = watch("municipality")

  // Update selectedBaladiaId when municipality changes
  useEffect(() => {
    if (selectedMunicipality) {
      setSelectedBaladiaId(selectedMunicipality)
    } else {
      setSelectedBaladiaId(null)
    }
    
    // Reset office when municipality changes
    setValue("office", "")
  }, [selectedMunicipality, setValue])

  // Set form values when location is selected
  useEffect(() => {
    if (selectedLocation) {
      setValue("latitude", selectedLocation.lat)
      setValue("longitude", selectedLocation.lng)
    }
  }, [selectedLocation, setValue])

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
    console.log("Location selected:", location)
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

  // Handle delete action
  const handleDelete = async () => {
    if (!schoolData || (!schoolData.id && !schoolData.Id)) {
      toast.error("لا يمكن حذف المدرسة: بيانات غير صحيحة")
      return
    }

    const schoolId = schoolData.id || schoolData.Id
    
    // For delete, we need to send minimal data with the school ID
    // The first parameter in the data string is the ID
    const response = await DoTransaction(
      "dsaK2RNVIQXmf0/QbiS0Hg==",
      `${schoolId}`,
      2, // wanted action 2 = delete
      "Id"
    )
    
    console.log(response);
    if(response.success != 200){
      toast.error(response.errorMessage || "فشل حذف المدرسة")
    } else {
      toast.success("تم حذف المدرسة بنجاح")
      setShowDeleteModal(false)
      // Navigate back or refresh
      if (setSchoolType) {
        setSchoolType(null)
      }
      navigate(-1)
    }
  }

  const onSubmit = async (data) => {
    // If delete mode, show confirmation modal
    if (isDeleteMode) {
      setShowDeleteModal(true)
      return
    }

    // Get school ID for edit mode, 0 for add mode - handle both id and Id
    const schoolId = (isEditMode && schoolData) ? (schoolData.id || schoolData.Id || 0) : 0
    
    // Create the complete data object
    const formData = {
      // Form fields
      ...data,
      
      // School type
      schoolType: schoolType,
      
      // Location
      location: selectedLocation,
      
      // File attachments with their IDs
      attachments: uploadedFiles,
      
      // Selected municipality name (for display)
      municipalityName: selectedMunicipality 
        ? Baladias?.find(b => b.Id.toString() === selectedMunicipality)?.FullName 
        : null,
      
      // Selected office name (for display)
      officeName: data.office && BaldiaOffice 
        ? BaldiaOffice.find(o => o.Id.toString() === data.office)?.OfficeName 
        : null,
    }
    
    const response = await DoTransaction(
      "dsaK2RNVIQXmf0/QbiS0Hg==",
      `${schoolId}#${data.schoolName}#${userData.Id}#${data.latitude}#${data.longitude}#${selectedBaladiaId}#${data.office}#${data.siteImagesFileId || 0}#${data.neighborsApprovalFileId || 0}#${schoolType}#0#${schoolType=="New"?4:1}###0##0#0#0##0`,
      wantedAction, // wanted action 0 add , 1 edit , 2 delete
      "Id#FullName#Mofwad_Id#latitude#longitude#Baldia_Id#Office_Id#LocationPictureAttach#neighborsApproveAttach#NewOrExist#SchoolManager_Id#SchoolStatus_Id#UniqueId#EducationLevel_Ids#SchoolGenderType_Id#EducationClass_Ids#EducationPeriod_Id#BuildingType_Id#BuildingAllowance_Id#Labor_Ids#BuildingOwnAttach"
    )
    
    console.log(response);
    if(response.success != 200){
      toast.error(response.errorMessage || "فشل العملية")
    } else {
      const successMessage = isEditMode ? "تم تعديل المدرسة بنجاح" : "تم اضافة المدرسة بنجاح"
      toast.success(successMessage)
      // Navigate back after successful edit
      if (isEditMode && setSchoolType) {
        setSchoolType(null)
      }
    }
  }

  return (
    <div className='flex flex-col gap-6 w-full'>
      <MapPicker
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onLocationSelect={handleLocationSelect}
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ConfirmModal
              desc={`هل أنت متأكد من حذف المدرسة "${schoolData?.School_FullName || schoolData?.FullName || schoolData?.schoolName || 'هذه المدرسة'}"؟`}
              confirmFunc={handleDelete}
              onClose={() => setShowDeleteModal(false)}
            />
          </div>
        </div>
      )}

      <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
        <span className="bg-black rounded-md flex-shrink-0" onClick={()=>{navigate(-1)}}>
          <ChevronRight className="text-white cursor-pointer" height={20} width={20}/>
        </span>
        <h1 className="text-lg md:text-xl">
          {isDeleteMode 
            ? "حذف المدرسة" 
            : isEditMode 
              ? (schoolType == "Exist" ? "تعديل مدرسة قائمة" : "تعديل مدرسة جديدة")
              : (schoolType == "Exist" ? "مدرسة قائمة" : "مدرسة جديدة")
          }
        </h1>
      </div>

      {!isDeleteMode && (
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
          {/* Hidden location fields */}
          <input type="hidden" {...register("latitude", { required: true })} />
          <input type="hidden" {...register("longitude", { required: true })} />

          {/* اسم المفوض */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">اسم المفوض</label>
            <input
              type="text"
              className="border border-gray-300 bg-gray-200 rounded px-3 py-2"
              placeholder="ادخل اسم المفوض"
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
              placeholder="ادخل اسم الشركة"
              readOnly
              {...register("companyName", { required: true })}
            />
            {errors.companyName && <span className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</span>}
          </div>

          {/* اسم المدرسة */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">اسم المدرسة</label>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2"
              placeholder="ادخل اسم المدرسة"
              {...register("schoolName", { required: true })}
            />
            {errors.schoolName && <span className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</span>}
          </div>

          {/* موقع المدرسة */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">موقع المدرسة المقترحة</label>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className="flex items-center justify-center gap-2 bg-[#BE8D4A] text-white py-2 rounded font-semibold hover:bg-[#a67a3f] transition-colors"
              >
                <MapPin size={18} />
                تحديد موقع المدرسة
              </button>
              {(errors.latitude || errors.longitude) && (
                <span className="text-red-500 text-sm">
                  يرجى تحديد موقع المدرسة على الخريطة
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
                    <span className="font-medium">الموقع المحدد:</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <div>خط العرض: {selectedLocation.lat.toFixed(6)}</div>
                    <div>خط الطول: {selectedLocation.lng.toFixed(6)}</div>
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
                  انقر على الزر أعلاه لتحديد موقع المدرسة على الخريطة
                </p>
              )}
            </div>
          </div>

          {/* البلدية */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">البلدية</label>
            <select
              className="border border-gray-300 rounded px-3 py-2"
              {...register("municipality", { required: true })}
            >
              <option value="">اختر البلدية</option>
              {Baladias?.map((baladia) => (
                <option key={baladia.Id} value={baladia.Id.toString()}>
                  {baladia.FullName}
                </option>
              ))}
            </select>
            {errors.municipality && <span className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</span>}
          </div>

          {/* المكتب */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">المكتب</label>
            <select
              className="border border-gray-300 rounded px-3 py-2"
              {...register("office", { required: true })}
              disabled={!selectedMunicipality}
            >
              <option value="">اختر المكتب</option>
              {selectedMunicipality && BaldiaOffice?.map((office) => (
                <option key={office.Id} value={office.Id.toString()}>
                  {office.OfficeName}
                </option>
              ))}
            </select>
            {errors.office && <span className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</span>}
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
                  {errors.siteImagesFileId && (
                    <span className="text-red-500 text-sm mt-1">
                      رفع صور الموقع مطلوب
                    </span>
                  )}

                  <FileDisplay file={uploadedFiles.siteImages} />
                </div>
                <input
                  type="file"
                  hidden
                  {...register("siteImagesFileId", { required: true })}
                  ref={siteImagesRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "siteImages")}
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
                  {errors.neighborsApprovalFileId && (
                    <span className="text-red-500 text-sm mt-1">
                      رفع موافقة الجيران مطلوب
                    </span>
                  )}

                  <FileDisplay file={uploadedFiles.neighborsApproval} />
                </div>
                <input
                  type="file"
                  hidden
                  {...register("neighborsApprovalFileId", { required: true })}
                  ref={neighborsApprovalRef}
                  onChange={(e) => handleFileUpload(e.target.files[0], "neighborsApproval")}
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
      )}

      {isDeleteMode && (
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-6 p-4 md:p-6 bg-white rounded-md"
        >
          <div className="text-center py-8">
            <p className="text-lg text-gray-700 mb-4">
              هل أنت متأكد من حذف المدرسة <strong>"{schoolData?.School_FullName || schoolData?.FullName || schoolData?.schoolName || 'هذه المدرسة'}"</strong>؟
            </p>
            <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col items-center font-bold gap-6 p-4 md:p-6 bg-white rounded-md">
        {!isDeleteMode && (
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="bg-[#BE8D4A] text-white px-6 py-4 rounded font-semibold hover:bg-[#a67a3f] transition-colors w-full"
          >
            {isEditMode ? "حفظ التعديلات" : "حفظ المدرسة"}
          </Button>
        )}
        
        {isDeleteMode && (
          <div className="flex gap-4 w-full">
            <Button
              type="button"
              onClick={() => {
                if (setSchoolType) setSchoolType(null)
                navigate(-1)
              }}
              className="px-6 py-4 rounded font-semibold w-1/2 border border-gray-500 bg-transparent text-gray-700 hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-4 rounded font-semibold w-1/2 bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              حذف المدرسة
            </Button>
          </div>
        )}
        {!isDeleteMode && !isEditMode && (
          <div className='flex items-center justify-between w-full gap-12'>
            <Button
              type="button"
              onClick={() => {
                if (setSchoolType) setSchoolType(null)
                navigate(-1)
              }}
              className="px-6 py-4 rounded font-semibold w-1/4 border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              إلغاء
            </Button>

            <Button
              type="button"
              onClick={()=>{navigate("/requests/add-manger")}}
              className="bg-[#BE8D4A] text-white px-6 py-4 rounded font-semibold hover:bg-[#a67a3f] transition-colors w-1/4"
            >
              إضافة مدير
            </Button>

            <Button
              type="button"
              className="bg-[#BE8D4A] text-white px-6 py-4 rounded font-semibold hover:bg-[#a67a3f] transition-colors w-1/4"
            >
              إضافة مسوغات
            </Button>

            <Button
              type="button"
              className="bg-[#BE8D4A] text-white px-6 py-4 rounded font-semibold hover:bg-[#a67a3f] transition-colors w-1/4"
            >
              إرسال الطلب 
            </Button>
          </div>
        )}
        
        {isEditMode && (
          <div className='flex items-center justify-between w-full gap-12'>
            <Button
              type="button"
              onClick={() => {
                if (setSchoolType) setSchoolType(null)
                navigate(-1)
              }}
              className="px-6 py-4 rounded font-semibold w-1/2 border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              إلغاء
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatSchoolForm