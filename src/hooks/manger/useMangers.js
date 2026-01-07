import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

// -1 all
// 1 Not linked
const useMangers = (isAvailable = -1, searchText = "" , startNumber = 1 , count = 10) => {
  const [Managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const getManagers = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1at+IdVX5sODwMRTKtALzpM3s=" , `${isAvailable}#$????#${searchText}#${startNumber}#${count}`);
        setTotalCount(Number(response.decrypted.MangersCount));
        setManagers(response.decrypted.MangersData?JSON.parse(response.decrypted.MangersData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getManagers();
  }, [isAvailable, searchText, startNumber, count]);

  return { Managers, totalCount, loading, error };
};

export default useMangers;
