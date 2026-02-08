import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TablePage from '../../components/TablePage';
import useStudentReception from '@/hooks/schools/useStudentReception';
import useStudentTransportation from '@/hooks/schools/useStudentTransportation';
import { useSelector } from 'react-redux';
import { Button } from '../../ui/button';
// Columns for Transportation tab (نقل طلبة المدرسة)
const transportationColumns = [
  { uid: 'Student_FullName', name: 'اسم الطالب' },
  { uid: 'EducationLeveL_Description', name: 'المرحلة الدراسية' },
  { uid: 'EducationClass_Description', name: 'الصف الدراسي' },
  { uid: 'CreatedAt', name: 'تاريخ الطلب' },
  { uid: 'WantedSchool_FullName', name: 'المدرسة المراد الإتقال لها' },
  { uid: 'OfficeApproved', name: 'موافقة المكتب' },
  { uid: 'status', name: 'الحالة' },
  { uid: 'actions', name: 'الإجراءات' },
];

// Columns for Reception tab (استقبال طلبات النقل للمدرسة)
const receptionColumns = [
  { uid: 'Student_FullName', name: 'اسم الطالب' },
  { uid: 'EducationLeveL_Description', name: 'المرحلة الدراسية' },
  { uid: 'EducationClass_Description', name: 'الصف الدراسي' },
  { uid: 'CreatedAt', name: 'تاريخ الطلب' },
  { uid: 'School_FullName', name: 'المدرسة المنقول منها' },
  { uid: 'OfficeApproved', name: 'موافقة المكتب' },
  { uid: 'status', name: 'الحالة' },
  { uid: 'actions', name: 'الإجراءات' },
];

