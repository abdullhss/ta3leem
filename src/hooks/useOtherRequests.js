import { useEffect, useState } from "react";
import { executeProcedure } from "../services/apiServices";

const useOtherRequests = () => {
  const [OtherRequests, setOtherRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getOtherRequests = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("HFbTy8LSOZJRWF6O2ddX+A==" , "");
        setOtherRequests(response.decrypted.OtherRequestData?JSON.parse(response.decrypted.OtherRequestData):[]);
        console.log(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getOtherRequests();
  }, []);

  return { OtherRequests, loading, error };
};

export default useOtherRequests;
