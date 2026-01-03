import React from 'react'
import { useParams } from 'react-router-dom';
import useSingleSchool from '../hooks/schools/useSingleSchool';

const School = () => {
  const { type, id, Office_id } = useParams();
  console.log(id, Office_id);
  const { SingleSchool, loading, error } = useSingleSchool(id, Office_id);  
  console.log(SingleSchool);
  return (
    <div>
        test
    </div>
  )
}

export default School