const TransferManagement = () => {
  const { userData, educationYearData } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(null); // Start with no tab selected
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filters, setFilters] = useState({
    educationLevel: -1,
    educationClass: -1,
    status: -1
  });

  // Calculate startNumber for pagination
  const startNumber = (currentPage - 1) * rowsPerPage + 1;

  // Hook for Transportation tab
  const { StudentTransportation, totalCount: totalCountTransportation, loading: loadingTransportation } = useStudentTransportation({
    School_id: userData?.School_Id || -1,
    Student_id: -1,
    EducationYear_Id: educationYearData?.Id || -1,
    EducationLevel_Id: filters.educationLevel,
    EducationClass_Id: filters.educationClass,
    SchoolClass_Id: -1,
    StartNum: startNumber,
    Count: rowsPerPage,
    searchText: searchText
  });

  // Hook for Reception tab
  const { StudentReception, totalCount: totalCountReception, loading: loadingReception } = useStudentReception({
    School_id: userData?.School_Id || -1,
    Student_id: -1,
    EducationYear_Id: educationYearData?.Id || -1,
    EducationLevel_Id: filters.educationLevel,
    EducationClass_Id: filters.educationClass,
    StartNum: startNumber,
    Count: rowsPerPage,
    searchText: searchText
  });

  // Transform data based on active tab
  const transformDataForTable = (data, isReception = false) => {
    return data.map(item => ({
      id: item.Id,
      Student_FullName: item.Student_FullName || '',
      EducationLeveL_Description: item.EducationLeveL_Description || '',
      EducationClass_Description: item.EducationClass_Description || '',
      CreatedAt: formatDate(item.CreatedAt || item.createdAt),
      status: getStatus(item, isReception),
      WantedSchool_FullName: item.WantedSchool_FullName || '',
      School_FullName: item.School_FullName || '',
      OfficeApproved: getApprovalStatus(item.OfficeApproved),
      SchoolApproved: item.SchoolApproved,
      OfficeApprovedRaw: item.OfficeApproved,
      _fullData: item
    }));
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG');
  };

  // Helper function to get status text
  const getStatus = (item, isReception) => {
    if (isReception) {
      // For reception: School needs to approve
      return item.SchoolApproved === 1 ? 'مقبول' : 
             item.SchoolApproved === 0 ? 'قيد المراجعة' : 'مرفوض';
    } else {
      // For transportation: Both school and office approval
      if (item.OfficeApproved === 1 && item.SchoolApproved === 1) return 'مقبول';
      if (item.OfficeApproved === 0 || item.SchoolApproved === 0) return 'قيد المراجعة';
      return 'مرفوض';
    }
  };

  // Helper function to get approval status text
  const getApprovalStatus = (status) => {
    switch(status) {
      case 1: return 'موافق';
      case 0: return 'قيد المراجعة';
      case -1: return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  // Update table data based on active tab
  useEffect(() => {
    if (activeTab === 'transportation' && StudentTransportation) {
      const transformedData = transformDataForTable(StudentTransportation, false);
      setTableData(transformedData);
    } else if (activeTab === 'reception' && StudentReception) {
      const transformedData = transformDataForTable(StudentReception, true);
      setTableData(transformedData);
    }
  }, [activeTab, StudentTransportation, StudentReception]);

  // Fetch API function
  const fetchApi = async (search, page, rowsPerPageValue, filterData, dateData) => {
    setSearchText(search || '');
    
    // Extract filters
    const newFilters = {
      educationLevel: filterData?.educationLevel && filterData.educationLevel.length > 0 
        ? parseInt(filterData.educationLevel[0]) 
        : -1,
      educationClass: filterData?.educationClass && filterData.educationClass.length > 0 
        ? parseInt(filterData.educationClass[0]) 
        : -1,
      status: filterData?.status && filterData.status.length > 0 
        ? parseInt(filterData.status[0]) 
        : -1
    };
    
    setFilters(newFilters);
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
  };

  // Actions configuration
  const getActionsConfig = (isReception = false) => [
    {
      label: 'عرض التفاصيل',
      onClick: (item) => {
        const data = item._fullData || item;
        // Navigate to details page or show modal
        console.log('View details:', data);
        // navigate(`/transfer-requests/${data.Id}`);
      },
    },
    {
      label: 'تغيير الحالة',
      onClick: (item) => {
        const data = item._fullData || item;
        if (isReception && data.SchoolApproved === 0) {
          // Navigate to change status page or show modal
          console.log('Change status:', data);
          // navigate(`/transfer-requests/${data.Id}/change-status`);
        }
      },
      condition: (item) => {
        if (isReception) {
          return item._fullData?.SchoolApproved === 0;
        }
        return false;
      }
    }
  ];

  // Filter configuration (common for both tabs)
  const filterConfig = [
    {
      key: 'educationLevel',
      label: 'المرحلة الدراسية',
      type: 'select',
      options: [
        { value: -1, label: 'الكل' },
        { value: 1, label: 'الابتدائية' },
        { value: 2, label: 'المتوسطة' },
        { value: 3, label: 'الثانوية' },
      ],
      placeholder: 'اختر المرحلة',
    },
    {
      key: 'educationClass',
      label: 'الصف الدراسي',
      type: 'select',
      options: [
        { value: -1, label: 'الكل' },
        { value: 1, label: 'الصف الأول' },
        { value: 2, label: 'الصف الثاني' },
        { value: 3, label: 'الصف الثالث' },
        { value: 4, label: 'الصف الرابع' },
        { value: 5, label: 'الصف الخامس' },
        { value: 6, label: 'الصف السادس' },
      ],
      placeholder: 'اختر الصف',
    },
    {
      key: 'status',
      label: 'الحالة',
      type: 'select',
      options: [
        { value: -1, label: 'الكل' },
        { value: 0, label: 'قيد المراجعة' },
        { value: 1, label: 'مقبول' },
        { value: 2, label: 'مرفوض' },
      ],
      placeholder: 'اختر الحالة',
    }
  ];

  // Get current tab data
  const getCurrentTabData = () => {
    if (activeTab === 'transportation') {
      return {
        data: tableData,
        total: totalCountTransportation || 0,
        loading: loadingTransportation,
        columns: transportationColumns,
        actionsConfig: getActionsConfig(false),
        title: 'طلبات نقل الطلبة',
        addButtonTitle: 'إضافة طلب نقل',
        addButtonPath: "/requests/create-transfer",
        addButtonState: { transferType: 'transportation' }
      };
    } else if (activeTab === 'reception') {
      return {
        data: tableData,
        total: totalCountReception || 0,
        loading: loadingReception,
        columns: receptionColumns,
        actionsConfig: getActionsConfig(true),
        title: 'طلبات استقبال النقل',
        addButtonTitle: 'إضافة طلب استقبال',
        addButtonPath: "/requests/create-transfer",
        addButtonState: { transferType: 'reception' }
      };
    }
    return null;
  };

  const currentTabData = getCurrentTabData();
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {!activeTab && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 sm:gap-8"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 sm:p-6 bg-white rounded-lg font-bold text-black">
              <span className="text-base sm:text-lg">
                إدارة نقل الطلبة
              </span>
              <span className="text-sm sm:text-base">
                {currentYear - 1}/{currentYear}
              </span>
            </div>

            {/* Tab Selection */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-lg font-bold">
              <Button
                onClick={() => setActiveTab("transportation")}
                className="bg-[#C18C46] hover:bg-[#A97838] text-white text-base sm:text-lg w-full md:max-w-[40%] py-6"
              >
                نقل طلبة المدرسة
              </Button>

              <Button
                onClick={() => setActiveTab("reception")}
                className="bg-[#C18C46] hover:bg-[#A97838] text-white text-base sm:text-lg w-full md:max-w-[40%] py-6"
              >
                استقبال طلبات النقل للمدرسة
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab && currentTabData && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <div className='bg-white rounded-lg p-4'>
              <div className="mb-4 flex justify-between items-center">
                <button
                  onClick={() => setActiveTab(null)}
                  className="text-[#C18C46] hover:text-[#A97838] font-medium text-sm flex items-center gap-2"
                >
                  <span>← العودة</span>
                </button>
                <h2 className="text-lg font-bold">
                  {activeTab === 'transportation' ? 'نقل طلبة المدرسة' : 'استقبال طلبات النقل للمدرسة'}
                </h2>
              </div>

              <TablePage
                data={currentTabData.data}
                columns={currentTabData.columns}
                total={currentTabData.total}
                fetchApi={fetchApi}
                isLoading={currentTabData.loading}
                filters={filterConfig}
                isFilteredByDate={true}
                rowsPerPageDefault={5}
                clickable={true}
                tableTitle={currentTabData.title}
                isHeaderSticky={true}
                AddButtonProps={{
                  title: currentTabData.addButtonTitle,
                  path: currentTabData.addButtonPath,
                  state: currentTabData.addButtonState
                }}
                actionsConfig={currentTabData.actionsConfig}
                searchPlaceholder="ابحث باسم الطالب..."
                onDoubleClick={(item) => {
                  const data = item._fullData || item;
                  // Navigate to details
                  console.log('Double click:', data);
                  // navigate(`/transfer-requests/${data.id}`);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransferManagement;