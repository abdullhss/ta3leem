import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TablePage from '../../components/TablePage';
import useSchoolDevision from '../../hooks/manger/useSchoolDevision';
import { toast } from 'react-toastify';

const SchoolDevisions = () => {
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Pagination calculation
  const startNumber = (currentPage - 1) * rowsPerPage;

  // Fetch data via hook
  const { SchoolDevisions, DevisionCount, loading, error } = useSchoolDevision(
    userData.School_Id,
    startNumber,
    searchText
  );

  // Columns for table
  const columns = [
    { uid: 'id', name: 'ID' },
    { uid: 'Description', name: 'الوصف' },
    { uid: 'actions', name: 'الإجراءات' }, // لو حابب تضيف actions بعدين
  ];

  // Transform data for table
  const transformDataForTable = (data) => {
    return data.map((devision) => ({
      id: devision.id,
      Description: devision.Description || '',
      _fullData: devision, // احتفظ بالبيانات الكاملة لو عاوز تعديل / حذف
    }));
  };

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (SchoolDevisions) {
      setTableData(transformDataForTable(SchoolDevisions));
    }
  }, [SchoolDevisions]);

  // Fetch API function for TablePage
  const fetchApi = (search, page, rows) => {
    setSearchText(search || '');
    setCurrentPage(page || 1);
    setRowsPerPage(rows || 5);
    // الـ hook هيشتغل تلقائي لما تتغير الـ state
  };

  // Example actions (تقدر تعدّل حسب الحاجة)
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate(`/SchoolDevisions/Edit/${data.id}`, { state: { devisionData: data } });
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
        totalCount={DevisionCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        tableTitle="الأقسام"
        rowsPerPageDefault={5}
        AddButtonProps={{
          title: 'إضافة قسم',
          path: '/SchoolDevisions/Add',
        }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم القسم..."
      />
    </div>
  );
};

export default SchoolDevisions;
