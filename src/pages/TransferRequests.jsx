import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TablePage from '../components/TablePage';
import useSchoolTransRequests from '../hooks/Mofwad/useSchoolTransRequests';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import { DoTransaction } from '../services/apiServices';
import { Button } from '../ui/button';
import { ConfirmModal } from '../global/global-modal/ConfirmModal';

const TRANSFER_TABLE_KEY = "Gpy06t4isIWQFbF36glkdNPH9xRbgbMiBKqH6ViGbKU=";

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

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const TransferRequests = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDeleteMode = location.state?.action === 2 && location.state?.transferRequest;
  const deleteRequestData = location.state?.transferRequest;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Start number for pagination (1-indexed)
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  // Fetch data with parameters
  const { SchoolTransRequests, totalCount, loading, error } = useSchoolTransRequests(
    userData?.Id,
    searchText,
    startNumber,
    rowsPerPage,
    refreshKey
  );

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

  // Only allow edit/delete when request is still pending (InitialApproveStatus === 0)
  const canEditOrDelete = (data) => data?.InitialApproveStatus === 0 && data?.FinalApproveStatus === 0;

  const handleDeleteTransfer = async () => {
    const data = deleteRequestData;
    if (!data?.id) {
      toast.error("بيانات الطلب غير صحيحة");
      return;
    }
    if (!canEditOrDelete(data)) {
      toast.warning("لا يمكن حذف الطلب في حالته الحالية");
      setShowDeleteModal(false);
      return;
    }
    try {
      const response = await DoTransaction(TRANSFER_TABLE_KEY, `${data.id}`, 2);
      if (response?.success === 200) {
        toast.success("تم حذف الطلب بنجاح");
        setShowDeleteModal(false);
        setRefreshKey((k) => k + 1);
        navigate(-1);
      } else {
        toast.error(response?.errorMessage || "فشل في حذف الطلب");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        if (!canEditOrDelete(data)) {
          toast.warning("لا يمكن تعديل الطلب في حالته الحالية");
          return;
        }
        navigate('/requests/transfer-school', {
          state: { transferRequest: data, action: 1 }
        });
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item;
        if (!canEditOrDelete(data)) {
          toast.warning("لا يمكن حذف الطلب في حالته الحالية");
          return;
        }
        navigate('/transfer-requests', {
          state: { action: 2, transferRequest: data },
          replace: false,
        });
      },
    },
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

  // Delete mode UI (same as AddManger delete mode)
  if (isDeleteMode && deleteRequestData) {
    const displayName = deleteRequestData.School_FullName || 'هذا الطلب';
    return (
      <div className="flex flex-col gap-6 w-full">
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ConfirmModal
              desc={`هل أنت متأكد من حذف طلب النقل "${displayName}"؟`}
              confirmFunc={handleDeleteTransfer}
              onClose={() => setShowDeleteModal(false)}
            />
          </div>
        </div>
        )}
        <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
          <span className="bg-black rounded-md flex-shrink-0" onClick={() => navigate(-1)}>
            <ChevronRight className="text-white cursor-pointer" height={20} width={20} />
          </span>
          <h1 className="text-lg md:text-xl">حذف طلب نقل</h1>
        </div>
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-6 p-4 md:p-6 bg-white rounded-md"
        >
          <div className="text-center py-8">
            <p className="text-lg text-gray-700 mb-4">
              هل أنت متأكد من حذف طلب النقل <strong>"{displayName}"</strong>؟
            </p>
            <p className="text-sm text-gray-500">لا يمكن التراجع عن هذا الإجراء</p>
          </div>
        </motion.div>
        <div className="flex flex-col items-center font-bold gap-6 p-4 md:p-6 bg-white rounded-md">
          <div className="flex gap-4 w-full">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-4 rounded font-semibold w-1/2 border border-gray-500 bg-transparent text-gray-700 hover:bg-gray-100 transition-colors"
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-4 rounded font-semibold w-1/2 bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              حذف الطلب
            </Button>
          </div>
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