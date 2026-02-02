import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TablePage from '../components/TablePage';
import useSchoolRenewRequests from '../hooks/Mofwad/useSchoolRenewRequests'; // You'll need to create this hook
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import useSingleSchoolRenew from '../hooks/Mofwad/useSingleSchoolRenew';

// Columns configuration for renewal requests
const columns = [
  { uid: 'School_FullName', name: 'اسم المدرسة' },
  { uid: 'RequestDate', name: 'تاريخ الطلب' },
  { uid: 'requestStatus', name: 'حالة الطلب' },
];

const RenewalRequests = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Start number for pagination (1-indexed)
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  // Fetch data with parameters
  const { SchoolRenewRequests, totalCount, loading, error } = useSchoolRenewRequests(
    userData?.Id,
    searchText,
    startNumber,
    rowsPerPage,
    statusFilter
  );

  // Status options based on MainApproveStatus
  const statusOptions = [
    { value: 0, label: 'معلق' },
    { value: 1, label: 'مقبول' },
    { value: 2, label: 'مرفوض' },
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
      requestStatus: getStatusLabel(request.MainApproveStatus),
      School_Id: request.School_Id,
      MainApproveStatus: request.MainApproveStatus,
      InitialApproveStatus: request.InitialApproveStatus,
      FinalApproveStatus: request.FinalApproveStatus,
      LicenseStatus: request.LicenseStatus,
      ChamberCommerceStatus: request.ChamberCommerceStatus,
      SchoolStatus: request.SchoolStatus,
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

  // Fetch API function for TablePage
  const fetchApi = async (search, page, rowsPerPageValue, filters, dateData) => {
    setSearchText(search || '');
    
    // Get status from filters
    const selectedStatus = filters?.status && filters.status.length > 0 
      ? filters.status.map(s => parseInt(s))
      : [];
    setStatusFilter(selectedStatus);
    
    // Update pagination
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
  };

  // Update table data when requests data changes
  useEffect(() => {
    if (SchoolRenewRequests) {
      const transformedData = transformDataForTable(SchoolRenewRequests);
      setTableData(transformedData);
    }
  }, [SchoolRenewRequests]);

  // Actions configuration
  const actionsConfig = [
    // Add actions here if needed
    // Example:
    // {
    //   label: 'عرض',
    //   color: 'primary',
    //   onClick: (item) => navigate(`/renewal-requests/${item.id}`)
    // }
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

  // Add button props if user can create new renewal requests
  const canCreateRequest = userData?.Role === 'Mofwad' || userData?.Role === 'Admin';
  const addButtonProps = canCreateRequest ? {
    title: 'طلب تجديد جديد',
    path: '/requests/create-renewal',
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
        tableTitle="طلبات التجديد"
        AddButtonProps={{ title: 'تقديم طلب', path: '/requests/renew-school', state: { mofwadId: userData?.Id } }}
        isHeaderSticky={true}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المدرسة..."
        onDoubleClick={(item) => {
          const data = item._fullData || item;
          navigate(`/renewal-requests/${data.id}`);
        }}
        // Custom render for status column
        renderCell={(column, item) => {
          if (column.uid === 'requestStatus') {
            const status = item.MainApproveStatus;
            let statusClass = '';
            
            switch(status) {
              case 0:
                statusClass = 'bg-yellow-100 text-yellow-800';
                break;
              case 1:
                statusClass = 'bg-green-100 text-green-800';
                break;
              case 2:
                statusClass = 'bg-red-100 text-red-800';
                break;
              default:
                statusClass = 'bg-gray-100 text-gray-800';
            }
            
            return (
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusClass}`}>
                {item.requestStatus}
              </span>
            );
          }
          
          if (column.uid === 'School_FullName') {
            return (
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">{item.School_FullName}</span>
                {item._fullData?.LicenseStatus && (
                  <span className={`text-xs mt-1 ${item._fullData.LicenseStatus === 'منتهي' ? 'text-red-600' : 'text-green-600'}`}>
                    الرخصة: {item._fullData.LicenseStatus}
                  </span>
                )}
              </div>
            );
          }
          
          return null;
        }}
      />
    </div>
  );
};

export default RenewalRequests;