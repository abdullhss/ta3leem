import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useGenderTypeForSchool = ({school_id}) => {
  const [GenderTypes, setGenderTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getGenderTypeForSchool = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("2UHIuyh/KFDIp4QEXxpHe4PnYtv8Fsa6WiwchQ3o1Kk=" , `${school_id}`);
        setGenderTypes(response.decrypted.SchoolGenderTypeData?JSON.parse(response.decrypted.SchoolGenderTypeData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getGenderTypeForSchool();
  }, [school_id]);

  return { GenderTypes, loading, error };
};

export default useGenderTypeForSchool;
