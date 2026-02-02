import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolRenewRequests = (Mofwad_id, textValue="", StartNum=1, Count=10) => {
  const [SchoolRenewRequests, setSchoolRenewRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!Mofwad_id) return;
    const getSchoolRenewRequests = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1at8bvYeu5Q2BLXmnuaBdujAc=" , `${Mofwad_id}#$????#${textValue}#${StartNum}#${Count}`);
        console.log(response);
        setSchoolRenewRequests(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
        setTotalCount(Number(response.decrypted.SchoolCount));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolRenewRequests();
  }, [Mofwad_id, textValue, StartNum, Count]);

  return { SchoolRenewRequests, totalCount, loading, error };
};

export default useSchoolRenewRequests;
