import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleSchoolTrans = (Mofwad_id , TransRequest_id) => {
  const [SingleSchoolTrans, setSingleSchoolTrans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Mofwad_id || !TransRequest_id) return;
    const getSingleSchoolTrans = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1at2Af89JmtFplfCcctIbdHgjLIg28c9xcQIT8Y8rLEic3" , `${Mofwad_id}#${TransRequest_id}#$????`);
        setSingleSchoolTrans(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
        console.log(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleSchoolTrans();
  }, [Mofwad_id, TransRequest_id]);

  return { SingleSchoolTrans, loading, error };
};

export default useSingleSchoolTrans;
