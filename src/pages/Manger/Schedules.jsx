import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import TablePage from '../../components/TablePage'
import useExamineSchedule from '@/hooks/schools/useExamineSchedule'
import { useNavigate } from 'react-router-dom';

const Schedules = () => {
  // Redux – user and current education year
  const { userData, educationYearData } = useSelector((state) => state.auth)
  const navigate = useNavigate();
  // Fetch schedules
  const {
    examineSchedule,
    totalCount,
    loading: schedulesLoading,
  } = useExamineSchedule(
    userData.School_Id,
    educationYearData.Id,
    -1, -1, -1, -1, -1, // filters (unused)
    1,                   // StartNum
    10000               // Count – fetch all for preview
  )

  // Table data state
  const [tableData, setTableData] = useState([])

  // Transform API data to match table columns
  const transformDataForTable = (data) => {
    if (!data || !Array.isArray(data)) return []
    return data.map((schedule) => ({
      id: schedule.Id,
      EducationLevel_Description: schedule.EducationLevel_Description || '-',
      EducationClass_Description: schedule.EducationClass_Description || '-',
      EducationExamineType_Description: schedule.EducationExamineType_Description || '-',
      EducationPeriod_Description: schedule.EducationPeriod_Description || '-',
      EducationYear_YearDesc: schedule.EducationYear_YearDesc || '-',
      type: schedule.type ,
    }))
  }

  useEffect(() => {
    if (examineSchedule) {
      setTableData(transformDataForTable(examineSchedule))
    }
  }, [examineSchedule])

  // Table columns – exactly as requested
  const columns = [
    { uid: 'EducationLevel_Description', name: 'المرحلة الدراسية' },
    { uid: 'EducationClass_Description', name: 'الصف الدراسي' },
    { uid: 'EducationExamineType_Description', name: 'نوع الامتحان' },
    { uid: 'EducationPeriod_Description', name: 'الفترة الدراسية' },
    { uid: 'EducationYear_YearDesc', name: 'العام الدراسي' },
  ]

  const fetchApi = async () => {}

  return (
    <div className="bg-white rounded-lg p-4">
      <TablePage
        data={tableData}
        columns={columns}
        total={totalCount || tableData.length}
        fetchApi={fetchApi}
        isLoading={schedulesLoading}
        filters={[]}
        isFilteredByDate={false}
        rowsPerPageDefault={10}
        tableTitle="جداول الامتحانات"
        isHeaderSticky={true}
        actionsConfig={[]}
        specialCells={[]}
        onDoubleClick={(row) => navigate(`/schedule-details/${row.id}/${row.type}`)}
        searchPlaceholder="ابحث في جداول الامتحانات..."
      />
    </div>
  )
}

export default Schedules