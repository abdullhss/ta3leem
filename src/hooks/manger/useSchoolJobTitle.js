import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolJobTitle = (searchText = "") => {
  const [SchoolJobTitles, setSchoolJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSchoolEmployeeByDepartment = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnPzVj0Zq5EjVFRE9fNhEQpp0=" , `${searchText}`);
        console.log(response);
        
        setSchoolJobTitles(response.decrypted.SchoolJobTitleData?JSON.parse(response.decrypted.SchoolJobTitleData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolEmployeeByDepartment();
  }, [searchText]);

  return { SchoolJobTitles, loading, error };
};

export default useSchoolJobTitle;
