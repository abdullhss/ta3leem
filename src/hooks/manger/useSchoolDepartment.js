import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolDepartment = (School_id , searchText = "") => {
  const [SchoolDepartments, setSchoolDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    const getSchoolDepartment = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnPylxeeRM0//s45DYYvxocyk=" , `${School_id}#${searchText}#$????`);
        console.log(response);
        
        setSchoolDepartments(response.decrypted.DepartmentData?JSON.parse(response.decrypted.DepartmentData):[]);
        setTotalCount(response.decrypted.DepartmentCount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    getSchoolDepartment();
  }, [School_id, searchText]);

  return { SchoolDepartments , totalCount, loading, error };
};

export default useSchoolDepartment;
