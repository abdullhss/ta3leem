import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { useTable } from '../hooks/useTablePage.jsx';
import useGlobalModal from "../hooks/useModal.jsx";
import { setModalContent } from "../store/slices/systemSlice.js";
import { useDispatch } from 'react-redux';
import { cn } from "../lib/utils";

// Simple translation fallback
const useTranslationFallback = () => {
  try {
    const { useTranslation } = require('react-i18next');
    return useTranslation();
  } catch {
    return { t: (key) => key };
  }
};

export default function TablePage({
  data = [],
  columns = [],
  specialCells,
  selectionMode = 'none',
  customRows,
  total = 0,
  fetchApi,
  isLoading = false,
  ModalContent,
  ModalHeader,
  AddButtonProps,
  onDoubleClick,
  specialRowClassName,
  filters,
  showOfficeFilter,
  clickable = true,
  rowsPerPageDefault = 5,
  isFilteredByDate = false,
  exportAsExcel,
  setSelectedRowsData,
  isHeaderSticky,
  topContentExtraData,
  tableTitle,
  actionsConfig = [],
}) {
  const { Modal, openModal } = useGlobalModal()
  const dispatch = useDispatch()
  const { t } = useTranslationFallback();
  const {
    sortedItems,
    bottomContent,
    classNames,
    renderCell,
    topContent,
    setSortDescriptor,
    selectedKeys,
    setSelectedKeys,
    sortDescriptor,
  } = useTable({ data, specialCells, total, fetchApi, openModal, AddButtonProps, filters, showOfficeFilter, rowsPerPageDefault, isFilteredByDate, exportAsExcel, setSelectedRowsData, topContentExtraData, tableTitle, actionsConfig });

  const handleSort = (columnKey) => {
    const direction = 
      sortDescriptor.column === columnKey && sortDescriptor.direction === 'ascending'
        ? 'descending'
        : 'ascending';
    setSortDescriptor({ column: columnKey, direction });
  };

  return (
    <>
      <div className="space-y-4">
        {topContent}
        <div className="rounded-md border">
          <Table>
            <TableHeader className={cn(isHeaderSticky && "sticky top-0 bg-[#F3F3F3] z-10")}>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.uid}
                    className={cn(
                      column.uid === 'actions' ? 'text-center' : 'text-start',
                      'cursor-pointer select-none px-4 py-4',
                      sortDescriptor.column === column.uid && 'font-bold'
                    )}
                    onClick={() => handleSort(column.uid)}
                  >
                    <div className={cn(
                      "flex items-center gap-2",
                      column.uid === 'actions' && "justify-center"
                    )}>
                      {column.name}
                      {sortDescriptor.column === column.uid && (
                        <span>{sortDescriptor.direction === 'ascending' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {sortedItems.map((item, i) => (
                    <TableRow
                      key={item.id ?? `${item.id}-${i}`}
                      onDoubleClick={(e) => {
                        if (!clickable) return;
                        if (onDoubleClick) {
                          onDoubleClick(item)
                          dispatch(setModalContent(item))
                        } else {
                          openModal?.(item)
                        }
                      }}
                      className={cn(
                        i !== 0 && "border-t border-[#E3E3E3]",
                        clickable && "cursor-pointer hover:bg-muted/50",
                        specialRowClassName?.(item)
                      )}
                    >
                      {columns.map((column, index) => (
                        <TableCell
                          key={column.uid}
                          className={cn(
                            column.uid === 'actions' ? 'text-center' : 'text-start',
                            'py-4',
                            index === 0 && "ltr:pl-4 rtl:pr-4",
                            index === columns.length - 1 && "ltr:pr-4 rtl:pl-4",
                          )}
                        >
                          {column.uid === 'actions' ? (
                            <div className="flex justify-center items-center">
                              {renderCell(item, column.uid) || "-"}
                            </div>
                          ) : (
                            renderCell(item, column.uid) || "-"
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {customRows}
                  {/* Pagination as last row */}
                  <TableRow>
                    <TableCell colSpan={columns.length} className="px-4 py-2 border-t border-[#E3E3E3] hover:bg-white" style={{ overflow: 'visible' }}>
                      {bottomContent}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {(!actionsConfig || actionsConfig.length === 0) && (
        <Modal isDismissable={false} title={ModalHeader}>
          {ModalContent}
        </Modal>
      )}
    </>
  );
}
