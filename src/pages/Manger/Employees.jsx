import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import TablePage from '../../components/TablePage';
import useSchoolEmployees from '../../hooks/schools/useSchoolsEmployees';

const Employees = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Calculate startNumber for pagination (1-indexed starting record number)
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  // Pass search, pagination, and filters to hook - it will refetch when these change
  const { employees, totalCount, loading, error } = useSchoolEmployees(
    userData.School_Id,
    -1, // status filter (default to -1 for all)
    searchText,
    startNumber,
    rowsPerPage
  );

  // Transform data for table - preserve full employee data
  const transformDataForTable = (data) => {
    return data.map(employee => ({
      id: employee.id,
      FullName: employee.FullName || '',
      MobileNum: employee.MobileNum || '',
      Email: employee.Email || '',
      Gender_Name: employee.Gender_Name || '',
      Nationality_Name: employee.Nationality_Name || '',
      IsActive: employee.IsActive || false,
      IsApproved: employee.IsApproved || 0,
      // Preserve full employee data for edit/delete
      _fullData: employee
    }));
  };

  // Fetch API function with search and filters
  const fetchApi = async (search, page, rowsPerPageValue, filters, dateData) => {
    // Update state values which will trigger the hook to refetch
    setSearchText(search || '');
    
    // Update pagination
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
    
    // Note: The hook will automatically refetch when these state values change
    // Data will be updated via the useEffect below
  };

  // Update table data when employees data changes
  useEffect(() => {
    if (employees) {
      const transformedData = transformDataForTable(employees);
      setTableData(transformedData);
    }
  }, [employees]);

  // Handle error state
  useEffect(() => {
    if (error) {
      toast.error("حدث خطأ في تحميل بيانات الموظفين");
    }
  }, [error]);

  // Check if employee can be edited or deleted based on status
  const canEditOrDelete = (employee) => {
    // Add your logic here based on employee status
    // For example, if IsApproved is 0 or IsActive is true/false
    return employee.IsApproved === 0; // Example: Can edit if not approved yet
  };

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;

        if (!canEditOrDelete(data)) {
          toast.warning("حالة الموظف لا تمكنك من هذا الإجراء");
          return;
        }

        navigate(`/Employees/Edit/${data.id}`, {
          state: {
            employeeData: data,
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

        if (!canEditOrDelete(data)) {
          toast.warning("حالة الموظف لا تمكنك من هذا الإجراء");
          return;
        }

        navigate(`/Employees/Delete/${data.id}`, {
          state: {
            employeeData: data,
            action: 2, // delete
          }
        });
      },
    }
  ];

  // Columns configuration
  const columns = [
    { uid: 'id', name: 'ID' },
    { uid: 'FullName', name: 'الاسم الكامل' },
    { uid: 'MobileNum', name: 'رقم الهاتف' },
    { uid: 'Email', name: 'البريد الإلكتروني' },
    { uid: 'Gender_Name', name: 'الجنس' },
    { uid: 'Nationality_Name', name: 'الجنسية' },
    { uid: 'actions', name: 'الإجراءات' },
  ];

  return (
    <div className='bg-white rounded-lg p-4'>
      <TablePage
        data={tableData}
        columns={columns}
        total={totalCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        isFilteredByDate={false}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle={"إدارة الكوادر"}
        isHeaderSticky={true}
        AddButtonProps={{ 
          title: "إضافة موظف جديد", 
          path: "/Employees/Add" 
        }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم الموظف أو البريد الإلكتروني..."
        errorMessage={error ? "فشل في تحميل بيانات الموظفين" : null}
        noDataMessage="لا توجد موظفين"
      />
    </div>
  );
};

export default Employees;