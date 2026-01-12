import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import useEducationLevel from '../../hooks/useEducationLevel'
import useEducationClass from '../../hooks/useEducationClass'
import { motion } from 'framer-motion'
import useEducationSecondaryLevelType from '../../hooks/useEducationSecondaryLevelType'
import { DoTransaction } from '../../services/apiServices'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import useSchoolClass from '../../hooks/useSchoolClass'
import { ConfirmModal } from '../../global/global-modal/ConfirmModal'
import TablePage from '../../components/TablePage'


const schema = z
.object({
    educationLevelId: z.string().min(1, 'المرحلة الدراسية مطلوبة'),
    classId: z.string().min(1, 'الصف الدراسي مطلوب'),
    semesterName: z.string().min(1, 'اسم الفصل مطلوب'),
    secondaryType: z.string().optional(),
})
.superRefine((data, ctx) => {
    if (data.educationLevelId === '4' && !data.secondaryType) {
    ctx.addIssue({
        path: ['secondaryType'],
        message: 'الشعبة الدراسية مطلوبة',
        code: z.ZodIssueCode.custom,
    })
    }
})

const Groups = () => {
const { EducationLevels } = useEducationLevel()
const { EducationClasses } = useEducationClass()
const { EducationSecondaryLevelTypes } = useEducationSecondaryLevelType();

const [allowedEducationClasses, setAllowedEducationClasses] = useState([])
const [selectedEducationLevelId, setSelectedEducationLevelId] = useState(null)
const [editingId, setEditingId] = useState(null)
const [editingValue, setEditingValue] = useState('')
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [groupToDelete, setGroupToDelete] = useState(null)
const [refreshKey, setRefreshKey] = useState(0)

const userData = useSelector((state) => state.auth.userData);
const { SchoolClasses, loading: groupsLoading } = useSchoolClass(userData.School_Id, "", 1, 10000, refreshKey) ;

const [tableData, setTableData] = useState([])
const [searchText, setSearchText] = useState('')
const [currentPage, setCurrentPage] = useState(1)
const [rowsPerPage, setRowsPerPage] = useState(10)



const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
} = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
})

const educationLevelId = watch('educationLevelId')

useEffect(() => {
    if (educationLevelId) {
    setSelectedEducationLevelId(educationLevelId)
    setAllowedEducationClasses(
        EducationClasses.filter(
        (c) => c.EducationLevel_Id == educationLevelId
        )
    )
    }
}, [educationLevelId])

// Transform API data for table display
const transformDataForTable = (data) => {
    if (!data || !Array.isArray(data)) return []
    return data.map(group => ({
        id: group.id,
        EducationLevel_Description: group.EducationLevel_Description || '-',
        EducationClass_Description: group.EducationClass_Description || '-',
        Descrition: group.Descrition || '-',
        StudentsPerClass: group.StudentsPerClass || 0,
        // Preserve full data for actions
        _fullData: group
    }))
}

// Update table data when SchoolClasses changes
useEffect(() => {
    if (SchoolClasses) {
        const transformedData = transformDataForTable(SchoolClasses)
        setTableData(transformedData)
    }
}, [SchoolClasses])

// Define columns
const columns = [
    { uid: 'EducationLevel_Description', name: 'المرحلة الدراسية' },
    { uid: 'EducationClass_Description', name: 'الصف الدراسي' },
    { uid: 'Descrition', name: 'الفصل الدراسي' },
    { uid: 'StudentsPerClass', name: 'عدد الطلاب' },
    { uid: 'actions', name: 'الإجراءات' },
]

// Fetch function for TablePage
const fetchApi = async (search, page, rowsPerPageValue, filters, dateData) => {
    setSearchText(search || '')
    setCurrentPage(page)
    setRowsPerPage(rowsPerPageValue)
}

const onSubmit = async (data) => {
    console.log(data);
    
    const response = await DoTransaction(
        "KUbay9WUwg+VQubU9YmgKg==" , 
        `0#${userData.School_Id}#${data.educationLevelId}#${data.classId}#${data.semesterName}#${data.secondaryType || ''}` ,
        0 ,
        "Id#School_Id#EducationLevel_Id#EducationClass_Id#Descrition#EducationSecondaryLevelType_Id"
    );
    console.log(response);
    if(response.success != 200){
        toast.error(response.errorMessage || "فشل العملية")
    } else {
        toast.success("تم حفظ المجموعة بنجاح")
        reset()
        setRefreshKey(prev => prev + 1)
    }
}

const handleEdit = (item) => {
    const group = item._fullData || item
    setEditingId(group.id)
    setEditingValue(group.Descrition || '')
}

const handleSaveEdit = useCallback(async (groupId) => {
    if (!editingValue.trim()) {
        toast.error('اسم الفصل الدراسي مطلوب')
        return
    }

    const group = SchoolClasses?.find(g => g.id === groupId)
    if (!group) return

    const response = await DoTransaction(
        "KUbay9WUwg+VQubU9YmgKg==",
        `${groupId}#${group.School_Id}#${group.EducationLevel_Id}#${group.EducationClass_Id}#${editingValue}#${group.EducationSecondaryLevelType_Id || 0}`,
        1, // edit
        "Id#School_Id#EducationLevel_Id#EducationClass_Id#Descrition#EducationSecondaryLevelType_Id"
    )

    if(response.success != 200){
        toast.error(response.errorMessage || "فشل التعديل")
    } else {
        toast.success("تم تعديل المجموعة بنجاح")
        setEditingId(null)
        setEditingValue('')
        setRefreshKey(prev => prev + 1)
    }
}, [editingValue, SchoolClasses])

