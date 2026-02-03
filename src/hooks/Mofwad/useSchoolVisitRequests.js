import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolVisitRequests = (Mofwad_id, textValue="", StartNum=1, Count=10, refreshKey = 0) => {
  const [SchoolVisitRequests, setSchoolVisitRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!Mofwad_id) return;
    const getSchoolVisitRequests = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1atzFlNT2gFSNi9+URfocc3K0=" , `${Mofwad_id}#$????#${textValue}#${StartNum}#${Count}`);
        console.log(response);
        setSchoolVisitRequests(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
        setTotalCount(Number(response.decrypted.SchoolCount));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolVisitRequests();
  }, [Mofwad_id, textValue, StartNum, Count, refreshKey]);

  return { SchoolVisitRequests, totalCount, loading, error };
};

export default useSchoolVisitRequests;
