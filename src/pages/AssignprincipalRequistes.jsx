import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TablePage from '@/components/TablePage'
import useSchoolNewManagers from '@/hooks/Mofwad/useSchoolNewManagers'
import { DoTransaction } from '@/services/apiServices'
import { Button } from '@/ui/button'
import { ConfirmModal } from '@/global/global-modal/ConfirmModal'

const ASSIGN_PRINCIPAL_TABLE_KEY = 'qYqLP6vzFFsEjpCmMpa4eLw4RlAPm7M1iuVVgEnI3zs='

const fadeIn = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

const columns = [
  { uid: 'School_FullName', name: 'اسم المدرسة' },
  { uid: 'RequestDate', name: 'تاريخ الطلب' },
  { uid: 'YearDesc', name: 'السنة الدراسية' },
  { uid: 'oldSchoolManager_FullName', name: 'المدير القديم' },
  { uid: 'newSchoolManager_FullName', name: 'المدير الجديد' },
  { uid: 'Reason', name: 'سبب التكليف' },
  { uid: 'requestStatus', name: 'حالة الطلب' },
  { uid: 'actions', name: 'الإجراءات' },
]

const formatDateToArabic = (dateString) => {
  if (!dateString) return '---'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateString
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 0: return 'معلق'
    case 1: return 'مقبول'
    case 2: return 'مرفوض'
    default: return 'غير معروف'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 0: return 'yellow'
    case 1: return 'green'
    case 2: return 'red'
    default: return 'gray'
  }
}

const AssignprincipalRequistes = () => {
  const userData = useSelector((state) => state.auth.userData)
  const navigate = useNavigate()
  const location = useLocation()

  const isDeleteMode = location.state?.action === 2 && location.state?.assignPrincipalRequest
  const deleteRequestData = location.state?.assignPrincipalRequest
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [tableData, setTableData] = useState([])
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [refreshKey, setRefreshKey] = useState(0)

  const startNumber = (currentPage - 1) * rowsPerPage + 1

  const { SchoolNewManagers, totalCount, loading, error } = useSchoolNewManagers(
    userData?.Id,
    searchText,
    startNumber,
    rowsPerPage,
    refreshKey
  )

  const transformDataForTable = (data) => {
    if (!data || !Array.isArray(data)) return []
    return data.map((request) => ({
      id: request.id,
      School_FullName: request.School_FullName || '',
      RequestDate: formatDateToArabic(request.RequestDate),
      YearDesc: request.YearDesc || '',
      oldSchoolManager_FullName: request.oldSchoolManager_FullName || '',
      newSchoolManager_FullName: request.newSchoolManager_FullName || '',
      Reason: request.Reason || '',
      requestStatus: getStatusLabel(request.ApproveStatus),
      ApproveStatus: request.ApproveStatus,
      _fullData: request,
    }))
  }

  useEffect(() => {
    if (SchoolNewManagers) {
      setTableData(transformDataForTable(SchoolNewManagers))
    }
  }, [SchoolNewManagers])

  const fetchApi = async (search, page, rowsPerPageValue) => {
    setSearchText(search || '')
    setCurrentPage(page)
    setRowsPerPage(rowsPerPageValue)
  }

  const canEditOrDelete = (data) => data?.ApproveStatus === 0

  const handleDeleteAssignPrincipal = async () => {
    const data = deleteRequestData
    if (!data?.id) {
      toast.error('بيانات الطلب غير صحيحة')
      return
    }
    if (!canEditOrDelete(data)) {
      toast.warning('لا يمكن حذف الطلب في حالته الحالية')
      setShowDeleteModal(false)
      return
    }
    try {
      const response = await DoTransaction(ASSIGN_PRINCIPAL_TABLE_KEY, `${data.id}`, 2)
      if (response?.success === 200) {
        toast.success('تم حذف الطلب بنجاح')
        setShowDeleteModal(false)
        setRefreshKey((k) => k + 1)
        navigate(-1)
      } else {
        toast.error(response?.errorMessage || 'فشل في حذف الطلب')
      }
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const actionsConfig = [
    {
      label: 'عرض التفاصيل',
      color: 'primary',
      onClick: (item) => navigate(`/assign-principal-requests/${item.id}`),
    },
    {
      label: 'تعديل',
      onClick: (item) => {
        const data = item._fullData || item
        if (!canEditOrDelete(data)) {
          toast.warning('لا يمكن تعديل الطلب في حالته الحالية')
          return
        }
        navigate('/requests/assign-principal', {
          state: { assignPrincipalRequest: data, action: 1 },
        })
      },
    },
    {
      label: 'حذف',
      danger: true,
      onClick: (item) => {
        const data = item._fullData || item
        if (!canEditOrDelete(data)) {
          toast.warning('لا يمكن حذف الطلب في حالته الحالية')
          return
        }
        navigate('/requests/assign-principal-requests', {
          state: { action: 2, assignPrincipalRequest: data },
          replace: false,
        })
      },
    },
  ]

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="text-center text-red-600 py-8">
          <p>حدث خطأ في تحميل البيانات</p>
          <p className="text-sm text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  if (isDeleteMode && deleteRequestData) {
    const displayName = deleteRequestData.School_FullName || 'هذا الطلب'
    return (
      <div className="flex flex-col gap-6 w-full">
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <ConfirmModal
                desc={`هل أنت متأكد من حذف طلب تكليف المدير "${displayName}"؟`}
                confirmFunc={handleDeleteAssignPrincipal}
                onClose={() => setShowDeleteModal(false)}
              />
            </div>
          </div>
        )}
        <div className="flex items-center font-bold gap-2 p-4 md:p-6 bg-white rounded-md">
          <span className="bg-black rounded-md flex-shrink-0 cursor-pointer" onClick={() => navigate(-1)}>
            <ChevronRight className="text-white" height={20} width={20} />
          </span>
          <h1 className="text-lg md:text-xl">حذف طلب تكليف مدير مدرسة</h1>
        </div>
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-6 p-4 md:p-6 bg-white rounded-md"
        >
          <div className="text-center py-8">
            <p className="text-lg text-gray-700 mb-4">
              هل أنت متأكد من حذف طلب تكليف المدير <strong>"{displayName}"</strong>؟
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
    )
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <TablePage
        data={tableData}
        columns={columns}
        total={totalCount || 0}
        fetchApi={fetchApi}
        isLoading={loading}
        rowsPerPageDefault={5}
        clickable={true}
        tableTitle="طلبات تكليف مدير مدرسة"
        isHeaderSticky={true}
        actionsConfig={actionsConfig}
        searchPlaceholder="ابحث باسم المدرسة أو المدير..."
        onDoubleClick={(item) => {
          const data = item._fullData || item
          navigate(`/assign-principal-requests/${data.id}`)
        }}
        renderCell={(column, item) => {
          if (column.uid === 'requestStatus') {
            const status = item.ApproveStatus
            const statusColor = getStatusColor(status)
            const colorClasses = {
              yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
              green: 'bg-green-100 text-green-800 border border-green-200',
              red: 'bg-red-100 text-red-800 border border-red-200',
              gray: 'bg-gray-100 text-gray-800 border border-gray-200',
            }
            return (
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium w-fit ${colorClasses[statusColor]}`}
              >
                {item.requestStatus}
              </span>
            )
          }
          if (column.uid === 'Reason') {
            return (
              <div className="max-w-xs">
                <span className="text-gray-700 line-clamp-2">{item.Reason || '---'}</span>
              </div>
            )
          }
          return null
        }}
      />
    </div>
  )
}

export default AssignprincipalRequistes
