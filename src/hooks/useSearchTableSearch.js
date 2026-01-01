import { useCallback, useEffect, useRef, useState } from 'react';

const useSearchTableSearch = ({
  rowsPerPage,
  setSearchValue,
  fetchApi,
  filterState,
  getCleanedFilters,
  formInfo
}) => {
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);

  const onSearchChange = useCallback((value) => {
    setSearchValue(value);
    setLoading(true);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      fetchApi(value, 1, rowsPerPage, getCleanedFilters(filterState), formInfo);
      setLoading(false);
    }, 500); // 500ms debounce
  }, [setSearchValue, fetchApi, rowsPerPage, filterState, getCleanedFilters, formInfo]);

  const onClear = useCallback(() => {
    setSearchValue('');
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    fetchApi('', 1, rowsPerPage, getCleanedFilters(filterState), formInfo);
    setLoading(false);
  }, [setSearchValue, fetchApi, rowsPerPage, filterState, getCleanedFilters, formInfo]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return { onSearchChange, onClear, loading };
};

export default useSearchTableSearch;

