import React, { useState, useEffect } from 'react';
import TablePage from '../components/TablePage';

// Mock data for testing
const mockSchools = [
  { id: 1, name: 'مدرسة النور الابتدائية', address: 'الرياض - حي النرجس', phone: '0112345678', students: 450, status: 'نشط' },
  { id: 2, name: 'مدرسة الأمل المتوسطة', address: 'جدة - حي الزهراء', phone: '0123456789', students: 320, status: 'نشط' },
  { id: 3, name: 'مدرسة المستقبل الثانوية', address: 'الدمام - حي الفيصلية', phone: '0134567890', students: 280, status: 'نشط' },
  { id: 4, name: 'مدرسة العلم الابتدائية', address: 'الرياض - حي العليا', phone: '0119876543', students: 380, status: 'معلق' },
  { id: 5, name: 'مدرسة التميز المتوسطة', address: 'الطائف - حي الشهداء', phone: '0129876543', students: 290, status: 'نشط' },
];

// Columns configuration
const columns = [
  { uid: 'id', name: 'ID' },
  { uid: 'name', name: 'اسم المدرسة' },
  { uid: 'address', name: 'العنوان' },
  { uid: 'phone', name: 'الهاتف' },
  { uid: 'students', name: 'عدد الطلاب' },
  { uid: 'status', name: 'الحالة' },
  { uid: 'actions', name: 'الإجراءات' },
];

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Fetch API function
  const fetchApi = async (search, page, rowsPerPage, filters, dateData) => {
    setLoading(true);
    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock data based on search
      let filteredData = [...mockSchools];
      if (search) {
        filteredData = filteredData.filter(school =>
          school.name.includes(search) ||
          school.address.includes(search) ||
          school.phone.includes(search)
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      setSchools(paginatedData);
      setTotal(filteredData.length);
    } catch (error) {
      console.error('Error fetching schools:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApi('', 1, 5, {}, {});
  }, []);

  // Actions configuration
  const actionsConfig = [
    {
      label: 'تعديل',
      onClick: (item) => {
        console.log('Edit school:', item);
        alert(`تعديل المدرسة: ${item.name}`);
      },
    },
    {
      label: 'حذف',
      onClick: (item) => {
        console.log('Delete school:', item);
        if (window.confirm(`هل أنت متأكد من حذف ${item.name}؟`)) {
          alert(`تم حذف المدرسة: ${item.name}`);
        }
      },
      danger: true,
    },
  ];

  return (
    <div className='bg-white rounded-lg p-4'>
      <TablePage
        data={schools}
        columns={columns}
        total={total}
        fetchApi={fetchApi}
        isLoading={loading}
        filters={[]}
        isFilteredByDate={false}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle="المدارس"
        isHeaderSticky={true}
        actionsConfig={actionsConfig}
      />
    </div>
  );
}
