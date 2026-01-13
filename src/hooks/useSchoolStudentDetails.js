import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useSchoolStudentDetails = (School_id, Student_id) => {

const [SchoolStudentDetails, setSchoolStudentDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState( null);

  useEffect(() => {
    // Only fetch if both School_id and Student_id are provided
    if (!School_id || !Student_id) {
      setLoading(false);
      setSchoolStudentDetails([]);
      return;
    }

    const getSchoolStudentDetails = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnP2pg70bCBz1sQlWSfbEFsZE=" ,
          `${School_id}#${Student_id}#$????`);
          
        setSchoolStudentDetails(response.decrypted.StudentData?JSON.parse(response.decrypted.StudentData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolStudentDetails();
  }, [School_id, Student_id]);

  return { SchoolStudentDetails, loading, error };
};

export default useSchoolStudentDetails;
