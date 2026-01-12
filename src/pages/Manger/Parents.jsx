import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStudentParents from '../../hooks/useStudentParents';
import { toast } from "react-toastify";
import TablePage from '../../components/TablePage';

const Parents = () => {
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const navigate = useNavigate();

  // Calculate startNumber for pagination
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  // Fetch parents data with search and pagination
  const { StudentParents, StudentParentCount, loading, error } = useStudentParents(
    0, // status (if applicable, adjust as needed)
    searchText,
    startNumber,
    rowsPerPage
  );

  // Define columns based on your data structure
  const columns = [
    { uid: 'id', name: 'ID' },
    { uid: 'FullName', name: 'الاسم الكامل' },
    { uid: 'MobileNum', name: 'رقم الهاتف' },
    { uid: 'Email', name: 'البريد الإلكتروني' },
    { uid: 'Address', name: 'العنوان' },
    { uid: 'WhatsupNum', name: 'رقم الواتساب' },
    { uid: 'IdNum', name: 'رقم الهوية' },
    { uid: 'actions', name: 'الإجراءات' },
  ];

  // Transform API data for table display
  const transformDataForTable = (data) => {
    return data.map(parent => ({
      id: parent.id,
      FullName: parent.FullName || '',
      MobileNum: parent.MobileNum || '',
      Email: parent.Email || '',
      Address: parent.Address || '',
      WhatsupNum: parent.WhatsupNum || '',
      IdNum: parent.IdNum || '',
      School_Id: parent.School_Id || 0,
      // Preserve full data for actions
      _fullData: parent
    }));
  };

  // Fetch function for TablePage
  const fetchApi = async (search, page, rowsPerPageValue, filters, dateData) => {
    setSearchText(search || '');
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
    
    // If you have status filters, handle them here
    // const selectedStatus = filters?.status && filters.status.length > 0 
    //   ? parseInt(filters.status[0]) 
    //   : 0;
    // setStatusId(selectedStatus);
  };

  // Update table data when StudentParents changes
  useEffect(() => {
    if (StudentParents) {
      const transformedData = transformDataForTable(StudentParents);
      setTableData(transformedData);
    }
  }, [StudentParents]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || "حدث خطأ في تحميل بيانات أولياء الأمور");
    }
  }, [error]);

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/education-levels/parents/add', {
          state: {
            parentData: data,
            action: 1 // edit
          }
        });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/education-levels/parents/add', {
          state: {
            parentData: data,
            action: 2 // delete
          }
        });
      },
    },
  ];

  // Optional: Handle double click on row
  const handleDoubleClick = (parent) => {
    navigate(`/parents/${parent.id}/details`);
  };

  return (
    <div className='bg-white rounded-lg p-4'>
      <TablePage
        data={tableData}
        columns={columns}
        total={StudentParentCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        filters={[]}
        isFilteredByDate={false}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle="أولياء الأمور"
        isHeaderSticky={true}
        AddButtonProps={{ 
          title: "إضافة ولي أمر", 
          path: "/education-levels/parents/add" 
        }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث بالاسم أو رقم الهاتف..."
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
};

export default Parents;