import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolDevision = (school_id, SchoolDepartment_id, searchText = "") => {
  const [SchoolDevisions, setSchoolDevisions] = useState([]);
  const [DevisionCount, setDevisionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSchoolDevision = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("3KsGHxqjEgxDt0LDyQVnP2y8y7a5dA+qmA3+hAYcWZA=" , `${school_id}#${SchoolDepartment_id}#${searchText}#$????`);
        console.log(response);
        
        setSchoolDevisions(response.decrypted.DevisionData?JSON.parse(response.decrypted.DevisionData):[]);
        setDevisionCount(response.decrypted.DevisionCount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolDevision();
  }, [school_id, SchoolDepartment_id, searchText]);

  return { SchoolDevisions, DevisionCount, loading, error };
};

export default useSchoolDevision;
