import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useExamineSchedule = (School_Id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, EducationSecondaryLevelType_Id, EducationPeriod_Id, EducationExamineType_Id, StartNum, Count) => {
  const [examineSchedule, setExamineSchedule] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const getExamineSchedule = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("MePQpwqKMnalHYvrpOSfIJbCc0+ibN73FvW0pimd1SU=" , `${School_Id}#${EducationYear_Id}#${EducationLevel_Id}#${EducationClass_Id}#${EducationSecondaryLevelType_Id}#${EducationPeriod_Id}#${EducationExamineType_Id}#${StartNum}#${Count}`);
        console.log(response);
        
        setTotalCount(Number(response.decrypted.ExamineScheduleCount));
        console.log(JSON.parse(response.decrypted.ExamineScheduleData));
        setExamineSchedule(response.decrypted.ExamineScheduleData ? JSON.parse(response.decrypted.ExamineScheduleData) : []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getExamineSchedule();
  }, [School_Id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, EducationSecondaryLevelType_Id, EducationPeriod_Id, EducationExamineType_Id, StartNum, Count]);

  return { examineSchedule , totalCount , loading, error };
};

export default useExamineSchedule;
