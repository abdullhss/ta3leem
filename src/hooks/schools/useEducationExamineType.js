import { useEffect, useState } from "react";
import { executeProcedure } from "../../services/apiServices";

const useEducationExamineType = () => {
  const [educationExamineTypes, setEducationExamineTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const getEducationExamineTypes = async () => {
      try {
        setLoading(true);
        const response = await executeProcedure("jIdNRrHpE5bGhM+zZ+mfpASdDLuYwdL4wFE7uPq6XtQ=" , ``);
        setEducationExamineTypes(response.decrypted.EducationExamineTypeData ? JSON.parse(response.decrypted.EducationExamineTypeData) : []);
        
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    getEducationExamineTypes();
  }, []);

  return { educationExamineTypes , loading, error };
};

export default useEducationExamineType;
