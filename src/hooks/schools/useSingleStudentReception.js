import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleStudentReception = ({School_id, request_id}) => {
  const [SingleStudentReception, setSingleStudentReception] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSingleStudentReception = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGD9A3eC0sEPRWCThYejYHYdnJIvMOyG0kUtwGkLp6FRjI" , `${School_id}#${request_id}#$????`);
        setSingleStudentReception(response.decrypted.StudentTransData?JSON.parse(response.decrypted.StudentTransData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleStudentReception();
  }, [School_id, request_id]);

  return { SingleStudentReception, loading, error };
};

export default useSingleStudentReception;
