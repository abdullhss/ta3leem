import { useState } from "react";
import { Button } from "../ui/button";
import CreateSchoolForm from "../components/CreateSchool/CreatSchoolForm";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateSchoolRequest() {
  const [schoolType, setSchoolType] = useState(null);

  const currentYear = new Date().getFullYear();

  return (
    <div className="p-6 w-full h-full flex flex-col gap-8">
      
      <AnimatePresence mode="wait">
        {!schoolType && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-8"
          >
            {/* Header */}
            <div className="flex items-center text-black font-bold justify-between gap-2 p-6 bg-white rounded-lg">
              <span>تقديم طلب إنشاء مدرسة</span>
              <span>{currentYear - 1}/{currentYear}</span>
            </div>

            {/* School Type Selection */}
            <div className="flex items-center font-bold justify-between gap-4 p-6 bg-white rounded-lg">
              <Button
                onClick={() => setSchoolType("Exist")}
                className="bg-[#C18C46] text-white text-lg w-full md:max-w-[40%]"
              >
                مدرسة قائمة
              </Button>

              <Button
                onClick={() => setSchoolType("New")}
                className="bg-[#C18C46] text-white text-lg w-full md:max-w-[40%]"
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
          >
            <CreateSchoolForm schoolType={schoolType} setSchoolType={setSchoolType} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
