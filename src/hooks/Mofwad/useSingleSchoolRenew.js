import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleSchoolRenew = (Mofwad_id, RenewRequest_id) => {
  const [SingleSchoolRenew, setSingleSchoolRenew] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Mofwad_id || !RenewRequest_id) return;
    const getSingleSchoolRenew = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1at4VvcBu7poJuRAuUm3q4Gc0MB566yBIaKHFbNflgtYDZ" , `${Mofwad_id}#${RenewRequest_id}#$????`);
        setSingleSchoolRenew(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
        console.log(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleSchoolRenew();
  }, [Mofwad_id, RenewRequest_id]);

  return { SingleSchoolRenew, loading, error };
};

export default useSingleSchoolRenew;
