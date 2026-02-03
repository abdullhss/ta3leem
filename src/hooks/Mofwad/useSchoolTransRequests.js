import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolTransRequests = (Mofwad_Id , searchText = "", StartNum = 1, Count = 10, refreshKey = 0) => {
  const [SchoolTransRequests, setSchoolTransRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!Mofwad_Id) return;
    const getMofwad = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1atz+i3XliR6M7dLQqQoUdh0k=" , `${Mofwad_Id}#$????#${searchText}#${StartNum}#${Count}`);
        setSchoolTransRequests(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
        setTotalCount(Number(response.decrypted.SchoolCount));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getMofwad();
  }, [Mofwad_Id, searchText, StartNum, Count, refreshKey]);

  return { SchoolTransRequests, totalCount, loading, error };
};

export default useSchoolTransRequests;
