import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useBaldiaOffice = (BaldiaId) => {
  const [BaldiaOffice, setBaldiaOffice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBaldiaOffice = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("y3MVu4LFM0V874xK+k3hYQ==" ,BaldiaId);
        setBaldiaOffice(response.decrypted.OfficeData?JSON.parse(response.decrypted.OfficeData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    getBaldiaOffice();
  }, [BaldiaId]);

  return { BaldiaOffice, loading, error };
};

export default useBaldiaOffice;
