import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useStudentStatus = () => {
  const [StudentStatuses, setStudentStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStudentStatuses = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGD4pbvLKeIfcO/kpL6jLkuVQ=" , "");
        setStudentStatuses(response.decrypted.StudentStatusData?JSON.parse(response.decrypted.StudentStatusData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStudentStatuses();
  }, []);

  return { StudentStatuses, loading, error };
};

export default useStudentStatus;
