import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSchoolNewManagers = (Mofwad_id, textValue="", StartNum=1, Count=10, refreshKey = 0) => {
  const [SchoolNewManagers, setSchoolNewManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!Mofwad_id) return;
    const getSchoolNewManagers = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1at65k1yqUxB1THv4oKodRR5Q=" , `${Mofwad_id}#$????#${textValue}#${StartNum}#${Count}`);
        console.log(response);
        setSchoolNewManagers(response.decrypted.NewManagerData?JSON.parse(response.decrypted.NewManagerData):[]);
        setTotalCount(Number(response.decrypted.NewManagerCount));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSchoolNewManagers();
  }, [Mofwad_id, textValue, StartNum, Count, refreshKey]);

  return { SchoolNewManagers, totalCount, loading, error };
};

export default useSchoolNewManagers;
