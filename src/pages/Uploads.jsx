import { useState, useRef, forwardRef, useEffect } from "react";
import { Button } from "../ui/button";
import useSingleSchool from "../hooks/schools/useSingleSchool";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Paperclip, X, Eye } from "lucide-react";
import useUploadFiles from "../hooks/useUploadFiles";
import FileViewer from "../components/FileViewer";
import { toast } from "react-toastify";
import { DoTransaction } from "../services/apiServices";

export default function Uploads() {
  const [selectedUploadType, setSelectedUploadType] = useState("Building");
  const [commitmentChecked, setCommitmentChecked] = useState(false);
  const { id, Office_id } = useParams();
  const { SingleSchool, loading, error } = useSingleSchool(id, Office_id);
  const { uploadSingleFile } = useUploadFiles();
  const userData = useSelector((state) => state.auth.userData);
  const navigate = useNavigate();

  // Building file refs
  const propertyDeedRef = useRef(null);
  const schoolSketchRef = useRef(null);
  const aerialMapRef = useRef(null);

  // General file refs
  const establishmentContractRef = useRef(null);
  const commercialRegistryRef = useRef(null);
  const chamberOfCommerceRef = useRef(null);
  const managerSelectionRef = useRef(null);
  const criminalRecordRef = useRef(null);
  const licenseRef = useRef(null);
  const practicePermitRef = useRef(null);

  // Building uploaded files state
  const [buildingFiles, setBuildingFiles] = useState({
    propertyDeed: null,
    schoolSketch: null,
    aerialMap: null,
  });

  // General uploaded files state
  const [generalFiles, setGeneralFiles] = useState({
    establishmentContract: null,
    commercialRegistry: null,
    chamberOfCommerce: null,
    managerSelection: null,
    criminalRecord: null,
    license: null,
    practicePermit: null,
  });

  // License form state
  const [licenseForm, setLicenseForm] = useState({
    licenseNumber: "",
    issuePlace: "",
    issueDate: "",
    expiryDate: "",
    practicePermitNumber: "",
    practicePermitEndDate: "",
    validity: "",
  });

  const [dateError, setDateError] = useState("");
  const [formErrors, setFormErrors] = useState({
    licenseForm: {},
    buildingFiles: {},
    generalFiles: {},
    commitment: false,
  });

  // Handle license form input changes
  const handleLicenseFormChange = (e) => {
    const { name, value } = e.target;
    setLicenseForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear date error when user starts typing
    if (name === "issueDate" || name === "expiryDate") {
      setDateError("");
      // Clear form error for this field
      setFormErrors(prev => ({
        ...prev,
        licenseForm: {
          ...prev.licenseForm,
          [name]: false
        }
      }));
    }
    
    // Clear form error for other fields
    setFormErrors(prev => ({
      ...prev,
      licenseForm: {
        ...prev.licenseForm,
        [name]: false
      }
    }));
  };

  // Validate expiry date
  const validateExpiryDate = () => {
    if (licenseForm.issueDate && licenseForm.expiryDate) {
      const issueDateObj = new Date(licenseForm.issueDate);
      const expiryDateObj = new Date(licenseForm.expiryDate);
      const today = new Date();
      
      if (expiryDateObj <= issueDateObj) {
        setDateError("تاريخ الإنتهاء يجب أن يكون بعد تاريخ الإصدار");
        return false;
      }
      if (expiryDateObj <= today) {
        setDateError("تاريخ الإنتهاء يجب أن يكون في المستقبل");
        return false;
      }
      setDateError("");
      return true;
    }
    return true;
  };

  // Validate form on expiry date change
  useEffect(() => {
    if (licenseForm.expiryDate) {
      validateExpiryDate();
    }
  }, [licenseForm.expiryDate, licenseForm.issueDate]);

  const handleFileUpload = async (file, type, fileType) => {
    if (!file) return;

    const fileObj = {
      uid: Date.now(),
      originFileObj: file,
      name: file.name,
    };

    try {
      const fileId = await uploadSingleFile(fileObj);
      if (fileId) {
        if (fileType === "Building") {
          setBuildingFiles((prev) => ({
            ...prev,
            [type]: {
              id: fileId,
              name: file.name,
              type: type,
            },
          }));
          // Clear error for this file
          setFormErrors(prev => ({
            ...prev,
            buildingFiles: {
              ...prev.buildingFiles,
              [type]: false
            }
          }));
        } else {
          setGeneralFiles((prev) => ({
            ...prev,
            [type]: {
              id: fileId,
              name: file.name,
              type: type,
            },
          }));
          // Clear error for this file
          setFormErrors(prev => ({
            ...prev,
            generalFiles: {
              ...prev.generalFiles,
              [type]: false
            }
          }));
        }
        toast.success("تم رفع الملف بنجاح");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("فشل في تحميل الملف");
    }
  };

  const removeFile = (type, fileType) => {
    if (fileType === "Building") {
      setBuildingFiles((prev) => ({
        ...prev,
        [type]: null,
      }));
    } else {
      setGeneralFiles((prev) => ({
        ...prev,
        [type]: null,
      }));
    }
  };

  // Validate all data before saving
  const validateAllData = () => {
    const errors = {
      licenseForm: {},
      buildingFiles: {},
      generalFiles: {},
      commitment: false
    };
    let isValid = true;

    // Validate Building Tab
    if (!buildingFiles.propertyDeed) {
      errors.buildingFiles.propertyDeed = true;
      isValid = false;
    }
    if (!buildingFiles.schoolSketch) {
      errors.buildingFiles.schoolSketch = true;
      isValid = false;
    }
    if (!buildingFiles.aerialMap) {
      errors.buildingFiles.aerialMap = true;
      isValid = false;
    }

    // Validate General Tab
    if (!generalFiles.establishmentContract) {
      errors.generalFiles.establishmentContract = true;
      isValid = false;
    }
    if (!generalFiles.commercialRegistry) {
      errors.generalFiles.commercialRegistry = true;
      isValid = false;
    }
    if (!generalFiles.chamberOfCommerce) {
      errors.generalFiles.chamberOfCommerce = true;
      isValid = false;
    }
    if (!generalFiles.managerSelection) {
      errors.generalFiles.managerSelection = true;
      isValid = false;
    }
    if (!generalFiles.criminalRecord) {
      errors.generalFiles.criminalRecord = true;
      isValid = false;
    }
    if (!generalFiles.license) {
      errors.generalFiles.license = true;
      isValid = false;
    }
    if (!generalFiles.practicePermit) {
      errors.generalFiles.practicePermit = true;
      isValid = false;
    }

    // Validate Commitment Checkbox
    if (!commitmentChecked) {
      errors.commitment = true;
      isValid = false;
    }

    // Validate License Form
    if (!licenseForm.licenseNumber.trim()) {
      errors.licenseForm.licenseNumber = true;
      isValid = false;
    }
    if (!licenseForm.issuePlace.trim()) {
      errors.licenseForm.issuePlace = true;
      isValid = false;
    }
    if (!licenseForm.issueDate) {
      errors.licenseForm.issueDate = true;
      isValid = false;
    }
    if (!licenseForm.expiryDate) {
      errors.licenseForm.expiryDate = true;
      isValid = false;
    } else if (!validateExpiryDate()) {
      errors.licenseForm.expiryDate = true;
      isValid = false;
    }
    if (!licenseForm.practicePermitNumber.trim()) {
      errors.licenseForm.practicePermitNumber = true;
      isValid = false;
    }
    if (!licenseForm.validity) {
      errors.licenseForm.validity = true;
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle save button click
  const handleSave =  async () => {
    if (!validateAllData()) {
      // Show specific error messages
      const buildingFilesCount = Object.keys(formErrors.buildingFiles).filter(key => formErrors.buildingFiles[key]).length;
      const generalFilesCount = Object.keys(formErrors.generalFiles).filter(key => formErrors.generalFiles[key]).length;
      
      let errorMessage = "الرجاء إكمال البيانات التالية:\n";
      
      if (buildingFilesCount > 0) {
        errorMessage += `- ${buildingFilesCount} ملف/ملفات في قسم المسوغات المتعلقة بالمبنى المدرسي\n`;
      }
      
      if (generalFilesCount > 0) {
        errorMessage += `- ${generalFilesCount} ملف/ملفات في قسم المسوغات العامة\n`;
      }
      
      if (formErrors.commitment) {
        errorMessage += "- خانة الالتزام غير محددة\n";
      }
      
      if (Object.keys(formErrors.licenseForm).filter(key => formErrors.licenseForm[key]).length > 0) {
        errorMessage += "- بعض بيانات الترخيص غير مكتملة\n";
      }
      
      toast.error(errorMessage, {
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
      });
      
      // Switch to the tab that has errors
      if (buildingFilesCount > 0 && selectedUploadType !== "Building") {
        setSelectedUploadType("Building");
      } else if ((generalFilesCount > 0 || formErrors.commitment || Object.keys(formErrors.licenseForm).length > 0) && selectedUploadType !== "General") {
        setSelectedUploadType("General");
      }
      
      return;
    }
    
    // toast.success("تم حفظ جميع البيانات بنجاح!");
    console.log("Building Files:", buildingFiles);
    console.log("General Files:", generalFiles);
    console.log("License Form:", licenseForm);
    console.log("Commitment:", commitmentChecked);
    const wantedAction = SingleSchool.attachments.length > 0 ? 1 : 0;
    const payload = {
      id: wantedAction == 0 ? 0 : SingleSchool.attachments.id,
      School_id: SingleSchool.mainSchool.id,
      SanadMelkiaAttach: buildingFiles.propertyDeed.id,
      KorokiDrawAttach: buildingFiles.schoolSketch.id,
      AirMapAttach: buildingFiles.aerialMap.id,
      CreateContractAttach: generalFiles.establishmentContract.id,
      CommercialRegisterAttach: generalFiles.commercialRegistry.id,
      ChamberCommerceAttach: generalFiles.chamberOfCommerce.id,
      ChooseManagerAttach: generalFiles.managerSelection.id,
      LicenseAttach: generalFiles.license.id,
      LicenseNum: licenseForm.licenseNumber,
      LicensePlace: licenseForm.issuePlace,
      LicenseStartDate: licenseForm.issueDate.split("-").reverse().join("/"),
      LicenseEndDate: licenseForm.expiryDate.split("-").reverse().join("/"),
      SecurityCardAttach: generalFiles.criminalRecord.id,
      MozawlaAttach: generalFiles.practicePermit.id, // Assuming commitmentChecked is a boolean
      ChamberCommerceNum: licenseForm.practicePermitNumber, // Assuming this is a field in the form
      ChamberCommerceEndDate: licenseForm.practicePermitEndDate.split("-").reverse().join("/"), // Assuming this is a field in the form
    };
    console.log(payload);
    
    const response = await DoTransaction("T34zhS2h1Lgmoa/MpjpUiShTFUlpbit9njWk7HUBnM8=" ,
      `${payload.id}#${payload.School_id}#${payload.SanadMelkiaAttach}#${payload.KorokiDrawAttach}#${payload.AirMapAttach}#${payload.CreateContractAttach}#${payload.CommercialRegisterAttach}#${payload.ChamberCommerceAttach}#${payload.ChooseManagerAttach}#${payload.LicenseAttach}#${payload.LicenseNum}#${payload.LicensePlace}#${payload.LicenseStartDate}#${payload.LicenseEndDate}#${payload.SecurityCardAttach}#${payload.MozawlaAttach}#${commitmentChecked?"True":"False"}#${payload.ChamberCommerceNum}#${payload.ChamberCommerceEndDate}`,
      wantedAction,
      "id#School_id#SanadMelkiaAttach#KorokiDrawAttach#AirMapAttach#CreateContractAttach#CommercialRegisterAttach#ChamberCommerceAttach#ChooseManagerAttach#LicenseAttach#LicenseNum#LicensePlace#LicenseStartDate#LicenseEndDate#SecurityCardAttach#MozawlaAttach#commitment#ChamberCommerceNum#ChamberCommerceEndDate"
    ) ;

    if(response.success != 200){
      toast.error(response.errorMessage || "فشل العملية")
    } else {
      toast.success("تم حفظ البيانات بنجاح")
    }
    
  };

  const FileDisplay = ({ file, fileId, onRemove }) => {
    if (!file && !fileId) return null;

    return (
      <div className="mt-2 md:mt-0 border border-green-500 rounded-lg py-1.5 px-3 md:px-6 flex items-center justify-between bg-green-50 w-full md:w-auto gap-2">
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700 font-medium truncate max-w-[120px] md:max-w-[200px]">
            {file?.name || "مرفق موجود"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {fileId && fileId !== 0 && (
            <FileViewer
              id={fileId}
              SessionID={userData?.SessionID || ""}
              customButton={
                <button
                  type="button"
                  className="text-[#BE8D4A] hover:text-[#a67a3f] p-1 rounded flex items-center gap-1 text-sm font-semibold"
                >
                  <Eye size={16} />
                  عرض
                </button>
              }
            />
          )}
          {file && (
            <button
              type="button"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex-shrink-0"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const FileUploader = forwardRef(({ label, file, fileId, onUpload, onRemove, accept = ".pdf,.jpg,.jpeg,.png", error = false }, ref) => {
    return (
      <div className="flex flex-col w-full gap-2">
        {/* Label for the button */}
        <label className={`font-medium ${error ? "text-red-600" : "text-gray-700"}`}>
          {label} {error && <span className="text-red-500">*</span>}
        </label>
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className={`flex items-center gap-2 px-4 py-2 rounded w-full md:w-1/2 transition-colors ${
              error 
                ? "bg-red-100 border border-red-500 text-red-600 hover:bg-red-200" 
                : "bg-[#BE8D4A] text-white hover:bg-[#a67a3f]"
            }`}
          >
            <Paperclip />
            رفع الملف
          </button>
          <FileDisplay file={file} fileId={fileId} onRemove={onRemove} />
        </div>
        {error && !file && !fileId && (
          <p className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</p>
        )}
        <input
          type="file"
          hidden
          ref={ref}
          onChange={(e) => onUpload(e.target.files[0])}
          accept={accept}
        />
      </div>
    );
  });
  FileUploader.displayName = "FileUploader";

  console.log(SingleSchool);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-lg font-bold">
        <Button
          onClick={() => {
            setSelectedUploadType("Building");
          }}
          className={`text-white text-base sm:text-lg w-full md:max-w-[40%] ${selectedUploadType == "Building" ? "bg-[#BE8D4A] hover:bg-[#a67a3f]" : "bg-[#BE8D4A90] hover:bg-[#a67a3f]"}`}
        >
          المسوغات المتعلقة بالمبنى المدرسي
        </Button>

        <Button
          onClick={() => {
            setSelectedUploadType("General");
          }}
          className={`text-white text-base sm:text-lg w-full md:max-w-[40%] ${selectedUploadType == "General" ? "bg-[#BE8D4A] hover:bg-[#a67a3f]" : "bg-[#BE8D4A90] hover:bg-[#a67a3f]"}`}
        >
          المسوغات العامة
        </Button>
      </div>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-6 bg-white rounded-lg font-bold">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-[#828282]">المدرسة</span>
          <span className="text-lg">{SingleSchool?.mainSchool?.School_FullName}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm text-[#828282] md:text-left">مدير المدرسة</span>
          <span className="text-lg">{SingleSchool?.managerSchool[0]?.FullName}</span>
        </div>
      </div>

      {selectedUploadType == "Building" && (
        <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-lg">
          <div className="flex flex-col gap-2 mb-4">
            <span className="text-sm text-[#828282]">المسوغات المتعلقة بالمبنى المدرسي</span>
            <span className="text-lg font-bold">المسوغات المتعلقة بالمبنى المدرسي</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FileUploader
              label="سند الملكية / عقد ايجار"
              ref={propertyDeedRef}
              file={buildingFiles.propertyDeed}
              fileId={null}
              onUpload={(file) => handleFileUpload(file, "propertyDeed", "Building")}
              onRemove={() => removeFile("propertyDeed", "Building")}
              error={formErrors.buildingFiles.propertyDeed}
            />

            <FileUploader
              label="الرسم الكروكي للمدرسة"
              ref={schoolSketchRef}
              file={buildingFiles.schoolSketch}
              fileId={null}
              onUpload={(file) => handleFileUpload(file, "schoolSketch", "Building")}
              onRemove={() => removeFile("schoolSketch", "Building")}
              error={formErrors.buildingFiles.schoolSketch}
            />

            <FileUploader
              label="الخريطة الجوية واضحة المعالم للمبني المدرسي"
              ref={aerialMapRef}
              file={buildingFiles.aerialMap}
              fileId={null}
              onUpload={(file) => handleFileUpload(file, "aerialMap", "Building")}
              onRemove={() => removeFile("aerialMap", "Building")}
              error={formErrors.buildingFiles.aerialMap}
            />
          </div>
        </div>
      )}

      {selectedUploadType == "General" && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 p-4 sm:p-6 bg-white rounded-lg">
            <div className="flex flex-col gap-2 mb-4">
              <span className="text-sm text-[#828282]">المسوغات العامة</span>
              <span className="text-lg font-bold">المسوغات العامة</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploader
                label="عقد التأسيس تقتصر فيه أغراض الشركة على النشاط التعليمي فقط"
                ref={establishmentContractRef}
                file={generalFiles.establishmentContract}
                fileId={null}
                onUpload={(file) => handleFileUpload(file, "establishmentContract", "General")}
                onRemove={() => removeFile("establishmentContract", "General")}
                error={formErrors.generalFiles.establishmentContract}
              />

              <FileUploader
                label="إثبات القيد السجل التجاري"
                ref={commercialRegistryRef}
                file={generalFiles.commercialRegistry}
                fileId={null}
                onUpload={(file) => handleFileUpload(file, "commercialRegistry", "General")}
                onRemove={() => removeFile("commercialRegistry", "General")}
                error={formErrors.generalFiles.commercialRegistry}
              />

              <FileUploader
                label="اثبات قيد بالغرفة التجارية"
                ref={chamberOfCommerceRef}
                file={generalFiles.chamberOfCommerce}
                fileId={null}
                onUpload={(file) => handleFileUpload(file, "chamberOfCommerce", "General")}
                onRemove={() => removeFile("chamberOfCommerce", "General")}
                error={formErrors.generalFiles.chamberOfCommerce}
              />

              <FileUploader
                label="اختيار مدير الشركة"
                ref={managerSelectionRef}
                file={generalFiles.managerSelection}
                fileId={null}
                onUpload={(file) => handleFileUpload(file, "managerSelection", "General")}
                onRemove={() => removeFile("managerSelection", "General")}
                error={formErrors.generalFiles.managerSelection}
              />

              <FileUploader
                label="خلو من السوابق لمدير الشركة والمعلمين"
                ref={criminalRecordRef}
                file={generalFiles.criminalRecord}
                fileId={null}
                onUpload={(file) => handleFileUpload(file, "criminalRecord", "General")}
                onRemove={() => removeFile("criminalRecord", "General")}
                error={formErrors.generalFiles.criminalRecord}
              />

              <FileUploader
                label="الترخيص"
                ref={licenseRef}
                file={generalFiles.license}
                fileId={null}
                onUpload={(file) => handleFileUpload(file, "license", "General")}
                onRemove={() => removeFile("license", "General")}
                error={formErrors.generalFiles.license}
              />

              <FileUploader
                label="المزاولة"
                ref={practicePermitRef}
                file={generalFiles.practicePermit}
                fileId={null}
                onUpload={(file) => handleFileUpload(file, "practicePermit", "General")}
                onRemove={() => removeFile("practicePermit", "General")}
                error={formErrors.generalFiles.practicePermit}
              />
            </div>

            <div className={`mt-6 flex items-start gap-3 p-4 rounded-lg ${formErrors.commitment ? "bg-red-50 border border-red-200" : "bg-gray-50"}`}>
              <input
                type="checkbox"
                id="commitment"
                checked={commitmentChecked}
                onChange={(e) => {
                  setCommitmentChecked(e.target.checked);
                  setFormErrors(prev => ({
                    ...prev,
                    commitment: false
                  }));
                }}
                className={`mt-1 w-5 h-5 border rounded focus:ring-[#BE8D4A] cursor-pointer ${
                  formErrors.commitment ? "border-red-500 text-red-600" : "text-[#BE8D4A] border-gray-300"
                }`}
              />
              <label htmlFor="commitment" className={`text-base cursor-pointer ${formErrors.commitment ? "text-red-600" : "text-gray-700"}`}>
                تعهد بالالتزام التام بالقوانين والوائح و القرارات المنظمة للتعليم الخاص
              </label>
            </div>
            {formErrors.commitment && (
              <p className="text-red-500 text-sm mt-1">هذا الحقل مطلوب</p>
            )}
          </div>
          
          <div className="p-4 sm:p-6 bg-white rounded-lg">
            <div className="py-4 border-b-2 border-[#C0C0C0] mb-6">
              <span className="text-lg font-bold">ترخيص المدرسة</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* رقمه */}
              <div className="flex flex-col gap-2">
                <label className={`font-medium ${formErrors.licenseForm.licenseNumber ? "text-red-600" : "text-gray-700"}`}>
                  رقمه {formErrors.licenseForm.licenseNumber && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={licenseForm.licenseNumber}
                  onChange={handleLicenseFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] focus:border-transparent ${
                    formErrors.licenseForm.licenseNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="أدخل رقم الترخيص"
                />
              </div>

              {/* مكان صدوره */}
              <div className="flex flex-col gap-2">
                <label className={`font-medium ${formErrors.licenseForm.issuePlace ? "text-red-600" : "text-gray-700"}`}>
                  مكان صدوره {formErrors.licenseForm.issuePlace && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="issuePlace"
                  value={licenseForm.issuePlace}
                  onChange={handleLicenseFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] focus:border-transparent ${
                    formErrors.licenseForm.issuePlace ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="أدخل مكان الصدور"
                />
              </div>

              {/* تاريخ الإصدار */}
              <div className="flex flex-col gap-2">
                <label className={`font-medium ${formErrors.licenseForm.issueDate ? "text-red-600" : "text-gray-700"}`}>
                  تاريخ الإصدار {formErrors.licenseForm.issueDate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={licenseForm.issueDate}
                  onChange={handleLicenseFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] focus:border-transparent ${
                    formErrors.licenseForm.issueDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>

              {/* تاريخ الإنتهاء */}
              <div className="flex flex-col gap-2">
                <label className={`font-medium ${formErrors.licenseForm.expiryDate ? "text-red-600" : "text-gray-700"}`}>
                  تاريخ الإنتهاء {formErrors.licenseForm.expiryDate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={licenseForm.expiryDate}
                  onChange={handleLicenseFormChange}
                  min={licenseForm.issueDate}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] focus:border-transparent ${
                    formErrors.licenseForm.expiryDate || dateError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {(dateError || formErrors.licenseForm.expiryDate) && (
                  <p className="text-red-500 text-sm mt-1">
                    {dateError || "هذا الحقل مطلوب"}
                  </p>
                )}
              </div>

              {/* رقم إذن المزاولة */}
              <div className="flex flex-col gap-2">
                <label className={`font-medium ${formErrors.licenseForm.practicePermitNumber ? "text-red-600" : "text-gray-700"}`}>
                  رقم إذن المزاولة {formErrors.licenseForm.practicePermitNumber && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="practicePermitNumber"
                  value={licenseForm.practicePermitNumber}
                  onChange={handleLicenseFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] focus:border-transparent ${
                    formErrors.licenseForm.practicePermitNumber ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="أدخل رقم إذن المزاولة"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className={`font-medium ${formErrors.licenseForm.practicePermitEndDate ? "text-red-600" : "text-gray-700"}`}>
                  تاريخ انتهاء المزاولة {formErrors.licenseForm.practicePermitEndDate && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  name="practicePermitEndDate"
                  value={licenseForm.practicePermitEndDate}
                  onChange={handleLicenseFormChange}
                  min={licenseForm.practicePermitEndDate}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] focus:border-transparent ${
                    formErrors.licenseForm.practicePermitEndDate || dateError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {(dateError || formErrors.licenseForm.practicePermitEndDate) && (
                  <p className="text-red-500 text-sm mt-1">
                    {dateError || "هذا الحقل مطلوب"}
                  </p>
                )}
              </div>


              {/* صلاحيته */}
              <div className="flex flex-col gap-2">
                <label className={`font-medium ${formErrors.licenseForm.validity ? "text-red-600" : "text-gray-700"}`}>
                  صلاحيته {formErrors.licenseForm.validity && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  name="validity"
                  value={licenseForm.validity}
                  onChange={handleLicenseFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BE8D4A] focus:border-transparent ${
                    formErrors.licenseForm.validity ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="أدخل الصلاحية"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit button for the form */}
      <div className="mt-8 flex justify-end gap-4 bg-white rounded-lg p-4">
        <button
          type="button"
          className="bg-white border border-red-500 text-red-500 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium"
          onClick={() => navigate(-1)}
        >
          إلغاء
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="bg-[#BE8D4A] text-white px-6 py-3 rounded-lg hover:bg-[#a67a3f] transition-colors font-medium"
        >
          حفظ
        </button>
      </div>
    </div>
  );
}