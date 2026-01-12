import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useEducationSecondaryLevelType = () => {
  const [EducationSecondaryLevelTypes, setEducationSecondaryLevelTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getEducationSecondaryLevelType = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("CqBKVlkbI9bhVcHF/qP9IC7n52EFCcnHwF5JpQSWxSM=" , "");
        setEducationSecondaryLevelTypes(response.decrypted.SecondaryTypeData?JSON.parse(response.decrypted.SecondaryTypeData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationSecondaryLevelType();
  }, []);

  return { EducationSecondaryLevelTypes, loading, error };
};

export default useEducationSecondaryLevelType;
