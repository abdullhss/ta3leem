import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TablePage from '../components/TablePage';
import useMangers from '../hooks/manger/useMangers';
import { useSelector } from 'react-redux';

// Columns configuration for managers
const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'FullName', name: 'اسم المدير' },
  { uid: 'Email', name: 'البريد الإلكتروني' },
  { uid: 'School_FullName', name: 'المدرسة' },
  { uid: 'Baldia_FullName', name: 'البلدية' },
  { uid: 'OfficeName', name: 'المكتب' },
  { uid: 'actions', name: 'الإجراءات' },
];

export default function Mangers() {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const navigate = useNavigate();

  // Calculate startNumber for pagination (1-indexed starting record number)
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  const userData = useSelector((state) => state.auth.userData);
  console.log(userData.Id);
  
  // Pass search and pagination to hook - it will refetch when these change
  const { Managers, totalCount, loading } = useMangers(
    userData.Id, // isAvailable: -1 means all managers
    -1 , // isAvailable: -1 means all managers
    searchText,
    startNumber,
    rowsPerPage
  );
  console.log(Managers);
  

  // Transform data for table - preserve full manager data
  const transformDataForTable = (data) => {
    return data.map(manager => ({
      id: manager.id || manager.Id,
      FullName: manager.FullName || '',
      Email: manager.Email || '',
      School_FullName: manager.School_FullName || '',
      Baldia_FullName: manager.Baldia_FullName || '',
      OfficeName: manager.OfficeName || '',
      createdAt: manager.createdAt || manager.created_at || new Date(),
      // Preserve full manager data for edit/delete
      _fullData: manager
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

  // Update table data when manager data changes
  useEffect(() => {
    if (Managers) {
      const transformedData = transformDataForTable(Managers);
      setTableData(transformedData);
    }
  }, [Managers]);

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/requests/add-manger', {
          state: {
            managerId: data.id || data.Id,
            action: 1, // edit
          }
        });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/requests/add-manger', {
          state: {
            managerId: data.id || data.Id,
            managerData: data,
            action: 2, // delete
          }
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
        filters={[]}
        isFilteredByDate={false}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle="المدراء"
        isHeaderSticky={true}
        AddButtonProps={{ title: "إضافة مدير", path: "/requests/add-manger" }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المدير..."
        onDoubleClick={(manager)=>{
            navigate("/requests/add-manger", {
              state: {
                action: 1,
                managerId: manager.id,
                type: "viewonly",
              },
            });
        }}
      />
    </div>
  );
}

