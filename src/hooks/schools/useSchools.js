import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";
import { useSelector } from "react-redux";

const useSchools = (status_id = -1 ,searchText="" , startNumber = 1 ,count = 10, schoolType = "Exist") => {
  const [schools, setSchools] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userData  = useSelector((state) => state.auth.userData);
  console.log(schoolType);
  
  useEffect(() => {
    const getSchools = async () => {
      try {
        setLoading(true);
        const schoolTypeValue = schoolType === "New" 
          ? "drlky5mjKYu9NDKsbDQlPZNgYBj1GWa6oe6H+7KcYl4=" 
          : "FwyxXIMtzbiLSTYjdhH1XvGLOwvgoTZ27n/LI1XWLLs=";
        const response = await executeProcedure(schoolTypeValue , `${userData.Id}#${status_id}#$????#${searchText}#${startNumber}#${count}`);
        setTotalCount(Number(response.decrypted.SchoolCount));
        console.log(JSON.parse(response.decrypted.SchoolData));
        
        setSchools(response.decrypted.SchoolData ? JSON.parse(response.decrypted.SchoolData) : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchools();
  }, [status_id , searchText , startNumber , count, schoolType, userData.Id]);

  return { schools , totalCount , loading, error };
};

export default useSchools;
