import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useSchoolClass = (School_id, value, StartNum, Count, refreshKey = 0) => {
  const [SchoolClasses, setSchoolClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState( null);

  useEffect(() => {
    const getSchoolClass = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnP0HM/ZUxRR7QZFBFFZ2B5Zg=" , `${School_id}#${value}#${StartNum}#${Count}`);
        setSchoolClasses(response.decrypted.SchoolClassData?JSON.parse(response.decrypted.SchoolClassData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolClass();
  }, [School_id, value, StartNum, Count, refreshKey]);

  return { SchoolClasses, loading, error };
};

export default useSchoolClass;
