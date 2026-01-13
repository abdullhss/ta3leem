import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import TablePage from '../../components/TablePage';
import useSchoolStudents from '../../hooks/useSchoolStudents';
import useStudentStatus from '../../hooks/useStudentStatus';
import { toast } from "react-toastify";

// Columns configuration based on student data structure
const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'FullName', name: 'الاسم الكامل' },
  // { uid: 'MotherName', name: 'اسم الأم' },
  { uid: 'Gender_Name', name: 'الجنس' },
  { uid: 'EducationLevel_Description', name: 'المرحلة التعليمية' },
  { uid: 'EducationClass_Description', name: 'الصف التعليمي' },
  { uid: 'SchoolClass_Description', name: 'الصف المدرسي' },
  { uid: 'StudentStatus_Description', name: 'حالة الطالب' },
  { uid: 'IsActive', name: 'الحالة' },
  { uid: 'actions', name: 'الإجراءات' },
];

const Students = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusId, setStatusId] = useState(-1);
  const [isActive, setIsActive] = useState(1); // 1 for active, -1 for all
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Calculate startNumber for pagination (1-indexed starting record number)
  const startNumber = (currentPage - 1) * rowsPerPage + 1;
  
  // Pass search, status, pagination to hook - it will refetch when these change
  const { SchoolStudents, SchoolStudentCount, loading, error } = useSchoolStudents(
    userData.School_Id,
    isActive,
    statusId,
    searchText,
    startNumber,
    rowsPerPage
  );
  
  const { StudentStatuses } = useStudentStatus();
  const statusOptions = StudentStatuses.map(status => ({
    value: status.Id,
    label: status.StatusDesc
  }));
  
  // Transform data for table - preserve full student data
  const transformDataForTable = (data) => {
    return data.map(student => ({
      id: student.id,
      FullName: student.FullName || '',
      MotherName: student.MotherName || '',
      Gender_Name: student.Gender_Name || '',
      EducationLevel_Description: student.EducationLevel_Description || '',
      EducationClass_Description: student.EducationClass_Description || '',
      SchoolClass_Description: student.SchoolClass_Description || '',
      StudentStatus_Description: student.StudentStatus_Description || '',
      IsActive: student.IsActive ? 'نشط' : 'غير نشط',
      createdAt: student.createdAt || student.created_at || new Date(),
      // Preserve full student data for edit/delete
      _fullData: student
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
    
    // Get active status from filters
    // 1 = active only, -1 = all (both active and inactive)
    if (filters?.isActive && filters.isActive.length > 0) {
      const activeFilter = filters.isActive[0];
      setIsActive(activeFilter === 'all' ? -1 : 1);
    } else {
      setIsActive(1); // Default to active only
    }
    
    // Update pagination
    setCurrentPage(page);
    setRowsPerPage(rowsPerPageValue);
    
    // Note: The hook will automatically refetch when these state values change
    // Data will be updated via the useEffect below
  };

  // Update table data when students data changes
  useEffect(() => {
    if (SchoolStudents) {
      const transformedData = transformDataForTable(SchoolStudents);
      setTableData(transformedData);
    }
  }, [SchoolStudents]);

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item;
        navigate('/education-levels/students/add', {
          state: {
            studentData: data,
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
        navigate('/education-levels/students/add', {
          state: {
            studentData: data,
            action: 2 // delete
          }
        });
      },
    },
  ];

  // Filter configuration
  const filterConfig = [
    {
      key: 'status',
      label: 'حالة الطالب',
      type: 'checkbox',
      options: [
        ...statusOptions,
      ],
      placeholder: 'اختر الحالة',
      resetLabel: 'إعادة ضبط',
      allowMultiple: true,
    },
    {
      key: 'isActive',
      label: 'الحالة',
      type: 'checkbox',
      options: [
        { value: 'active', label: 'نشط فقط' },
        { value: 'all', label: 'الكل' },
      ],
      placeholder: 'اختر الحالة',
      resetLabel: 'إعادة ضبط',
      allowMultiple: false,
    }
  ];

  return (
    <div className='bg-white rounded-lg p-4'>
      <TablePage
        data={tableData}
        columns={columns}
        total={SchoolStudentCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        filters={filterConfig}
        isFilteredByDate={false}
        rowsPerPageDefault={10}
        clickable={true}
        tableTitle="الطلاب"
        isHeaderSticky={true}
        AddButtonProps={{ title: 'إضافة طالب', path: "/education-levels/students/add" }}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم الطالب..."
        onDoubleClick={(student) => {
          // Handle double click if needed
          console.log('Student clicked:', student);
        }}
      />
    </div>
  );
};

export default Students;