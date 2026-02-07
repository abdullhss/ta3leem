import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleSchoolNewManager = (Mofwad_id , NewManagerRequest_id) => {
  const [SingleSchoolNewManager, setSingleSchoolNewManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Mofwad_id || !NewManagerRequest_id) return;
    const getSingleSchoolNewManager = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1at9jFiPcE8Vd3EZckh/l/Cr3Zwrac3YsMq7bb5Wf98xFJ" , `${Mofwad_id}#${NewManagerRequest_id}#$????`);
        console.log(response);
        setSingleSchoolNewManager(response.decrypted.NewManagerData?JSON.parse(response.decrypted.NewManagerData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleSchoolNewManager();
  }, [Mofwad_id, NewManagerRequest_id]);

  return { SingleSchoolNewManager, loading, error };
};

export default useSingleSchoolNewManager;
