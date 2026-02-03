import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TablePage from '../components/TablePage';
import useSchoolVisitRequests from '../hooks/Mofwad/useSchoolVisitRequests';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { DoTransaction } from '../services/apiServices';

const VISIT_TABLE_KEY = "0wIGNXjA6Ttti4KZHVApAe4w6uMqn+cmKe+S1I64XGE=";

// Columns configuration for visit requests
const columns = [
  { uid: 'School_FullName', name: 'اسم المدرسة' },
  { uid: 'RequestDate', name: 'تاريخ الطلب' },
  { uid: 'YearDesc', name: 'السنة الدراسية' },
  { uid: 'Reason', name: 'سبب الزيارة' },
  { uid: 'requestStatus', name: 'حالة الطلب' },
  { uid: 'SchoolStatus', name: 'حالة المدرسة' },
  { uid: 'actions', name: 'الإجراءات' },
];

const VisitRequests = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [schoolStatusFilter, setSchoolStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Start number for pagination (1-indexed)
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  // Fetch data with parameters
  const { SchoolVisitRequests, totalCount, loading, error } = useSchoolVisitRequests(
    userData?.Id,
    searchText,
    startNumber,
    rowsPerPage,
    refreshKey
  );

  // Status options based on InitialApproveStatus
  const statusOptions = [
    { value: 0, label: 'معلق' },
    { value: 1, label: 'مقبول' },
    { value: 2, label: 'مرفوض' },
  ];

  // School status options based on SchoolStatus
  const schoolStatusOptions = [
    { value: 'رفض الموافقة المبدئية', label: 'رفض الموافقة المبدئية' },
    { value: 'موافقة مبدئية ولم يتم رفع المسوغات', label: 'موافقة مبدئية ولم يتم رفع المسوغات' },
    { value: 'في انتظار الموافقة المبدئية على النقل', label: 'في انتظار الموافقة المبدئية على النقل' },
    // Add more statuses as needed based on your data
  ];

  // Format date to Arabic format
  const formatDateToArabic = (dateString) => {
    if (!dateString) return '---';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-LY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Transform data for table
  const transformDataForTable = (data) => {
    return data.map(request => ({
      id: request.id,
      School_FullName: request.School_FullName || '',
      RequestDate: formatDateToArabic(request.RequestDate),
      YearDesc: request.YearDesc || '',
      Reason: request.Reason || request.reason || '',
      requestStatus: getStatusLabel(request.InitialApproveStatus),
      SchoolStatus: request.SchoolStatus || '',
      School_Id: request.School_Id,
      Mofwad_Id: request.Mofwad_Id,
      InitialApproveStatus: request.InitialApproveStatus,
      FinalApproveStatus: request.FinalApproveStatus,
      InitialApproveRemarks: request.InitialApproveRemarks,
      Baldia_FullName: request.Baldia_FullName,
      LicenseStatus: request.LicenseStatus,
      ChamberCommerceStatus: request.ChamberCommerceStatus,
      OfficeName: request.OfficeName,
      // Preserve full data
      _fullData: request
    }));
  };

  // Get status label
  const getStatusLabel = (status) => {
    switch(status) {
      case 0: return 'معلق';
      case 1: return 'مقبول';
      case 2: return 'مرفوض';
      default: return 'غير معروف';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 0: return 'yellow';
      case 1: return 'green';
      case 2: return 'red';
      default: return 'gray';
    }
  };

  // Fetch API function for TablePage
  const fetchApi = async (search, page, rowsPerPageValue, filters, dateData) => {
    setSearchText(search || '');
    
    // Get status from filters
    const selectedStatus = filters?.status && filters.status.length > 0 
      ? filters.status.map(s => parseInt(s))
      : [];
    setStatusFilter(selectedStatus);
    
    // Get school status from filters
    const selectedSchoolStatus = filters?.schoolStatus && filters.schoolStatus.length > 0 
      ? filters.schoolStatus
      : [];
    setSchoolStatusFilter(selectedSchoolStatus);
    
    // Update pagination
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
  };

  // Update table data when requests data changes
  useEffect(() => {
    if (SchoolVisitRequests) {
      const transformedData = transformDataForTable(SchoolVisitRequests);
      setTableData(transformedData);
    }
  }, [SchoolVisitRequests]);

  const canEditOrDelete = (data) => data?.InitialApproveStatus === 0 && data?.FinalApproveStatus === 0;

  const handleDeleteVisit = async (item) => {
    const data = item._fullData || item;
    if (!canEditOrDelete(data)) {
      toast.warning("لا يمكن حذف الطلب في حالته الحالية");
      return;
    }
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      const response = await DoTransaction(VISIT_TABLE_KEY, `${data.id}`, 2);
      if (response?.success === 200) {
        toast.success("تم حذف الطلب بنجاح");
        setRefreshKey((k) => k + 1);
      } else {
        toast.error(response?.errorMessage || "فشل في حذف الطلب");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  // Actions configuration
  const actionsConfig = [
    {
      label: 'عرض التفاصيل',
      color: 'primary',
      onClick: (item) => navigate(`/visit-requests/${item.id}`),
    },
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        if (!canEditOrDelete(data)) {
          toast.warning("لا يمكن تعديل الطلب في حالته الحالية");
          return;
        }
        navigate('/create-visit-request', {
          state: { visitRequest: data, action: 1 }
        });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: handleDeleteVisit,
    },
  ];

  // Filter configuration
  const filterConfig = [
    {
      key: 'status',
      label: 'حالة الطلب',
      type: 'checkbox',
      options: statusOptions,
      placeholder: 'اختر حالة الطلب',
      resetLabel: 'إعادة ضبط',
      allowMultiple: true,
    }
  ];

  // Add button props if user can create new visit requests
  const canCreateRequest = userData?.Role === 'Mofwad' || userData?.Role === 'Admin';
  const addButtonProps = canCreateRequest ? {
    title: 'طلب زيارة جديد',
    path: '/requests/create-visit',
    state: { mofwadId: userData?.Id }
  } : null;

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="text-center text-red-600 py-8">
          <p>حدث خطأ في تحميل البيانات</p>
          <p className="text-sm text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg p-4'>
      <TablePage
        data={tableData}
        columns={columns}
        total={totalCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        filters={filterConfig}
        isFilteredByDate={true}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle="طلبات الزيارة"
        AddButtonProps={addButtonProps}
        isHeaderSticky={true}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المدرسة..."
        onDoubleClick={(item) => {
          const data = item._fullData || item;
          navigate(`/visit-requests/${data.id}`);
        }}
        // Custom render for columns
        renderCell={(column, item) => {
          // Status column
          if (column.uid === 'requestStatus') {
            const status = item.InitialApproveStatus;
            const statusColor = getStatusColor(status);
            
            const colorClasses = {
              yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
              green: 'bg-green-100 text-green-800 border border-green-200',
              red: 'bg-red-100 text-red-800 border border-red-200',
              gray: 'bg-gray-100 text-gray-800 border border-gray-200'
            };
            
            return (
              <div className="flex flex-col gap-1">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${colorClasses[statusColor]} w-fit`}>
                  {item.requestStatus}
                </span>
                {item.FinalApproveStatus !== 0 && (
                  <span className={`text-xs px-2 py-1 rounded-full w-fit ${item.FinalApproveStatus === 1 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {item.FinalApproveStatus === 1 ? 'تمت الموافقة النهائية' : 'مرفوض نهائياً'}
                  </span>
                )}
              </div>
            );
          }
          
          // School name column with additional info
          if (column.uid === 'School_FullName') {
            return (
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{item.School_FullName}</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item._fullData?.Baldia_FullName && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                      {item._fullData.Baldia_FullName}
                    </span>
                  )}
                  {item._fullData?.OfficeName && (
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                      مكتب: {item._fullData.OfficeName}
                    </span>
                  )}
                </div>
              </div>
            );
          }
          
          // School status column
          if (column.uid === 'SchoolStatus') {
            const status = item.SchoolStatus;
            let statusClass = 'bg-gray-100 text-gray-800';
            
            if (status?.includes('رفض')) {
              statusClass = 'bg-red-50 text-red-700 border border-red-100';
            } else if (status?.includes('موافقة')) {
              statusClass = 'bg-green-50 text-green-700 border border-green-100';
            } else if (status?.includes('انتظار')) {
              statusClass = 'bg-yellow-50 text-yellow-700 border border-yellow-100';
            }
            
            return (
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusClass}`}>
                {status || '---'}
              </span>
            );
          }
          
          // Reason column
          if (column.uid === 'Reason') {
            return (
              <div className="max-w-xs">
                <span className="text-gray-700 line-clamp-2">
                  {item.Reason || '---'}
                </span>
              </div>
            );
          }
          
          return null;
        }}
      />
    </div>
  );
};

export default VisitRequests;