import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useExamineScheduleDetails = (school_id, ExamineSchedule_id, type) => {
  const [examineScheduleDetails, setExamineScheduleDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const getExamineScheduleDetails = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("MePQpwqKMnalHYvrpOSfIJPo/M06XhGx0jjKEwPeyDtaSTlC831jd6wb9ZaqfOT1" , `${school_id}#${ExamineSchedule_id}#${type}#$????`);
        console.log(response);
        
        setExamineScheduleDetails(response.decrypted.ExamineScheduleData ? JSON.parse(response.decrypted.ExamineScheduleData) : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getExamineScheduleDetails();
  }, [school_id, ExamineSchedule_id, type]);

  return { examineScheduleDetails , loading, error };
};

export default useExamineScheduleDetails;
