import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleSchoolVisit = (Mofwad_id , VisitRequest_id) => {
  const [SingleSchoolVisit, setSingleSchoolVisit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Mofwad_id || !VisitRequest_id) return;
    const getSingleSchoolVisit = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("sA7BMZ65gsUS1jyZzL1at8q9U3SCmQgt4q3iwn6XdaKLXhTus/zoPX7thMp8AKWx" , `${Mofwad_id}#${VisitRequest_id}#$????`);
        console.log(response);
        setSingleSchoolVisit(response.decrypted.SchoolData?JSON.parse(response.decrypted.SchoolData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleSchoolVisit();
  }, [Mofwad_id, VisitRequest_id]);

  return { SingleSchoolVisit, loading, error };
};

export default useSingleSchoolVisit;
