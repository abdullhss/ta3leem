import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useEducationMaterials = (searchText, IsActive) => {
  const [educationMaterials, setEducationMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const getEducationMaterials = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("484hCPS9hzlTf0bVUtnTBpOv3UuAmrII1p/dn+dHfXo=" , `${searchText}#${IsActive}`);
        setEducationMaterials(response.decrypted.MaterialNameData?JSON.parse(response.decrypted.MaterialNameData):[]);
        setTotalCount(response.decrypted.MaterialNameCount);
        setLoading(false);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationMaterials();
  }, [searchText, IsActive]);

  return { educationMaterials, totalCount, loading, error };
};

export default useEducationMaterials;
