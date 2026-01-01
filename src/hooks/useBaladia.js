import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useBaladia = () => {
  const [Baladias, setBaladias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBaladia = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("a0XulcRw3IbqiW8gAMkGWA==" , "");
        setBaladias(response.decrypted.BaldiaData?JSON.parse(response.decrypted.BaldiaData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getBaladia();
  }, []);

  return { Baladias, loading, error };
};

export default useBaladia;
