import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useStudentPunishments = (School_id, Student_id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, SchoolClass_Id, StudentPunishmentType_Id, StartNum, Count) => {
  const [studentPunishments, setStudentPunishments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStudentPunishments = async () => {
      try {
        setLoading(true);
          const response = await executeProcedure("BmS4u+ZsrdUiOBdZll48VJQUZOmfOXwZW+Y+JVq1rVo=" , `${School_id}#${Student_id}#${EducationYear_Id}#${EducationLevel_Id}#${EducationClass_Id}#${SchoolClass_Id}#${StudentPunishmentType_Id}#$????#${StartNum}#${Count}`);
          console.log(response);

        setStudentPunishments(response.decrypted.StudentPunishmentData ? JSON.parse(response.decrypted.StudentPunishmentData) : []);
        setTotalCount(response.decrypted.StudentPunishmentCount);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStudentPunishments();
  }, [School_id, Student_id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, SchoolClass_Id, StudentPunishmentType_Id, StartNum, Count]);

  return { studentPunishments, totalCount, loading, error };
};

export default useStudentPunishments;
