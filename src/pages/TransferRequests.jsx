import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TablePage from '../components/TablePage';
import useSchoolTransRequests from '../hooks/Mofwad/useSchoolTransRequests';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";

// Columns configuration
const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'School_FullName', name: 'المدرسة' },
  { uid: 'Request_Baldia_FullName', name: 'البلدية' },
  { uid: 'OfficeName', name: 'المكتب' },
  { uid: 'remarks', name: 'ملاحظات' },
  { uid: 'requestStatus', name: 'حالة الطلب' },
  { uid: 'actions', name: 'الإجراءات' },
];

const TransferRequests = () => {
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
  const { SchoolTransRequests, totalCount, loading, error } = useSchoolTransRequests(
    userData?.Id,
    searchText,
    startNumber,
    rowsPerPage,
    statusFilter
  );
  console.log(SchoolTransRequests);
  

  // Status options based on FinalApproveStatus
  const statusOptions = [
    { value: 0, label: 'معلق' },
    { value: 1, label: 'مقبول' },
    { value: 2, label: 'مرفوض' },
  ];

  // Transform data for table
  const transformDataForTable = (data) => {
    return data.map(request => ({
      id: request.id,
      School_FullName: request.School_FullName || '',
      Request_Baldia_FullName: request.Request_Baldia_FullName || '',
      OfficeName: request.OfficeName || '',
      remarks: request.InitialApproveRemarks || '---',
      requestStatus: getStatusLabel(request.FinalApproveStatus),
      RequestDate: request.RequestDate,
      FinalApproveStatus: request.FinalApproveStatus,
      InitialApproveStatus: request.InitialApproveStatus,
      School_Id: request.School_Id,
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
    if (SchoolTransRequests) {
      const transformedData = transformDataForTable(SchoolTransRequests);
      setTableData(transformedData);
    }
  }, [SchoolTransRequests]);

  // Actions configuration
  const actionsConfig = [

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
        tableTitle="طلبات النقل"
        isHeaderSticky={true}
        AddButtonProps={{ title: 'تقديم طلب', path: '/requests/transfer-school', state: { mofwadId: userData?.Id } }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المدرسة..."
        onDoubleClick={(item) => {
          const data = item._fullData || item;
          navigate(`/transfer-requests/${data.id}`);
        }}
        // Optional: Add custom render for status column
        renderCell={(column, item) => {
          if (column.uid === 'requestStatus') {
            const status = item.FinalApproveStatus;
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
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                {item.requestStatus}
              </span>
            );
          }
          return null;
        }}
      />
    </div>
  );
};

export default TransferRequests;