import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";
import { useSelector } from "react-redux";

const useSchoolEmployees  = (School_id, type, searchText = "", StartNum = 1, Count = 10) => {
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getEmployees = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnPyEB4mGYBwP+8Y/dm+RiOJ4=" , `${School_id}#${type}#$????#${searchText}#${StartNum}#${Count}`);
        setTotalCount(Number(response.decrypted.SchoolEmployeeCount));
        setEmployees(response.decrypted.SchoolEmployeeData ? JSON.parse(response.decrypted.SchoolEmployeeData) : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEmployees();
  }, [School_id, type, searchText, StartNum, Count]);

  return { employees , totalCount , loading, error };
};

export default useSchoolEmployees;