const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingValue('')
}, [])

const handleDeleteClick = (item) => {
    const group = item._fullData || item
    setGroupToDelete(group)
    setShowDeleteModal(true)
}

// Special cells for inline editing
const specialCells = useMemo(() => [
    {
        key: 'Descrition',
        render: (value, item) => {
            if (editingId === item.id) {
                return (
                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="border rounded-md p-2 flex-1"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveEdit(item.id)
                                } else if (e.key === 'Escape') {
                                    handleCancelEdit()
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                        >
                            حفظ
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600"
                        >
                            إلغاء
                        </button>
                    </div>
                )
            }
            return <span>{value}</span>
        }
    }
], [editingId, editingValue, handleSaveEdit, handleCancelEdit])

// Actions configuration
const actionsConfig = [
    {
        label: 'تعديل',
        onClick: (item) => {
            handleEdit(item)
        },
    },
    {
        label: 'حذف',
        danger: true,
        onClick: (item) => {
            handleDeleteClick(item)
        },
    },
]

const handleDelete = async () => {
    if (!groupToDelete) return

    const groupId = groupToDelete.id || groupToDelete.Id
    
    const response = await DoTransaction(
        "KUbay9WUwg+VQubU9YmgKg==",
        `${groupId}`,
        2, // delete
        "Id"
    )

    if(response.success != 200){
        toast.error(response.errorMessage || "فشل الحذف")
    } else {
        toast.success("تم حذف المجموعة بنجاح")
        setShowDeleteModal(false)
        setGroupToDelete(null)
        setRefreshKey(prev => prev + 1)
    }
}

return (
    <div className="flex flex-col gap-6">
    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <ConfirmModal
            desc={`هل أنت متأكد من حذف المجموعة "${groupToDelete?.Descrition || 'هذه المجموعة'}"؟`}
            confirmFunc={handleDelete}
            onClose={() => {
                setShowDeleteModal(false)
                setGroupToDelete(null)
            }}
            />
        </div>
        </div>
    )}

    <form
    onSubmit={handleSubmit(onSubmit)}
    className="flex flex-col gap-6 p-4 sm:p-6 bg-white rounded-lg"
    >
    <span className="text-lg font-bold">اضافة مجموعة دراسية جديدة</span>

    {/* المرحلة + الصف */}
    <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full flex flex-col gap-2">
        <label>المرحلة الدراسية</label>
        <select
            {...register('educationLevelId')}
            className="border rounded-md p-2 w-full"
        >
            <option value="">اختر المرحلة الدراسية</option>
            {EducationLevels.map((l) => (
            <option key={l.id} value={l.id}>
                {l.Description}
            </option>
            ))}
        </select>
        {errors.educationLevelId && (
            <p className="text-red-500 text-sm">
            {errors.educationLevelId.message}
            </p>
        )}
        </div>

        <div className="w-full flex flex-col gap-2">
        <label>الصف الدراسي</label>
        <select
            {...register('classId')}
            className="border rounded-md p-2 w-full"
        >
            <option value="">اختر الصف الدراسي</option>
            {allowedEducationClasses.map((c) => (
            <option key={c.id} value={c.id}>
                {c.Description}
            </option>
            ))}
        </select>
        {errors.classId && (
            <p className="text-red-500 text-sm">
            {errors.classId.message}
            </p>
        )}
        </div>
    </div>

    {/* اسم الفصل + الشعبة */}
    <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full flex flex-col gap-2">
        <label>الفصل الدراسي</label>
        <input
            {...register('semesterName')}
            className="border rounded-md p-3 w-full"
            placeholder="ادخل اسم الفصل الدراسي"
        />
        {errors.semesterName && (
            <p className="text-red-500 text-sm">
            {errors.semesterName.message}
            </p>
        )}
        </div>

        {educationLevelId === '4' && (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col gap-2"
        >
            <label>الشعبة الدراسية</label>
            <select
            {...register('secondaryType')}
            className="border rounded-md p-2 w-full"
            >
            <option value="">اختر الشعبة الدراسية</option>
            {EducationSecondaryLevelTypes.map((s) => (
            <option key={s.id} value={s.id}>
                {s.Description}
            </option>
            ))}
            </select>
            {errors.secondaryType && (
            <p className="text-red-500 text-sm">
                {errors.secondaryType.message}
            </p>
            )}
        </motion.div>
        )}
    </div>

    {/* Buttons */}
    <div className="flex gap-6">
        <button
        type="button"
        className="border border-red-500 text-red-500 w-full py-3 rounded-md"
        >
        إلغاء
        </button>

        <button
        type="submit"
        disabled={!isValid}
        className={`w-full py-3 rounded-md text-white
            ${isValid ? 'bg-[#BE8D4A]' : 'bg-gray-400 cursor-not-allowed'}
        `}
        >
        حفظ
        </button>
    </div>
    </form>

    {/* Table to view groups */}
    <div className="bg-white rounded-lg p-4">
        <TablePage
            data={tableData}
            columns={columns}
            total={SchoolClasses?.length || 0}
            fetchApi={fetchApi}
            isLoading={groupsLoading}
            filters={[]}
            isFilteredByDate={false}
            rowsPerPageDefault={10}
            clickable={false}
            tableTitle="المجموعات الدراسية"
            isHeaderSticky={true}
            actionsConfig={actionsConfig}
            specialCells={specialCells}
            searchPlaceholder="ابحث في المجموعات الدراسية..."
        />
    </div>
    </div>
  )
}

export default Groups