import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from "react-toastify";
import TablePage from '../../components/TablePage';
import useSchoolEmployees from '../../hooks/schools/useSchoolsEmployees';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import useSchoolEmployeeForSent from '../../hooks/manger/useSchoolEmployeeForSent';
import { Checkbox } from '../../ui/checkbox';
import { DoTransaction } from '@/services/apiServices';

const Employees = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const [showSendToReviewModal, setShowSendToReviewModal] = useState(false);
  const [currentPageForSent, setCurrentPageForSent] = useState(1);
  const [rowsPerPageForSent, setRowsPerPageForSent] = useState(5);
  const [selectedEmployees, setSelectedEmployees] = useState([]); // State for checked employees
  const startNumberForSent = (currentPageForSent - 1) * rowsPerPageForSent + 1;
  
  const { SchoolEmployees: SchoolEmployeesForSent, EmployeeCount: EmployeeCountForSent, loading: loadingForSent, error: errorForSent, refreshKeyForSent, setRefreshKeyForSent } = useSchoolEmployeeForSent(userData.School_Id, -1, searchText, startNumberForSent, rowsPerPageForSent);
  
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

  // Reset selected employees when modal opens/closes
  useEffect(() => {
    if (showSendToReviewModal) {
      setSelectedEmployees([]);
    }
  }, [showSendToReviewModal]);

  // Handle checkbox change for employee selection
  const handleEmployeeSelect = (employeeId, isChecked) => {
    if (isChecked) {
      // Add employee to selected array
      setSelectedEmployees(prev => [...prev, employeeId]);
    } else {
      // Remove employee from selected array
      setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    }
  };

  // Handle "Select All" functionality
  const handleSelectAll = (isChecked) => {
    if (isChecked && SchoolEmployeesForSent) {
      // Select all employee IDs
      const allIds = SchoolEmployeesForSent.map(employee => employee.id);
      setSelectedEmployees(allIds);
    } else {
      // Clear all selections
      setSelectedEmployees([]);
    }
  };

  // Handle send button click
  const handleSendToReview = () => {
    // Close the modal
    sendEmployeesToReview(selectedEmployees);
    setShowSendToReviewModal(false);
  };

  // Check if employee can be edited or deleted based on status
  const canEditOrDelete = (employee) => {
    return employee.IsApproved === 0;
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
  
  // Modified columns for modal table with select checkbox
  const columnsForSent = [
    { 
      uid: 'select', 
      name: (
        <div className="flex items-center">
          <Checkbox
            checked={SchoolEmployeesForSent && selectedEmployees.length === SchoolEmployeesForSent.length}
            onCheckedChange={handleSelectAll}
            className="ml-2 mx-4"
          />
          اختر الكل
        </div>
      )
    },
    { uid: 'id', name: 'ID' },
    { uid: 'FullName', name: 'الاسم الكامل' },
    { uid: 'MobileNum', name: 'رقم الهاتف' },
  ];

  const sendEmployeesToReview = async (IdsArray) => {
    IdsArray.map(async (empid)=>{
      const response = await DoTransaction(
        "ps1zVpV4q7/4qh8wV8pzqA==",
        `${empid}#True#${userData.id}#default`,
        1,
        "Id#IsSent#SentBy#SentDate"
      );
      if(response.success != 200){
        toast.error(response.errorMessage || "فشل إرسال الكوادر لمكتب المراجعة");
        return;
      }
      toast.success("تم إرسال الكوادر لمكتب المراجعة بنجاح");
      setRefreshKeyForSent(refreshKeyForSent + 1);
    })
  }

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
        AddButtonProps={[
          { 
            title: "إضافة موظف جديد", 
            path: "/Employees/Add" 
          },
          { 
            title: "إضافة عقد للموظف", 
            path: "/Employees/Contracts/Add" 
          },
          { 
            title: "إرسال الكوادر لمكتب المراجعة", 
            action: () => {
              setShowSendToReviewModal(true);
            }, 
            className : "bg-[#BE8D4A] text-white hover:bg-[#BE8D4A]/90" ,
            noPlusIcon: true
          },
        ]}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم الموظف أو البريد الإلكتروني..."
        errorMessage={error ? "فشل في تحميل بيانات الموظفين" : null}
        noDataMessage="لا توجد موظفين"
      />
      
      <Dialog open={showSendToReviewModal} onOpenChange={setShowSendToReviewModal}>
        <DialogContent className="w-full max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-right">إرسال الكوادر لمكتب المراجعة</DialogTitle>
          </DialogHeader>
          <div className='overflow-x-auto'>
            <TablePage
              data={SchoolEmployeesForSent}
              columns={columnsForSent}
              total={Number(EmployeeCountForSent)}
              isLoading={loadingForSent}
              isFilteredByDate={false}
              rowsPerPageDefault={5}
              onDoubleClick={false}
              specialCells={[
                {
                  key: 'select',
                  render: (param , item) => {
                    console.log(item);
                    
                    return (
                      <Checkbox 
                        checked={selectedEmployees.includes(item.id)}
                        onCheckedChange={(checked) => {
                          handleEmployeeSelect(item.id, checked);
                        }}
                        className="w-4 h-4 mx-4"
                      />
                    );
                  },
                },
                {
                  key: 'IsApproved',
                  render: (item) => {
                    // You can customize this based on your actual IsApproved values
                    const statusText = item.IsApproved === 1 ? 'مقبول' : 
                                      item.IsApproved === 0 ? 'قيد المراجعة' : 
                                      item.IsApproved === -1 ? 'مرفوض' : 'غير معروف';
                    
                    const statusColor = item.IsApproved === 1 ? 'text-green-600' : 
                                       item.IsApproved === 0 ? 'text-yellow-600' : 
                                       item.IsApproved === -1 ? 'text-red-600' : 'text-gray-600';
                    
                    return (
                      <span className={`font-medium ${statusColor}`}>
                        {statusText}
                      </span>
                    );
                  },
                }
              ]}
            />
          </div>
          <div className="mt-4 text-right">
            <p className="text-sm text-gray-600">
              تم اختيار {selectedEmployees.length} من أصل {SchoolEmployeesForSent?.length || 0} موظف
            </p>
          </div>
          <DialogFooter className="w-full flex items-center gap-4">
            <Button 
              className="w-full" 
              onClick={handleSendToReview}
              disabled={selectedEmployees.length === 0}
            >
              إرسال ({selectedEmployees.length})
            </Button>
            <Button 
              className="w-full text-red-500 bg-white border border-red-500 hover:bg-red-600 hover:text-white" 
              onClick={() => setShowSendToReviewModal(false)}
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;