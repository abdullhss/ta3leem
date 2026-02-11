import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import TablePage from '../../components/TablePage'
import useExamineScheduleDetails from '@/hooks/schools/useExamineScheduleDetails'

const ScheduleDetails = () => {
  const { userData } = useSelector((state) => state.auth)
  const { id, type } = useParams()

  const {
    examineScheduleDetails,
    loading,
    error,
  } = useExamineScheduleDetails(userData.School_Id, id, type)

  const [headerData, setHeaderData] = useState(null)
  const [materials, setMaterials] = useState([])

  useEffect(() => {
    // ✅ Handle both array and single object responses
    let schedule = examineScheduleDetails
    if (Array.isArray(examineScheduleDetails) && examineScheduleDetails.length > 0) {
      schedule = examineScheduleDetails[0] // take first item
    }

    if (schedule) {
      setHeaderData({
        level: schedule.EducationLevel_Description || '-',
        class: schedule.EducationClass_Description || '-',
        examineType: schedule.EducationExamineType_Description || '-',
        period: schedule.EducationPeriod_Description || '-',
        year: schedule.EducationYear_YearDesc || '-',
      })

      const transformedMaterials = (schedule.ExamineScheduleMaterials || []).map((mat, index) => ({
        id: mat.id || index,
        materialName: mat.EducationMaterialName_Description || '-',
        examineDate: mat.ExamineDate
          ? new Date(mat.ExamineDate).toLocaleDateString('ar-EG')
          : '-',
        fromTime: mat.FromTime || '-',
        toTime: mat.ToTime || '-',
        period: mat.ExaminePeriod || '-',
        finalDegree: mat.FinalDegree ?? 0,
        midTermDegree: mat.MidTermDegree ?? 0,
      }))
      setMaterials(transformedMaterials)
    }
  }, [examineScheduleDetails])

  const columns = [
    { uid: 'materialName', name: 'المادة' },
    { uid: 'examineDate', name: 'تاريخ الامتحان' },
    { uid: 'fromTime', name: 'من' },
    { uid: 'toTime', name: 'إلى' },
    { uid: 'period', name: 'المدة' },
    { uid: 'finalDegree', name: 'الدرجة النهائية' },
    { uid: 'midTermDegree', name: 'درجة أعمال السنة' },
  ]

  const fetchApi = async () => {}

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 flex justify-center items-center">
        <div className="text-gray-500">جاري التحميل...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8 flex justify-center items-center">
        <div className="text-red-500">حدث خطأ أثناء تحميل البيانات</div>
      </div>
    )
  }

  const hasData =
    (Array.isArray(examineScheduleDetails) && examineScheduleDetails.length > 0) ||
    (!Array.isArray(examineScheduleDetails) && examineScheduleDetails)

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg p-8 flex justify-center items-center">
        <div className="text-gray-500">لا توجد بيانات</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Information Card */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-lg font-bold mb-4">تفاصيل جدول الامتحان</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">المرحلة الدراسية</span>
            <span className="font-medium">{headerData?.level}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">الصف الدراسي</span>
            <span className="font-medium">{headerData?.class}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">نوع الامتحان</span>
            <span className="font-medium">{headerData?.examineType}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">الفترة</span>
            <span className="font-medium">{headerData?.period}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">العام الدراسي</span>
            <span className="font-medium">{headerData?.year}</span>
          </div>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg p-4">
        <TablePage
          data={materials}
          columns={columns}
          total={materials.length}
          fetchApi={fetchApi}
          isLoading={false}
          filters={[]}
          isFilteredByDate={false}
          rowsPerPageDefault={10}
          clickable={false}
          tableTitle="مواد الامتحان"
          isHeaderSticky={true}
          actionsConfig={[]}
          specialCells={[]}
          searchPlaceholder="ابحث في المواد..."
        />
      </div>
    </div>
  )
}

export default ScheduleDetails