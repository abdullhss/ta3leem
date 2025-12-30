import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useNationality = () => {
  const [nationalities, setNationalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNationality = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("eJjIV7ynzs/m0INIgnx6Dw==" , "");
        setNationalities(response.decrypted.NationalityData?JSON.parse(response.decrypted.NationalityData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getNationality();
  }, []);

  return { nationalities, loading, error };
};

export default useNationality;
