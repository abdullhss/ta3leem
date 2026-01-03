import { Plus } from "lucide-react";
import PDF from "../assets/PDF.svg";
import useMofwad from "../hooks/Mofwad/useMofwad";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function AccountInfo() {
  const userData = useSelector((state) => state.auth.userData);
  const { Mofwad } = useMofwad(userData?.Id);
  const navigate = useNavigate();
  const data = Mofwad?.[0];

  return (
    <div className="p-6 flex flex-col gap-6 w-full">
      <div className="bg-white rounded-lg p-6 flex flex-col gap-4">
        <h1 className="font-bold text-[#828282]">معلومات حساب المفوض</h1>
        <h2 className="text-xl font-bold">{data?.Nationality_Id == 1 ? "مفوض محلي" : "مفوض أجنبي"}</h2>
      </div>

      <div className="flex w-full items-center justify-between gap-6">
        <div className="flex w-full items-center justify-between p-6 rounded-lg bg-white">
          <div className="flex flex-col justify-between gap-2">
            <p className="text-sm font-bold text-[#828282]">الاسم</p>
            <h3 className="text-lg font-bold">{data?.FullName || "-"}</h3>
          </div>
          <div className="flex flex-col justify-between gap-2">
            <p className="text-sm font-bold text-[#828282]">الجنس</p>
            <h3 className="text-lg font-bold">{data?.Gender || "-"}</h3>
          </div>
        </div>

        <div className="flex w-full items-center justify-between p-6 rounded-lg bg-white">
          <div className="flex flex-col justify-between gap-2">
            <p className="text-sm font-bold text-[#828282]">الجنسية</p>
            <h3 className="text-lg font-bold">{data?.Nationality || "-"}</h3>
          </div>
          <div className="flex flex-col justify-between gap-2">
            <p className="text-sm font-bold text-[#828282]">الرقم الوطني</p>
            <h3 className="text-lg font-bold">{data?.NationalNum || "-"}</h3>
          </div>
        </div>
      </div>

      <div className="flex w-full items-start justify-between gap-6">
        <div className="flex flex-col w-full items-center justify-between gap-6 bg-white rounded-lg">
          <div className="flex w-full items-center justify-between p-6">
            <div className="flex flex-col justify-between gap-2">
              <p className="text-sm font-bold text-[#828282]">البريد الإلكتروني</p>
              <h3 className="text-lg font-bold">{data?.Email || "-"}</h3>
            </div>
            <div className="flex flex-col justify-between gap-2">
              <p className="text-sm font-bold text-[#828282]">رقم الهاتف</p>
              <h3 className="text-lg font-bold">{data?.MobileNum || "-"}</h3>
            </div>
          </div>

          <hr className="g-[#C0C0C0] w-4/5" />

          <div className="flex w-full items-center justify-between px-6 pb-6">
            <div className="flex flex-col justify-between gap-2">
              <p className="text-sm font-bold text-[#828282]">اسم الشركة</p>
              <h3 className="text-lg font-bold">{data?.CompanyName || "-"}</h3>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-between p-6 rounded-lg bg-white">
          <div className="flex flex-col justify-between gap-2 w-full">
            <p className="text-sm font-bold text-[#828282]">شهادة سلبية</p>
            <div className="w-full flex items-center justify-between pl-6">
              <div className="flex items-center justify-between gap-2">
                <img src={PDF} alt="certificate" />
                <p className="text-sm font-bold text-[#828282]">
                  {data?.SalbyCertificateAttach ? "مرفق.pdf" : "لا يوجد"}
                </p>
              </div>
              {data?.SalbyCertificateAttach ? (
                <span className="text-sm font-bold text-[#BE8D4A]">عرض</span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-2 border-r border-[#C0C0C0] pr-6 w-full">
            <div className="flex flex-col justify-between gap-2 w-full">
              <p className="text-sm font-bold text-[#828282]">
                مرفق الرقم الوطني
              </p>
              <div className="w-full flex items-center justify-between pl-6">
                <div className="flex items-center justify-between gap-2">
                  <img src={PDF} alt="certificate" />
                  <p className="text-sm font-bold text-[#828282]">
                    {data?.NationalNumAttach ? "مرفق.pdf" : "لا يوجد"}
                  </p>
                </div>
                {data?.NationalNumAttach ? (
                  <span className="text-sm font-bold text-[#BE8D4A]">عرض</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 flex w-full items-center justify-between gap-4">
        <h1 className="font-bold text-lg">مسوغات المفوض</h1>
        <div className="flex items-center gap-2">
          <button className="bg-[#BE8D4A] text-white rounded-md p-0.5" onClick={() => navigate("/add-mofwad-masogat")}>
            <Plus size={16} />
          </button>
          <span className="font-bold text-lg">إضافة المسوغات</span>
        </div>
      </div>
    </div>
  );
}
