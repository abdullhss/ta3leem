import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useStudentReception = ({School_id, Student_id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, StartNum, Count}) => {
  const [StudentReception, setStudentReception] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStudentReception = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGD+oq8nUmzjHrQHGbf141+KY=" , `${School_id}#${Student_id}#${EducationYear_Id}#${EducationLevel_Id}#${EducationClass_Id}#$????#${StartNum}#${Count}`);
        console.log(response);
        //StudentReceptionCount
        //StudentReceptionData
        setStudentReception(response.decrypted.StudentReceptionData?JSON.parse(response.decrypted.StudentReceptionData):[]);
        setTotalCount(Number(response.decrypted.StudentReceptionCount));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getStudentReception();
  }, [School_id, Student_id, EducationYear_Id, EducationLevel_Id, EducationClass_Id, StartNum, Count]);

  return { StudentReception, totalCount, loading, error };
};

export default useStudentReception;
