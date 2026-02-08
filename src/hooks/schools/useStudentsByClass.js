import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useStudentsByClass = ({School_id, EducationYear_Id, SchoolClass_id, EducationPeriod_id, value, StartNum, Count}) => {
  const [Students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStudentsByClass = async () => {
      try {
        setLoading(true);
        console.log("test1");
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGDxoXnqFOmryhrKLlYh9e3HI=" , `${School_id}#${EducationYear_Id}#${SchoolClass_id}#${EducationPeriod_id}#$????#${value}#${StartNum}#${Count}`);
        console.log("test2");
        console.log(response);
        
        setStudents(response.decrypted.StudentData?JSON.parse(response.decrypted.StudentData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStudentsByClass();
  }, [School_id, EducationYear_Id, SchoolClass_id, EducationPeriod_id, value, StartNum, Count]);

  return { Students, loading, error };
};

export default useStudentsByClass;
