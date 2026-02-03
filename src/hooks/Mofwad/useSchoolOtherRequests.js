import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolOtherRequests = (Mofwad_id , otherType_id = -1 , textValue="", StartNum=1, Count=10, refreshKey = 0) => {
  const [SchoolOtherRequests, setSchoolOtherRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!Mofwad_id) return;
    const getSchoolOtherRequests = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1atyV4Wgh6yYhpOB+jhXUe0Mo=" , `${Mofwad_id}#${otherType_id}#$????#${textValue}#${StartNum}#${Count}`);
        console.log(response);
        setSchoolOtherRequests(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
        setTotalCount(Number(response.decrypted.SchoolCount));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolOtherRequests();
  }, [Mofwad_id, otherType_id, textValue, StartNum, Count, refreshKey]);

  return { SchoolOtherRequests, totalCount, loading, error };
};

export default useSchoolOtherRequests;
