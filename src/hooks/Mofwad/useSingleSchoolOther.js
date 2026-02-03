import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleSchoolOther = (Mofwad_id , OtherRequest_id) => {
  const [SingleSchoolOther, setSingleSchoolOther] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Mofwad_id || !OtherRequest_id) return;
    const getSingleSchoolOther = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1atz4qlwlDGsX1AyQXAPuOsJEBpBXwlzz2AI8S9gpV7EQZ" , `${Mofwad_id}#${OtherRequest_id}#$????`);
        setSingleSchoolOther(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
        console.log(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleSchoolOther();
  }, [Mofwad_id, OtherRequest_id]);

  return { SingleSchoolOther, loading, error };
};

export default useSingleSchoolOther;
