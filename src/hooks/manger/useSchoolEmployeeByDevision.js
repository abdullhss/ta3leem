import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolEmployeeByDepartment = (School_id, Devision_id , type , searchText = "", StartNum = 1, Count = 10) => {
  const [SchoolEmployees, setSchoolEmployees] = useState([]);
  const [EmployeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSchoolEmployeeByDepartment = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnP1nXTQdK+7RrktLg1dbdaLLJCDK/WMt0h0Z7uMiG2otL" , `${School_id}#${Devision_id}#${type}#$????#${searchText}#${StartNum}#${Count}`);
        console.log(response);
        
        setSchoolEmployees(response.decrypted.SchoolEmployeeData?JSON.parse(response.decrypted.SchoolEmployeeData):[]);
        setEmployeeCount(response.decrypted.SchoolEmployeeCount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolEmployeeByDepartment();
  }, [School_id, Devision_id, searchText]);

  return { SchoolEmployees, EmployeeCount, loading, error };
};

export default useSchoolEmployeeByDepartment;
