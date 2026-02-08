import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolsByOffice = ( office_id, status_id = -1 ,searchText="" , startNumber = 1 ,count = 10) => {
  const [schools, setSchools] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log(`${office_id}#${status_id}#$????#${searchText}#${startNumber}#${count}`);
  
  useEffect(() => {
    const getSchoolsByOffice = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("SIORJHyNO1SC6OYr60849wR6R5LP8dsHl1/ZJbP6B/k=" , `${office_id}#${status_id}#$????#${searchText}#${startNumber}#${count}`);
        setTotalCount(Number(response.decrypted.SchoolCount));
        console.log(JSON.parse(response.decrypted.SchoolData));
        
        setSchools(response.decrypted.SchoolData ? JSON.parse(response.decrypted.SchoolData) : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolsByOffice();
  }, [office_id, status_id , searchText , startNumber , count]);

  return { schools , totalCount , loading, error };
};

export default useSchoolsByOffice;
