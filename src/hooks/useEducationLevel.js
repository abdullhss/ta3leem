import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useEducationLevel = () => {
  const [EducationLevels, setEducationLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getEducationLevel = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("4vnp4fTxgQv09jtBvkvGgnkScesGMroJZECCCc4ru/s=" , "");
        setEducationLevels(response.decrypted.EducationLevelData?JSON.parse(response.decrypted.EducationLevelData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationLevel();
  }, []);

  return { EducationLevels, loading, error };
};

export default useEducationLevel;
