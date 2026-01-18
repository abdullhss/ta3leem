import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TablePage from '../../components/TablePage';
import useSchoolDevision from '../../hooks/manger/useSchoolDevision';
import { toast } from 'react-toastify';
import { DoTransaction } from '../../services/apiServices';
import { ConfirmModal } from '../../global/global-modal/ConfirmModal';

const SchoolDevisions = () => {
  const { userData } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [devisionToDelete, setDevisionToDelete] = useState(null);

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

  // Handle delete
  const handleDeleteClick = (item) => {
    const data = item._fullData || item;
    setDevisionToDelete(data);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!devisionToDelete) return;

    const devisionId = devisionToDelete.id || devisionToDelete.Id;
    
    try {
      const response = await DoTransaction(
        "SI2sCeLI3BHIzngEXxosAg==",
        `${devisionId}`,
        2, // 2 = delete
        "Id"
      );

      if(response.success != 200){
        toast.error(response.errorMessage || "فشل الحذف");
      } else {
        toast.success("تم حذف القسم بنجاح");
        setShowDeleteModal(false);
        setDevisionToDelete(null);
        // Refresh the data by updating search or page
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error deleting devision:", error);
      toast.error("حدث خطأ أثناء حذف القسم");
    }
  };

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate(`/SchoolDevisions/Edit/${data.id}`, { 
          state: { 
            devisionData: data,
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
              desc={`هل أنت متأكد من حذف القسم "${devisionToDelete?.Description || 'هذا القسم'}"؟`}
              confirmFunc={handleDelete}
              onClose={() => {
                setShowDeleteModal(false);
                setDevisionToDelete(null);
              }}
            />
          </div>
        </div>
      )}

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
    </>
  );
};

export default SchoolDevisions;
