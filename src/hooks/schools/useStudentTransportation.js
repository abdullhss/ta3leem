import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useStudentTransportation = ({School_id, Student_id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, SchoolClass_Id, StartNum, Count}) => {
  const [StudentTransportation, setStudentTransportation] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStudentTransportation = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGD7UurfMWBXOEyj+OcdQmypc=" , `${School_id}#${Student_id}#${EducationYear_Id}#${EducationLevel_Id}#${EducationClass_Id}#${SchoolClass_Id}#$????#${StartNum}#${Count}`);
        console.log(response);
        
        setStudentTransportation(response.decrypted.StudentTransData?JSON.parse(response.decrypted.StudentTransData):[]);
        setTotalCount(Number(response.decrypted.StudentTransCount));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStudentTransportation();
  }, [School_id, Student_id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, SchoolClass_Id, StartNum, Count]);

  return { StudentTransportation, totalCount, loading, error };
};

export default useStudentTransportation;
