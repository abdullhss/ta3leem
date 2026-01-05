import { Pencil, Plus } from "lucide-react";
import PDF from "../assets/PDF.svg";
import useMofwad from "../hooks/Mofwad/useMofwad";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import FileViewer from "../components/FileViewer";

export default function AccountInfo() {
  const userData = useSelector((state) => state.auth.userData);
  const { Mofwad } = useMofwad(userData?.Id);
  const navigate = useNavigate();
  const data = Mofwad?.[0];

  // Check if all required attachments are provided and not 0
  const hasAllAttachments = () => {
    const requiredAttachments = [
      data?.WorkOfficeStatementAttach,
      data?.SecurityCardAttach,
      data?.PictureAttach,
      data?.HealthCardAttach,
      data?.BirthCertificateAttach,
    ];
    
    // Add WorkforceCardAttach only for non-nationals (nationality != 1)
    if (data?.Nationality_Id != 1) {
      requiredAttachments.push(data?.WorkforceCardAttach);
    }
    
    return requiredAttachments.every(attach => attach && attach !== 0);
  };

  const allAttachmentsProvided = hasAllAttachments();

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6 w-full">
      {/* Header Section */}
      <div className="bg-white rounded-lg p-4 md:p-6 flex flex-col gap-3 md:gap-4">
        <h1 className="font-bold text-[#828282] text-sm md:text-base">معلومات حساب المفوض</h1>
        <h2 className="text-lg md:text-xl font-bold">{data?.Nationality_Id == 1 ? "مفوض محلي" : "مفوض أجنبي"}</h2>
      </div>

      {/* Personal Info Section */}
      <div className="flex flex-col lg:flex-row w-full items-stretch justify-between gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row w-full items-stretch justify-between p-4 md:p-6 rounded-lg bg-white gap-4 md:gap-0">
          <div className="flex flex-col justify-between gap-1 md:gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <p className="text-xs md:text-sm font-bold text-[#828282]">الاسم</p>
            <h3 className="text-base md:text-lg font-bold">{data?.FullName || "-"}</h3>
          </div>
          <div className="flex flex-col justify-between gap-1 md:gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <p className="text-xs md:text-sm font-bold text-[#828282]">الجنس</p>
            <h3 className="text-base md:text-lg font-bold">{data?.Gender || "-"}</h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row w-full items-stretch justify-between p-4 md:p-6 rounded-lg bg-white gap-4 md:gap-0">
          <div className="flex flex-col justify-between gap-1 md:gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <p className="text-xs md:text-sm font-bold text-[#828282]">الجنسية</p>
            <h3 className="text-base md:text-lg font-bold">{data?.Nationality || "-"}</h3>
          </div>
          <div className="flex flex-col justify-between gap-1 md:gap-2 w-full sm:w-1/2 lg:w-full xl:w-1/2">
            <p className="text-xs md:text-sm font-bold text-[#828282]">الرقم الوطني</p>
            <h3 className="text-base md:text-lg font-bold">{data?.NationalNum || "-"}</h3>
          </div>
        </div>
      </div>

      {/* Contact & Documents Section */}
      <div className="flex flex-col lg:flex-row w-full items-stretch justify-between gap-4 md:gap-6">
        {/* Contact Info Card */}
        <div className="flex flex-col w-full items-stretch justify-between gap-4 md:gap-6 bg-white rounded-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row w-full items-stretch justify-between gap-4 md:gap-0">
            <div className="flex flex-col justify-between gap-1 md:gap-2 w-full sm:w-1/2">
              <p className="text-xs md:text-sm font-bold text-[#828282]">البريد الإلكتروني</p>
              <h3 className="text-base md:text-lg font-bold truncate">{data?.Email || "-"}</h3>
            </div>
            <div className="flex flex-col justify-between gap-1 md:gap-2 w-full sm:w-1/2">
              <p className="text-xs md:text-sm font-bold text-[#828282]">رقم الهاتف</p>
              <h3 className="text-base md:text-lg font-bold">{data?.MobileNum || "-"}</h3>
            </div>
          </div>

          <hr className="border-[#C0C0C0] w-full" />

          <div className="flex w-full">
            <div className="flex flex-col justify-between gap-1 md:gap-2 w-full">
              <p className="text-xs md:text-sm font-bold text-[#828282]">اسم الشركة</p>
              <h3 className="text-base md:text-lg font-bold">{data?.CompanyName || "-"}</h3>
            </div>
          </div>
        </div>

        {/* Certificates Card */}
        <div className="flex flex-col md:flex-row w-full items-stretch justify-between p-4 md:p-6 rounded-lg bg-white gap-4 md:gap-6 h-fit">
          <div className="flex flex-col  gap-1 md:gap-2 w-full md:w-1/2">
            <p className="text-xs md:text-sm font-bold text-[#828282]">شهادة سلبية</p>
            <div className="w-full flex items-center justify-between md:pl-6">
              <div className="flex items-center gap-2">
                <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                  {data?.SalbyCertificateAttach ? "مرفق.pdf" : "لا يوجد"}
                </p>
              </div>
              {data?.SalbyCertificateAttach ? (
                <FileViewer 
                  id={data.SalbyCertificateAttach}
                  customButton={<span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">عرض</span>}
                />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-1 md:gap-2 w-full md:w-1/2 md:border-r md:border-[#C0C0C0] md:pr-6">
            <div className="flex flex-col justify-between gap-1 md:gap-2 w-full">
              <p className="text-xs md:text-sm font-bold text-[#828282]">
                مرفق الرقم الوطني
              </p>
              <div className="w-full flex items-center justify-between md:pl-6">
                <div className="flex items-center gap-2">
                  <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                  <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                    {data?.NationalNumAttach ? "مرفق.pdf" : "لا يوجد"}
                  </p>
                </div>
                {data?.NationalNumAttach ? (
                  <FileViewer 
                    id={data.NationalNumAttach}
                    customButton={<span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">عرض</span>}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attachments Header Section */}
      <div className="bg-white rounded-lg p-4 md:p-6 flex flex-col sm:flex-row w-full items-center justify-between gap-3 md:gap-4">
        <h1 className="font-bold text-base md:text-lg">مسوغات المفوض</h1>
        <div className="flex items-center gap-2">
          <button 
            className="bg-[#BE8D4A] text-white rounded-md p-0.5 md:p-1" 
            onClick={() => navigate("/add-mofwad-masogat")}
          >
            {allAttachmentsProvided ? <Pencil size={14} md:size={16} /> : <Plus size={14} md:size={16} />}
          </button>
          <span className="font-bold text-sm md:text-lg">
            {allAttachmentsProvided ? "تعديل" : "إضافة"} المسوغات
          </span>
        </div>
      </div>
      
      {/* Attachments Section */}
      <div className="rounded-lg">
        <div className="flex flex-col gap-4 md:gap-6">

          {/* First Row: Personal Photos & Birth/Health Cards */}
          <div className="flex flex-col lg:flex-row w-full items-stretch justify-between gap-4 md:gap-6">
            {/* Personal Photos Card */}
            <div className="w-full bg-white rounded-lg p-4 md:p-6 h-full">
              <div className="flex flex-col justify-between gap-1 md:gap-2 w-full">
                <p className="text-xs md:text-sm font-bold text-[#828282] mb-2">الصور الشخصية</p>
                <div className="w-full flex items-center justify-between md:pl-6">
                  <div className="flex items-center gap-2">
                    <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                    <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                      {data?.PictureAttach ? "مرفق.pdf" : "لا يوجد"}
                    </p>
                  </div>
                  {data?.PictureAttach ? (
                    <FileViewer 
                      id={data.PictureAttach}
                      customButton={<span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">عرض</span>}
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Birth Certificate & Health Card */}
            <div className="flex w-full h-full">
              <div className="flex flex-col md:flex-row w-full items-stretch justify-between p-4 md:p-6 rounded-lg bg-white gap-4 md:gap-6">
                <div className="flex flex-col justify-between gap-1 md:gap-2 w-full md:w-1/2">
                  <p className="text-xs md:text-sm font-bold text-[#828282]">شهادة ميلاد</p>
                  <div className="w-full flex items-center justify-between md:pl-6">
                    <div className="flex items-center gap-2">
                      <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                      <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                        {data?.BirthCertificateAttach ? "مرفق.pdf" : "لا يوجد"}
                      </p>
                    </div>
                    {data?.BirthCertificateAttach ? (
                      <FileViewer 
                        id={data.BirthCertificateAttach}
                        customButton={<span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">عرض</span>}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-1 md:gap-2 w-full md:w-1/2 md:border-r md:border-[#C0C0C0] md:pr-6">
                  <div className="flex flex-col justify-between gap-1 md:gap-2 w-full">
                    <p className="text-xs md:text-sm font-bold text-[#828282]">
                      البطاقة الصحية
                    </p>
                    <div className="w-full flex items-center justify-between md:pl-6">
                      <div className="flex items-center gap-2">
                        <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                        <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                          {data?.HealthCardAttach ? "مرفق.pdf" : "لا يوجد"}
                        </p>
                      </div>
                      {data?.HealthCardAttach ? (
                        <FileViewer 
                          id={data.HealthCardAttach}
                          customButton={<span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">عرض</span>}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last Row: Security, Work Office, and Workforce Cards */}
          <div className="w-full">
            <div
              className="
                grid 
                grid-cols-1 
                md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]
                gap-4 md:gap-6
                p-4 md:p-6 
                rounded-lg 
                bg-white
              "
            >
              {/* Security Card */}
              <div className="flex flex-col justify-between gap-1 md:gap-2 md:border-r md:border-[#C0C0C0] md:pr-6">
                <p className="text-xs md:text-sm font-bold text-[#828282]">
                  الخلو من السوابق الجنائية
                </p>

                <div className="w-full flex items-center justify-between md:pl-6">
                  <div className="flex items-center gap-2">
                    <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                    <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                      {data?.SecurityCardAttach ? "مرفق.pdf" : "لا يوجد"}
                    </p>
                  </div>

                  {data?.SecurityCardAttach && (
                    <FileViewer
                      id={data.SecurityCardAttach}
                      customButton={
                        <span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">
                          عرض
                        </span>
                      }
                    />
                  )}
                </div>
              </div>

              {/* Work Office Statement */}
              <div className="flex flex-col justify-between gap-1 md:gap-2 md:border-r md:border-[#C0C0C0] md:pr-6">
                <p className="text-xs md:text-sm font-bold text-[#828282]">
                  إفادة من مكتب العمل
                </p>

                <div className="w-full flex items-center justify-between md:pl-6">
                  <div className="flex items-center gap-2">
                    <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                    <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                      {data?.WorkOfficeStatementAttach ? "مرفق.pdf" : "لا يوجد"}
                    </p>
                  </div>

                  {data?.WorkOfficeStatementAttach && (
                    <FileViewer
                      id={data.WorkOfficeStatementAttach}
                      customButton={
                        <span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">
                          عرض
                        </span>
                      }
                    />
                  )}
                </div>
              </div>

              {/* Workforce Card (Conditional) */}
              {data?.Nationality_Id != 1 && (
                <div className="flex flex-col justify-between gap-1 md:gap-2">
                  <p className="text-xs md:text-sm font-bold text-[#828282]">
                    بطاقة القوى العاملة
                  </p>

                  <div className="w-full flex items-center justify-between md:pl-6">
                    <div className="flex items-center gap-2">
                      <img src={PDF} alt="certificate" className="w-6 h-6 md:w-auto md:h-auto" />
                      <p className="text-xs md:text-sm font-bold text-[#828282] truncate max-w-[100px] md:max-w-none">
                        {data?.WorkforceCardAttach ? "مرفق.pdf" : "لا يوجد"}
                      </p>
                    </div>

                    {data?.WorkforceCardAttach && (
                      <FileViewer
                        id={data.WorkforceCardAttach}
                        customButton={
                          <span className="text-xs md:text-sm font-bold text-[#BE8D4A] cursor-pointer">
                            عرض
                          </span>
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}