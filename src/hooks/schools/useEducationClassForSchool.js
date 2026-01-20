import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useEducationClassForSchool = ({school_id}) => {
  const [EducationClasses, setEducationClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState( null);

  useEffect(() => {
    const getEducationClassForSchool = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("zN4r94jJ2t1gQR3zcphNUv1p83WLebQ07QOx+N0qniE=" , `${school_id}`);
        console.log(response);
        
        setEducationClasses(response.decrypted.EducationClassData?JSON.parse(response.decrypted.EducationClassData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationClassForSchool();
  }, [school_id]);

  return { EducationClasses, loading, error };
};

export default useEducationClassForSchool;
