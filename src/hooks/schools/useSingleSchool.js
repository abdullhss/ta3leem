import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleSchool = (schoolId, Office_id) => {
  const [SingleSchool, setSingleSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schoolId || !Office_id) return;

    const getSingleSchool = async () => {
      try {
        setLoading(true);

        const response = await executeProcedure(
          "rM7GhB/s5ooeEPLvYKD+OfQuHxLA9NVlnGTE5sSRSwg=",
          `${schoolId}#${Office_id}#$????`
        );

        const data = response.decrypted;

        const parsedData = {
          mainSchool: data.MainSchoolData
            ? JSON.parse(data.MainSchoolData)[0]
            : null,

          mofwad: data.MofwadData
            ? JSON.parse(data.MofwadData)[0]
            : null,

          committee: data.CommitteeData
            ? JSON.parse(data.CommitteeData)[0]
            : null,

          managerSchool: data.ManagerSchoolData
            ? JSON.parse(data.ManagerSchoolData)
            : null,

          attachments: data.SchoolAttachment
            ? JSON.parse(data.SchoolAttachment)
            : [],

          classes: data.SchoolClasses
            ? JSON.parse(data.SchoolClasses)
            : []
        };

        setSingleSchool(parsedData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleSchool();
  }, [schoolId, Office_id]);

  return { SingleSchool, loading, error };
};

export default useSingleSchool;
