import { useCallback, useMemo, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '../ui/pagination';
import { ChevronDownIcon, ExcelIcon, PlusIcon, SearchIcon, VerticalDotsIcon, ViewIcon } from '../utils/Icons.jsx';
import useSearchTableSearch from './useSearchTableSearch.js';
import { useNavigate } from 'react-router-dom';
import GlobalDatePicker from '../global/global-datePicker/GlobalDatePicker.jsx';
import moment from 'moment';
import dayjs from 'dayjs';
import useForm from './useForm.js';
import { cn } from '../lib/utils';
import ActionsDropdown from '../components/ActionsDropdown';

// Simple translation fallback
const useTranslationFallback = () => {
  try {
    const { useTranslation } = require('react-i18next');
    return useTranslation();
  } catch {
    return { t: (key) => key };
  }
};

export const useTable = ({
  data,
  total,
  specialCells,
  fetchApi,
  openModal,
  AddButtonProps: { title, path, action } = {},
  filters,
  showOfficeFilter,
  rowsPerPageDefault = 5,
  isFilteredByDate,
  exportAsExcel,
  setSelectedRowsData,
  topContentExtraData,
  tableTitle = "",
  actionsConfig = []
}) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [searchValue, setSearchValue] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageDefault);
  const [page, setPage] = useState(1);
  const { formInfo, handelDateChange } = useForm({
    fromDate: "",
    toDate: "",
  });

  let initalFilters = {};
  if (showOfficeFilter) {
    initalFilters = {
      officeType: new Set(["-1"])
    };
  }

  const [filterState, setFilterState] = useState(initalFilters);
  const navigate = useNavigate();
  const { t } = useTranslationFallback();
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'id',
    direction: 'descending',
  });

  const getCleanedFilters = (filters) => {
    const cleaned = {};
    for (const key in filters) {
      const arr = Array.from(filters[key]);
      // Filter out 'all' value and empty strings
      const filteredArr = arr.filter(val => val !== '-1' && val !== '');
      if (filteredArr?.length > 0) {
        cleaned[key] = filteredArr.join('&');
      }
    }
    return cleaned;
  };

  const { onSearchChange, onClear, loading } = useSearchTableSearch({
    rowsPerPage,
    setSearchValue,
    fetchApi,
    filterState,
    getCleanedFilters,
    formInfo
  });
  const pages = useMemo(() => {
    return Math.max(1, Math.ceil(total / rowsPerPage));
  }, [total, rowsPerPage]);

  const filteredItems = useMemo(() => {
    return [...data]; // Add client-side filters here if needed
  }, [data]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [filteredItems, sortDescriptor]);

  const renderCell = useCallback(
    (item, columnKey) => {
      const special = specialCells?.find((c) => c.key === columnKey);

      if (special) {
        return special.render(item[columnKey], item);
      }

      if (columnKey === 'actions') {
        // If actionsConfig is provided, use ActionsDropdown
        if (actionsConfig && actionsConfig.length > 0) {
          return <ActionsDropdown actions={actionsConfig} item={item} />;
        }
        // Fallback to modal if no actions config
        return (
          <span
            className="text-primary-200 cursor-pointer"
            onClick={() => openModal?.(item)}
          >
            <VerticalDotsIcon />
          </span>
        );
      }

      if (columnKey.includes('phone')) {
        return <span dir='ltr'>{item[columnKey]}</span>;
      }

      return item[columnKey];
    },
    [openModal, specialCells]
  );

  const OfficeTypeOptions = useMemo(() => [
    { label: t('all'), value: '-1' },
    { label: t('UsageManagement'), value: '0' },
    { label: t('EmploymentOffices'), value: '1' },
    { label: t('LaborOffices'), value: '2' },
  ], [t]);

  const topContent = useMemo(() => (
    <div className='flex flex-col gap-4'>
      {/* First Row: Title (right) and Add Button (left) */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        {tableTitle && (
          <h1 className="text-xl font-bold ">{tableTitle}</h1>
        )}
        {title && (
          <Button 
            className='p-2! bg-transparent min-w-max flex items-center gap-2 text-bold text-base hover:bg-transparent cursor-pointer text-dark' 
            onClick={() => {
              action && action?.()
              path && navigate(path)
            }}
          >
            <PlusIcon height={30} width={30} className="text-primary"/>
            {title}
          </Button>
        )}
        {!tableTitle && !title && <div></div>}
      </div>

      {/* Second Row: Filters (start) and Search (end) - Responsive with wrapping */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Filters Section - Start */}
        <div className="flex flex-wrap gap-3 items-center flex-1 min-w-0">
          {isFilteredByDate && (
            <>
              <div className="w-full sm:w-[180px] min-w-[180px]">
                <GlobalDatePicker
                  label={"تاريخ البداية"}
                  showLabelInside={true}
                  value={formInfo.fromDate ? dayjs(moment(formInfo.fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) : ""}
                  disabledDate={(current) => current && current > moment(formInfo.toDate, 'DD/MM/YYYY').startOf('day')}
                  onChange={(date) => {
                    handelDateChange(date, 'fromDate')
                    const DateData = {
                      fromDate: date ? moment(new Date(date?.$d).toISOString()).format("DD/MM/YYYY") : "",
                      toDate: formInfo.toDate
                    }
                    fetchApi(searchValue, 1, rowsPerPage, getCleanedFilters(filterState), DateData)
                  }}
                />
              </div>
              <div className="w-full sm:w-[180px] min-w-[180px]">
                <GlobalDatePicker
                  label={"تاريخ النهاية"}
                  showLabelInside={true}
                  value={formInfo.toDate ? dayjs(moment(formInfo.toDate, 'DD/MM/YYYY').format('YYYY-MM-DD')) : ""}
                  disabledDate={(current) => current && current < moment(formInfo.fromDate, 'DD/MM/YYYY').startOf('day')}
                  onChange={(date) => {
                    handelDateChange(date, 'toDate')
                    const DateData = {
                      fromDate: formInfo.fromDate,
                      toDate: date ? moment(new Date(date?.$d).toISOString()).format("DD/MM/YYYY") : ""
                    }
                    fetchApi(searchValue, 1, rowsPerPage, getCleanedFilters(filterState), DateData)
                  }}
                />
              </div>
            </>
          )}
          {showOfficeFilter && (
            <div className="w-full sm:w-[180px] min-w-[180px]">
              <Select
                value={Array.from(filterState?.officeType || new Set(["-1"]))[0] || "-1"}
                onValueChange={(value) => {
                  const updatedFilterState = {
                    ...filterState, "officeType": new Set([value])
                  };
                  setFilterState(updatedFilterState);
                  const CleanedFilters = getCleanedFilters(updatedFilterState);
                  fetchApi(searchValue, 1, rowsPerPage, CleanedFilters, formInfo);
                }}
              >
                <SelectTrigger 
                  className="w-full"
                  value={Array.from(filterState?.officeType || new Set(["-1"]))[0] || "-1"}
                  showClearButton={true}
                  onClear={() => {
                    const updatedFilterState = {
                      ...filterState, "officeType": new Set(["-1"])
                    };
                    setFilterState(updatedFilterState);
                    const CleanedFilters = getCleanedFilters(updatedFilterState);
                    fetchApi(searchValue, 1, rowsPerPage, CleanedFilters, formInfo);
                  }}
                >
                  <SelectValue placeholder={t('officeType')} />
                </SelectTrigger>
                <SelectContent>
                  {OfficeTypeOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {filters?.filter(e => !e.hide)?.map((filter, index) => {
            // Use 'all' instead of empty string to fix Radix UI Select error
            const filterOptions = [{ label: t('الكل'), value: '-1' }, ...(filter?.options || [])];
            const currentValue = Array.from(filterState[filter?.key] || new Set())[0] || '-1';
            return (
              <div key={index} className="w-full sm:w-[180px] min-w-[180px]">
                <Select
                  value={currentValue}
                  onValueChange={(value) => {
                    let updatedKeys = new Set([value]);
                    if (value === '-1') {
                      updatedKeys = new Set([]);
                    }
                    const updatedFilterState = {
                      ...filterState,
                      [filter?.key]: updatedKeys,
                    };
                    setFilterState(updatedFilterState);
                    const CleanedFilters = getCleanedFilters(updatedFilterState);
                    fetchApi(searchValue, 1, rowsPerPage, CleanedFilters, formInfo);
                  }}
                >
                  <SelectTrigger 
                    className="w-full"
                    value={currentValue}
                    showClearButton={true}
                    onClear={() => {
                      const updatedFilterState = {
                        ...filterState,
                        [filter?.key]: new Set([]),
                      };
                      setFilterState(updatedFilterState);
                      const CleanedFilters = getCleanedFilters(updatedFilterState);
                      fetchApi(searchValue, 1, rowsPerPage, CleanedFilters, formInfo);
                    }}
                  >
                    <SelectValue placeholder={filter?.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
          {topContentExtraData}
        </div>

        {/* Search Section - End */}
        <div className="relative w-full sm:w-auto sm:min-w-[200px] sm:max-w-[300px] shrink-0">
          <Input
            value={searchValue}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setSelectedRowsData?.([]);
              setSelectedKeys(new Set([]));
              setPage(1);
            }}
            onClear={onClear}
            className='ltr:pl-12 rtl:pr-12 bg-secondary py-3 rounded-lg'
            placeholder={"ابحث هنا..."}
          />
          <span className='absolute ltr:left-3 rtl:right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none'>
            <SearchIcon />
          </span>
          {searchValue && (
            <button
              onClick={onClear}
              className="absolute ltr:right-3 rtl:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  ), [isFilteredByDate, t, formInfo, exportAsExcel, loading, searchValue, onClear, showOfficeFilter, filterState, OfficeTypeOptions, filters, title, tableTitle, topContentExtraData, handelDateChange, fetchApi, rowsPerPage, onSearchChange, setSelectedRowsData, action, path, navigate]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    setSelectedKeys(new Set([]));
    setSelectedRowsData?.([]);
    fetchApi(searchValue, newPage, rowsPerPage, getCleanedFilters(filterState), formInfo);
  }, [setSelectedRowsData, fetchApi, searchValue, rowsPerPage, filterState, formInfo]);

  const handleRowsPerPageChange = useCallback((value) => {
    setRowsPerPage(Number(value));
    setPage(1);
    fetchApi(searchValue, 1, Number(value), getCleanedFilters(filterState), formInfo);
  }, [fetchApi, filterState, formInfo, searchValue]);

  const bottomContent = useMemo(() => {
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(pages, page + 2);
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    const pagingOptions = ["5", "10", "20"];
    if(total > 20){
      pagingOptions.push(String(total));
    }


    return (
      <div className="flex justify-between items-center py-2 px-2">
        <Pagination>
          <PaginationContent dir='ltr'>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => page > 1 && handlePageChange(page - 1)}
                className={cn(page === 1 && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
                </PaginationItem>
                {startPage > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}
            {pageNumbers.map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => handlePageChange(pageNum)}
                  isActive={pageNum === page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            {endPage < pages && (
              <>
                {endPage < pages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(pages)}>{pages}</PaginationLink>
                </PaginationItem>
              </>
            )}
            <PaginationItem>
              <PaginationNext 
                onClick={() => page < pages && handlePageChange(page + 1)}
                className={cn(page === pages && "pointer-events-none opacity-50")}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>العرض</span>
          <Select value={String(rowsPerPage)} onValueChange={handleRowsPerPageChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[70px]">
              {pagingOptions.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>{total}</span>
        </div>
      </div>
    );
  }, [page, pages, handlePageChange, t, sortedItems?.length, handleRowsPerPageChange, rowsPerPage, total]);

  const classNames = useMemo(() => ({
    wrapper: ['h-full', 'w-full'],
    td: ['text-center'],
    th: ['text-center'],
  }), []);

  return {
    bottomContent,
    classNames,
    topContent,
    sortedItems,
    renderCell,
    selectedKeys,
    setSelectedKeys,
    sortDescriptor,
    setSortDescriptor,
  };
};
