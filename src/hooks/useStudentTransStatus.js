import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useStudentTransStatus = () => {
  const [StudentTransStatuses, setStudentTransStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStudentTransStatuses = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGD+nfi9/CslT76pjWRnZKtyE=" , "");
        
        setStudentTransStatuses(response.decrypted.TransStatusData?JSON.parse(response.decrypted.TransStatusData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStudentTransStatuses();
  }, []);

  return { StudentTransStatuses, loading, error };
};

export default useStudentTransStatus;
