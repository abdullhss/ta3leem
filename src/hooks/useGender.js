import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useGender = () => {
  const [genders, setGenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getGender = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("bpWS34u4fh7jfmkUSv4HrQ==" , "");
        setGenders(response.decrypted.GenderData?JSON.parse(response.decrypted.GenderData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getGender();
  }, []);

  return { genders, loading, error };
};

export default useGender;
