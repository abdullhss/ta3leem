import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TablePage from '../../components/TablePage';
import useSchoolDepartment from '../../hooks/manger/useSchoolDepartment';
import { toast } from 'react-toastify';
import { DoTransaction } from '../../services/apiServices';
import { ConfirmModal } from '../../global/global-modal/ConfirmModal';

const Departments = () => {
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
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

  // Handle delete
  const handleDeleteClick = (item) => {
    const data = item._fullData || item;
    setDepartmentToDelete(data);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!departmentToDelete) return;

    const departmentId = departmentToDelete.id || departmentToDelete.Id;
    
    try {
      const response = await DoTransaction(
        "ZIFEL17gLyWFPeaISNh4ydM8cDH8xmOCbmJhCEciZ/o=",
        `${departmentId}`,
        2, // 2 = delete
        "Id"
      );

      if(response.success != 200){
        toast.error(response.errorMessage || "فشل الحذف");
      } else {
        toast.success("تم حذف الإدارة بنجاح");
        setShowDeleteModal(false);
        setDepartmentToDelete(null);
        // Refresh the data by updating search or page
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      toast.error("حدث خطأ أثناء حذف الإدارة");
    }
  };

  // ActionsConfig (تعديل / حذف)
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate(`/Departments/Edit/${data.id}`, { 
          state: { 
            departmentData: data,
            action: 1 // 1 = edit
          } 
        });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        handleDeleteClick(item);
      },
    },
  ];

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ConfirmModal
              desc={`هل أنت متأكد من حذف الإدارة "${departmentToDelete?.Description || 'هذه الإدارة'}"؟`}
              confirmFunc={handleDelete}
              onClose={() => {
                setShowDeleteModal(false);
                setDepartmentToDelete(null);
              }}
            />
          </div>
        </div>
      )}

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
    </>
  );
};

export default Departments;
