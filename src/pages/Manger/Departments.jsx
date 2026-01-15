import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TablePage from '../../components/TablePage';
import useSchoolDepartment from '../../hooks/manger/useSchoolDepartment';
import { toast } from 'react-toastify';

const Departments = () => {
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const startNumber = (currentPage - 1) * rowsPerPage;

  // Fetch data via hook
  const { SchoolDepartments, totalCount, loading, error } = useSchoolDepartment(
    userData.School_Id,
    searchText,
    startNumber,
    rowsPerPage
  );

  // Columns
  const columns = [
    { uid: 'id', name: 'ID' },
    { uid: 'Description', name: 'الوصف' },
    { uid: 'actions', name: 'الإجراءات' }, // للإجراءت بعدين
  ];

  // Transform data for TablePage
  const transformDataForTable = (data) => {
    return data.map((department) => ({
      id: department.id,
      Description: department.Description || '',
      _fullData: department,
    }));
  };

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (SchoolDepartments) {
      setTableData(transformDataForTable(SchoolDepartments));
    }
  }, [SchoolDepartments]);

  // Fetch API function for TablePage (search / pagination)
  const fetchApi = (search, page, rows) => {
    setSearchText(search || '');
    setCurrentPage(page || 1);
    setRowsPerPage(rows || 5);
  };

  // ActionsConfig (تعديل / حذف)
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate(`/Departments/Edit/${data.id}`, { state: { departmentData: data } });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item;
        toast.warning('ميزة الحذف غير مفعلة بعد');
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg p-4">
      <TablePage
        data={tableData}
        columns={columns}
        totalCount={totalCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        tableTitle="الإدارات"
        rowsPerPageDefault={5}
        AddButtonProps={{
          title: 'إضافة إدارة',
          path: '/Departments/Add',
        }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم الإدارة..."
      />
    </div>
  );
};

export default Departments;
