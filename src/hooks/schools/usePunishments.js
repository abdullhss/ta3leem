import { useEffect, useState, useCallback } from "react";
import { executeProcedure } from "../../services/apiServices";

const usePunishments = (School_id ,  searchText = "", isActive = 1) => {
  const [punishments, setPunishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGD3xK4Q/7PTPPo7+uR4R5Ljk=" , `${School_id}#${searchText}#${isActive}`);
      setPunishments(response.decrypted.PunishmentTypeData ? JSON.parse(response.decrypted.PunishmentTypeData) : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [School_id, searchText, isActive]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { punishments, loading, error, refetch };
};

export default usePunishments;
