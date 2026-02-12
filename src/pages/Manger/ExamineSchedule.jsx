import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TablePage from '../../components/TablePage';
import useSchoolExamineSchedule from '@/hooks/schools/useSchoolExamineSchedule';

const columns = [
  { uid: 'EducationYear', name: 'السنة الدراسية' },
  { uid: 'EducationLevel', name: 'المرحلة' },
  { uid: 'EducationClass', name: 'الصف' },
  { uid: 'EducationPeriod', name: 'الفترة' },
  { uid: 'ExamineType', name: 'نوع الامتحان' },
  { uid: 'IsSent', name: 'تم الإرسال' },
  { uid: 'IsApproved', name: 'تم الاعتماد' },
  { uid: 'CreatedDate', name: 'تاريخ الإنشاء' },
];


const ExamineSchedule = () => {
  const navigate = useNavigate();

  // Redux state
  const { userData, educationYearData } = useSelector((state) => state.auth);

  // Local state for search and pagination
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Table data state
  const [tableData, setTableData] = useState([]);

  // Pagination: start record number (1‑based)
  const startNum = (currentPage - 1) * rowsPerPage + 1;

  // Custom hook – will re‑fetch whenever searchText, startNum or rowsPerPage changes
  const {
    examineSchedule,
    totalCount,
    loading,
    error
  } = useSchoolExamineSchedule(
    userData.School_Id,
    educationYearData.Id,
    -1,
    -1,
    -1,
    -1,
    -1,
    startNum,
    rowsPerPage
  );

  // Transform raw API data to match table columns
  const transformDataForTable = (data) => {
    return data.map((item) => ({
      id: item.Id,

      EducationYear: item.EducationYear_YearDesc,
      EducationLevel: item.EducationLevel_Description,
      EducationClass: item.EducationClass_Description,
      EducationPeriod: item.EducationPeriod_Description,
      ExamineType: item.EducationExamineType_Description,

      IsSent: item.IsSent ? 'نعم' : 'لا',
      IsApproved: item.IsApproved ? 'معتمد' : 'غير معتمد',

      CreatedDate: new Date(item.CreatedDate).toLocaleDateString('ar-EG'),

      _fullData: item,
    }));
  };

  // Update table data when examineSchedule changes
  useEffect(() => {
    if (examineSchedule) {
      setTableData(transformDataForTable(examineSchedule));
    }
  }, [examineSchedule]);

  // Fetch API function – updates state to trigger hook refetch
  const fetchApi = async (search, page, rowsPerPageValue) => {
    setSearchText(search || '');
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
  };

  // Actions for each row
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/examine-schedule/edit', {
          state: {
            scheduleId: data.id || data.Id,
            action: 1, // 1 = edit
          },
        });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/examine-schedule/edit', {
          state: {
            scheduleId: data.id || data.Id,
            action: 2, // 2 = delete
          },
        });
      },
    },
    {
      label: 'إرسال',
      onClick: (item) => {
        const data = item._fullData || item;
        // Custom send logic – could open a modal or navigate
        console.log('Send schedule:', data);
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <TablePage
        data={tableData}
        columns={columns}
        total={totalCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        filters={[]}            // No additional filters needed
        isFilteredByDate={false}
        rowsPerPageDefault={10}
        clickable={true}
        tableTitle="تعديل جداول الامتحانات"
        isHeaderSticky={true}
        AddButtonProps={{
          title: 'طلب تعديل جدول امتحانات',
          path: '/examine-schedule/add',
        }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المنشئ..."
        onDoubleClick={(item) => {
          navigate('/examine-schedule/view', {
            state: {
              scheduleId: item.id,
              type: 'viewonly',
            },
          });
        }}
      />
    </div>
  );
};

export default ExamineSchedule;