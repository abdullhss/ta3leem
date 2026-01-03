import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useMofwad = (Mofwad_Id) => {
  const [Mofwad, setMofwad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Mofwad_Id) return;
    const getMofwad = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("hRco7sRbMmAbmV+ZrURIUg==" , `${Mofwad_Id}#$????`);
        setMofwad(response.decrypted.MofwadData?JSON.parse(response.decrypted.MofwadData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getMofwad();
  }, [Mofwad_Id]);

  return { Mofwad, loading, error };
};

export default useMofwad;
