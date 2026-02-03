import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import TablePage from '../components/TablePage';
import useSchoolOtherRequests from '../hooks/Mofwad/useSchoolOtherRequests';

const OtherRequests = () => {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  const location = useLocation();

  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  const { SchoolOtherRequests, totalCount, loading, error } = useSchoolOtherRequests(
    userData?.Id,
    -1,
    searchText,
    startNumber,
    rowsPerPage,
    refreshKey
  );

  // Refetch list when returning from delete (e.g. navigate with state.refreshList)
  useEffect(() => {
    if (location.state?.refreshList) {
      setRefreshKey((k) => k + 1);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.refreshList]);

  // Columns configuration
  const columns = [
    { uid: 'id', name: 'ID' },
    { uid: 'School_FullName', name: 'اسم المدرسة' },
    { uid: 'RequestDate', name: 'تاريخ الطلب' },
    { uid: 'requestStatus', name: 'حالة الطلب' },
    { uid: 'actions', name: 'الإجراءات' },
  ];

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  // Transform data for table - preserve full request data
  const transformDataForTable = (data) => {
    if (!data) return [];
    
    return data.map(request => ({
      id: request.id || request.Id,
      School_FullName: request.School_FullName || '',
      RequestDate: formatDate(request.RequestDate || request.requestDate || request.createdAt),
      requestStatus: request.SchoolStatus || request.requestStatus || 'غير معروف',
      // Preserve full request data for actions
      _fullData: {
        ...request,
        // Ensure we have the formatted date in the full data too
        formattedRequestDate: formatDate(request.RequestDate || request.requestDate || request.createdAt),
      }
    }));
  };

  // Fetch API function with search (no filters)
  const fetchApi = async (search, page, rowsPerPageValue, filters, dateData) => {
    // Update state values which will trigger the hook to refetch
    setSearchText(search || '');
    
    // Update pagination
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
    
    // Note: The hook will automatically refetch when these state values change
    // Data will be updated via the useEffect below
  };

  // Update table data when request data changes
  useEffect(() => {
    if (SchoolOtherRequests) {
      const transformedData = transformDataForTable(SchoolOtherRequests);
      setTableData(transformedData);
    }
  }, [SchoolOtherRequests]);

  // Actions configuration
  const actionsConfig = [
    {
      label: 'عرض',
      onClick: (item) => {
        const data = item._fullData || item;
        const id = data.id ?? data.Id;
        navigate(id != null ? `/other-requests/${id}` : '/requests/other');
      },
    },
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/requests/create-other', {
          state: { otherRequest: data, action: 1 },
        });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/requests/delete-other-request', {
          state: {
            requestId: data.id ?? data.Id,
            requestData: data,
          },
        });
      },
    },
  ];

  return (
    <div className='bg-white rounded-lg p-4'>
      <TablePage
        data={tableData}
        columns={columns}
        total={totalCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        error={error}
        filters={[]}
        isFilteredByDate={false}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle="الطلبات الأخرى"
        isHeaderSticky={true}
        AddButtonProps={{ 
          title: "تقديم طلب جديد", 
          path: "/requests/create-other", 
          state: { mofwadId: userData?.Id } 
        }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المدرسة أو حالة الطلب..."
        onDoubleClick={(request) => {
          const id = request.id ?? request._fullData?.id ?? request._fullData?.Id;
          if (id != null) navigate(`/other-requests/${id}`);
        }}
      />
    </div>
  );
};

export default OtherRequests;