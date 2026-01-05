import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleManger = (Manager_id) => {
  const [SingleManger, setSingleManger] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSingleManger = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1atyDFVuW5lpAMRvWPSwk9qvM=" , `${Manager_id}#$????`);
        console.log(response);
        
        setSingleManger(response.decrypted.MangersData?JSON.parse(response.decrypted.MangersData)[0]:{});
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (Manager_id) {
      getSingleManger();
    }
  }, [Manager_id]);

  return { SingleManger, loading, error };
};

export default useSingleManger;
