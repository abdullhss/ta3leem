import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import CreateSchoolForm from "../components/CreateSchool/CreatSchoolForm";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateSchoolRequest() {
  const location = useLocation();
  const [schoolType, setSchoolType] = useState(location?.state?.schoolType || null);
  const [schoolData, setSchoolData] = useState(null);
  const [action, setAction] = useState(0); // 0 = add, 1 = edit, 2 = delete

  const currentYear = new Date().getFullYear();

  // Check if we're in edit/delete mode from navigation state
  useEffect(() => {
    if (location.state) {
      const {
        schoolData: navSchoolData,
        action: navAction,
        schoolType: navSchoolType,
      } = location.state;

      if (navSchoolData && (navAction === 1 || navAction === 2)) {
        setSchoolData(navSchoolData);
        setAction(navAction);

        if (navSchoolType) {
          setSchoolType(navSchoolType);
        } else if (navSchoolData.NewOrExist) {
          setSchoolType(navSchoolData.NewOrExist);
        } else {
          setSchoolType("Exist");
        }
      }
    }
  }, [location.state]);

  return (
    <div className="w-full h-full flex flex-col gap-8 p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {!schoolType && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6 sm:gap-8"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 sm:p-6 bg-white rounded-lg font-bold text-black">
              <span className="text-base sm:text-lg">
                تقديم طلب إنشاء مدرسة
              </span>
              <span className="text-sm sm:text-base">
                {currentYear - 1}/{currentYear}
              </span>
            </div>

            {/* School Type Selection */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-lg font-bold">
              <Button
                onClick={() => setSchoolType("Exist")}
                className="bg-[#C18C46] text-white text-base sm:text-lg w-full md:max-w-[40%]"
              >
                مدرسة قائمة
              </Button>

              <Button
                onClick={() => setSchoolType("New")}
                className="bg-[#C18C46] text-white text-base sm:text-lg w-full md:max-w-[40%]"
              >
                مدرسة جديدة
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {schoolType && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <CreateSchoolForm
              schoolType={schoolType}
              setSchoolType={setSchoolType}
              schoolData={schoolData}
              action={action}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
