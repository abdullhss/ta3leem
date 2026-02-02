import { useSelector } from 'react-redux';
import useSchoolVisitRequests from '../hooks/Mofwad/useSchoolVisitRequests';

const VisitRequest = () => {
  const userData = useSelector((state) => state.auth.userData);
  const { SchoolVisitRequests, totalCount, loading, error } = useSchoolVisitRequests(userData?.Id, 1);
  console.log(SchoolVisitRequests);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">طلب زيارة</h1>
      <p className="text-gray-600">صفحة طلب زيارة</p>
    </div>
  );
}

export default VisitRequest;