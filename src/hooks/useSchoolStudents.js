import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useSchoolStudents = (School_id, isActive, status, value, StartNum, Count) => {
  const [SchoolStudents, setSchoolStudents] = useState([]);
  const [SchoolStudentCount, setSchoolStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState( null);
  
  useEffect(() => {
    const getSchoolStudents = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnP0GDXpF1gU0wap5i6seKbYI=" ,
          `${School_id}#${isActive}#${status}#$????#${value}#${StartNum}#${Count}`);
          console.log(response);
          
        setSchoolStudents(response.decrypted.StudentData?JSON.parse(response.decrypted.StudentData):[]);
        setSchoolStudentCount(response.decrypted.StudentCount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolStudents();
  }, [School_id, isActive, status, value, StartNum, Count]);

  return { SchoolStudents, SchoolStudentCount, loading, error };
};

export default useSchoolStudents;
