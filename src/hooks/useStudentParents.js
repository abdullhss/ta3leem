import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useStudentParents = (School_id , value , StartNum , Count) => {
  const [StudentParents, setStudentParents] = useState([]);
  const [StudentParentCount, setStudentParentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState( null);

  useEffect(() => {
    const getStudentParents = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGD1GVmYMmLGCmN5UxwMg7lLo=" ,
          `${School_id}#$????#${value}#${StartNum}#${Count}`);
          console.log(response);
          
        setStudentParents(response.decrypted.StudentParentData?JSON.parse(response.decrypted.StudentParentData):[]);
        setStudentParentCount(response.decrypted.StudentParentCount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStudentParents();
  }, [School_id, value, StartNum, Count]);

  return { StudentParents, StudentParentCount, loading, error };
};

export default useStudentParents;
