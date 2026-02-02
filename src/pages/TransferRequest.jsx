import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useSingleSchoolTrans from '../hooks/Mofwad/useSingleSchoolTrans';


const TransferRequests = () => {
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();
  
  const { SingleSchoolTrans, loading, error } = useSingleSchoolTrans(userData?.Id, 1);
  console.log(SingleSchoolTrans);
  
  return (
    <div className='bg-white rounded-lg p-4'>
      
    </div>
  );
};

export default TransferRequests;