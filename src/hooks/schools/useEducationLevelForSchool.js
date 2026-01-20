import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useEducationLevelForSchool = ({school_id}) => {
  const [EducationLevels, setEducationLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getEducationLevelForSchool = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("4vnp4fTxgQv09jtBvkvGggs4ATGO3qbuZBOndwwYXvk=" , `${school_id}`);
        setEducationLevels(response.decrypted.EducationLevelData?JSON.parse(response.decrypted.EducationLevelData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationLevelForSchool();
  }, [school_id]);

  return { EducationLevels, loading, error };
};

export default useEducationLevelForSchool;
