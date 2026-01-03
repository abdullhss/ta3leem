import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TablePage from '../components/TablePage';
import useSchools from '../hooks/schools/useSchools';
import useSchoolStatus from '../hooks/schools/useSchoolStatus';
import { toast } from "react-toastify";

// Columns configuration updated to match API data structure
const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'Mofwad_FullName', name: 'المفوض' },
  { uid: 'School_FullName', name: 'اسم المدرسة' },
  { uid: 'Baldia_FullName', name: 'البلدية' },
  { uid: 'OfficeName', name: 'المكتب' },
  { uid: 'LicenseStatus', name: 'حالة الترخيص' },
  { uid: 'ChamberCommerceStatus', name: 'حالة المزاولة' },
  { uid: 'actions', name: 'الإجراءات' },
];


export default function Schools() {
  const { type } = useParams();
  // Map 'new' to 'Exist' and 'old' to 'Old', default to 'Exist'
  const schoolType = type === 'old' ? 'Exist' : 'New';
  
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusId, setStatusId] = useState(-1);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const navigate = useNavigate() ;

  // Calculate startNumber for pagination (1-indexed starting record number)
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  // Pass search, status, pagination, and schoolType to hook - it will refetch when these change
  const { schools, totalCount, loading } = useSchools(
    statusId,
    searchText,
    startNumber,
    rowsPerPage,
    schoolType
  );
  console.log(schools);
  const { SchoolStatus } = useSchoolStatus();
  const statusOptions = SchoolStatus.map(status => ({
    value: status.Id,
    label: status.StatusDesc
  }));
  // Transform data for table - preserve full school data
  const transformDataForTable = (data) => {
    return data.map(school => ({
      id: school.id,
      School_FullName: school.School_FullName || '',
      Mofwad_FullName: school.Mofwad_FullName || '',
      Baldia_FullName: school.Baldia_FullName || '',
      LicenseStatus: school.LicenseStatus || '',
      OfficeName: school.OfficeName || '',
      ChamberCommerceStatus: school.ChamberCommerceStatus || '',
      createdAt: school.createdAt || school.created_at || new Date(),
      // Preserve full school data for edit/delete
      _fullData: school
    }));
  };

  // Fetch API function with search and filters
  const fetchApi = async (search, page, rowsPerPageValue, filters, dateData) => {
    // Update state values which will trigger the hook to refetch
    setSearchText(search || '');
    
    // Get status from filters - use first selected status or -1 if none
    const selectedStatus = filters?.status && filters.status.length > 0 
      ? parseInt(filters.status[0]) 
      : -1;
    setStatusId(selectedStatus);
    
    // Update pagination
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
    
    // Note: The hook will automatically refetch when these state values change
    // Data will be updated via the useEffect below
  };

  // Update table data when schools data changes
  useEffect(() => {
    if (schools) {
      const transformedData = transformDataForTable(schools);
      setTableData(transformedData);
    }
  }, [schools]);

  const canEditOrDelete = (schoolType, schoolStatusId) => {
    if (schoolType === "New") return schoolStatusId === 4
    if (schoolType === "Exist") return schoolStatusId === 1
    return false
  }

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item
        const statusId = data.SchoolStatus_Id
  
        if (!canEditOrDelete(schoolType, statusId)) {
          toast.warning("حالة المدرسة لا تمكنك من هذا الإجراء")
          return
        }
  
        navigate('/requests/create-school', {
          state: {
            schoolData: data,
            action: 1, // edit
            schoolType
          }
        })
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item
        const statusId = data.SchoolStatus_Id
  
        if (!canEditOrDelete(schoolType, statusId)) {
          toast.warning("حالة المدرسة لا تمكنك من هذا الإجراء")
          return
        }
  
        navigate('/requests/create-school', {
          state: {
            schoolData: data,
            action: 2, // delete
            schoolType
          }
        })
      },
    },
  ]

  // Filter configuration
  const filterConfig = [
    {
      key: 'status',
      label: 'الحالة',
      type: 'checkbox',
      options: [
        ...statusOptions,
      ],
      placeholder: 'اختر الحالة',
      resetLabel: 'إعادة ضبط',
      allowMultiple: true,
    }
  ];

  return (
    <div className='bg-white rounded-lg p-4'>
      <TablePage
        data={tableData}
        columns={columns}
        total={totalCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        filters={filterConfig}
        isFilteredByDate={false}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle="المدارس"
        isHeaderSticky={true}
        AddButtonProps={{ title: "إضافة مدرسة", path: "/requests/create-school" }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المدرسة..."
        onDoubleClick={(school)=>{navigate(`${school.id}/${school._fullData.Office_Id}`)}}
      />
    </div>
  );
}