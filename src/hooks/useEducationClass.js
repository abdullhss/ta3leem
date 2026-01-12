import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useEducationClass = () => {
  const [EducationClasses, setEducationClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState( null);

  useEffect(() => {
    const getEducationClass = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("zN4r94jJ2t1gQR3zcphNUg4fUvU6qdHFL2KIKBQKFC0=" , "");
        setEducationClasses(response.decrypted.EducationClassData?JSON.parse(response.decrypted.EducationClassData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationClass();
  }, []);

  return { EducationClasses, loading, error };
};

export default useEducationClass;
