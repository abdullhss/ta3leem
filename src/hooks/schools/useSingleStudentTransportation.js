import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useSingleStudentTransportation = ({School_id, request_id}) => {
  const [SingleStudentTransportation, setSingleStudentTransportation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(`${School_id}#${request_id}#$????`);
  
  useEffect(() => {
    const getSingleStudentTransportation = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("++LcVz+2MZtpwlF2JKZGDzUZ/+JZ2lgJypMuiibhyeIO/W8GzTEn9+aLgdOHYbDK" , `${School_id}#${request_id}#$????`);
        
        console.log("response", response);
        
        setSingleStudentTransportation(response.decrypted.StudentTransData?JSON.parse(response.decrypted.StudentTransData):[]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getSingleStudentTransportation();
  }, [School_id, request_id]);

  return { SingleStudentTransportation, loading, error };
};

export default useSingleStudentTransportation;
