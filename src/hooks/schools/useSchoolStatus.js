import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolStatus = () => {
  const [SchoolStatus, setSchoolStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSchoolStatus = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("PfwA0qnwaRouL/4xix4O/w==","");
        setSchoolStatus(response.decrypted.SchoolStatusData?JSON.parse(response.decrypted.SchoolStatusData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolStatus();
  }, []);

  return { SchoolStatus, loading, error };
};

export default useSchoolStatus;
