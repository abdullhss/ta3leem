import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useEducationPeriod = () => {
  const [EducationPeriods, setEducationPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getEducationPeriods = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("484hCPS9hzlTf0bVUtnTBo/j3awkccGj9F6sv/+UJA4=" , "");
        setEducationPeriods(response.decrypted.EducationPeriodData?JSON.parse(response.decrypted.EducationPeriodData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationPeriods();
  }, []);

  return { EducationPeriods, loading, error };
};

export default useEducationPeriod;
