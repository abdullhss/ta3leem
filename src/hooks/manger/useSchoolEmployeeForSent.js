import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolEmployeeForSent = (School_id, type, value, StartNum, Count) => {
  const [SchoolEmployees, setSchoolEmployees] = useState([]);
  const [EmployeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKeyForSent, setRefreshKeyForSent] = useState(0);
  
  useEffect(() => {
    const getSchoolEmployeeForSent = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnP/wNQLTptcTeVMS3Gkpsq4s=" , `${School_id}#${type}#$????#${value}#${StartNum}#${Count}`);
        
        setSchoolEmployees(response.decrypted.SchoolEmployeeData?JSON.parse(response.decrypted.SchoolEmployeeData):[]);
        setEmployeeCount(response.decrypted.SchoolEmployeeCount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolEmployeeForSent();
  }, [School_id, type, value, StartNum, Count, refreshKeyForSent]);

  return { SchoolEmployees, EmployeeCount, loading, error, refreshKeyForSent, setRefreshKeyForSent };
};

export default useSchoolEmployeeForSent;
