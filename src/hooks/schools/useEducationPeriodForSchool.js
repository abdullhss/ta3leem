import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useEducationPeriodForSchool = ({school_id}) => {
  const [EducationPeriods, setEducationPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getEducationPeriodForSchool = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("Le0e8MhFnrV9uM6+miHRRpoxYbez8cu79G/5CoxqPc8=" , `${school_id}`);
        console.log(response);
        
        setEducationPeriods(response.decrypted.EducationPeriodData?JSON.parse(response.decrypted.EducationPeriodData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationPeriodForSchool();
  }, []);

  return { EducationPeriods, loading, error };
};

export default useEducationPeriodForSchool;
