import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import "./fonts/Amiri-Regular"; // base64 string


const App = () => {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [photoPreview, setPhotoPreview] = useState(null);

  const formLabels = {
    en: {
      gender: "Gender",
      name_plain: "Name of Applicant",
      religion: "Religion",
      birth_date: "Birth Date",
      birth_place: "Bith Place",
      marital_status: "Marital Status",
      spouse_nationality: "Spouse Nationality",
      phone_number: "Phone Number",
      nationality: "Nationality",
      origin_country: "Country of Origin",
      profession: "Profession",
      personal_photo: "Personal Photo",
      political_opinion: "Political Opinion",
      social_group_membership: "Social Group Membership",
      reasons_for_persecution: "Reasons for Persecution",
      last_place_of_residence: "Last Place of Residence",
      residency_duration: "Residency Duration",
      military_service: "Do you have military service?",
      political_party_membership: "Do you belong to political parties?",
      political_party_names: "Political Party Names",
      departure_date_from_origin: "Departure Date from Origin",
      date_of_arrival_to_iraq: "Date of Arrival to Iraq",
      passport_expiry_date: "Passport Expiry Date",
      reasons_for_leaving_origin: "Reasons for Leaving Country",
      previous_country_before_iraq: "Previous Country Before Iraq",
      reasons_for_asylum: "Reasons for Asylum",
      clear: "Clear",
      send: "Send",
      lightTheme: "Light Theme",
      darkTheme: "Dark Theme",
    },
    ar: {
      gender: "الجنس",
      name_plain: "اسم مقدم الطلب",
      religion: "الديانة",
      birth_date: "تاريخ الولادة",
      birth_place: "مكان الولادة",
      marital_status: "الحالة الاجتماعية",
      spouse_nationality: "جنسية الزوج/الزوجة",
      phone_number: "رقم الهاتف",
      nationality: "القومية",
      origin_country: "بلد الأصل",
      profession: "المهنة",
      personal_photo: "الصورة الشخصية",
      political_opinion: "الرأي السياسي",
      social_group_membership: "الانتماء الاجتماعي أو القبلي",
      reasons_for_persecution: "أسباب الاضطهاد",
      last_place_of_residence: "آخر مكان سكن فيه",
      residency_duration: "مدة الإقامة في آخر مكان",
      military_service: "هل لديك خدمة عسكرية؟",
      political_party_membership: "هل تنتمي لأحزاب سياسية؟",
      political_party_names: "أسماء الأحزاب",
      departure_date_from_origin: "تاريخ مغادرة البلد الأصلي",
      date_of_arrival_to_iraq: "تاريخ الوصول إلى العراق",
      passport_expiry_date: "تاريخ انتهاء جواز السفر",
      reasons_for_leaving_origin: "أسباب مغادرة البلد الأصلي",
      previous_country_before_iraq: "البلد السابق قبل العراق",
      reasons_for_asylum: "أسباب طلب اللجوء",
      clear: "مسح",
      send: "إرسال",
      lightTheme: "الوضع الفاتح",
      darkTheme: "الوضع الداكن",
    },
  };
//
const generatePDFWithQR = async () => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const dateStr = new Date().toLocaleString();
  const isRTL = language === "ar";

  // QR data excluding the photo
  const dataForQR = JSON.stringify(
    Object.fromEntries(Object.entries(formData).filter(([k]) => k !== "personal_photo")),
    null,
    2
  );

  try {
    const qrDataURL = await QRCode.toDataURL(dataForQR);
    const logoImg = new Image();
    logoImg.src = "/logo.png";

    logoImg.onload = () => {
      doc.addImage(logoImg, "PNG", pageWidth / 2 - 20, 10, 40, 40); // centered
      let currentY = 55;

      doc.setFontSize(16);
      doc.setFont(isRTL ? "Amiri-Regular" : "helvetica", "normal");
      doc.text(
        isRTL ? "طلب اللجوء" : "Immigration Application",
        pageWidth / 2,
        currentY,
        { align: "center" }
      );
      currentY += 10;

      const photoWidth = 40;
      const qrWidth = 40;
      const imageHeight = 40;
      const photoX = 10;
      const qrX = pageWidth - qrWidth - 10;
      const imageY = currentY;

      const finish = (photoDataURL = null) => {
        doc.setFontSize(10);
        doc.setFont(isRTL ? "Amiri-Regular" : "helvetica", "normal");

        if (photoDataURL) {
          doc.text(
            isRTL ? "الصورة الشخصية:" : "Personal Photo:",
            photoX,
            imageY
          );
          doc.addImage(photoDataURL, "JPEG", photoX, imageY + 3, photoWidth, imageHeight);
        }

        doc.text(
          isRTL ? "رمز الاستجابة السريعة:" : "QR Code:",
          qrX,
          imageY
        );
        doc.addImage(qrDataURL, "PNG", qrX, imageY + 3, qrWidth, imageHeight);

        currentY = imageY + imageHeight + 10;

        const fields = Object.keys(formData).filter((key) => key !== "personal_photo");
        const textX = isRTL ? pageWidth - 10 : 10;
        const align = isRTL ? "right" : "left";

        fields.forEach((key) => {
          const label = formLabels[language][key] || key;
          const value = formData[key] || "-";
          const line = isRTL ? `${label} : ${value}` : `${label}: ${value}`;


          if (currentY + 6 > pageHeight - 20) return;
          doc.text(line, textX, currentY, { align });
          currentY += 6;
        });

        doc.setFontSize(9);
        doc.setFont(isRTL ? "Amiri-Regular" : "helvetica", "normal");
        doc.text(`Generated: ${dateStr}`, 10, pageHeight - 10);
        doc.text(
          isRTL ? "التوقيع: ______" : "Signature: ______",
          pageWidth - 80,
          pageHeight - 10
        );

        doc.save("immigration_form.pdf");
      };

      if (formData.personal_photo) {
        const reader = new FileReader();
        reader.onload = (e) => finish(e.target.result);
        reader.readAsDataURL(formData.personal_photo);
      } else {
        finish();
      }
    };
  } catch (err) {
    console.error("PDF generation error:", err);
  }
};




  
//end of generatePDFWithQR  

  const initialFormData = Object.fromEntries(
    Object.keys(formLabels.en)
      .filter((k) => !["clear", "send", "lightTheme", "darkTheme"].includes(k))
      .map((k) => [k, k === "personal_photo" ? null : ""])
  );

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const savedTheme = localStorage.getItem("immigrationFormTheme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("immigrationFormTheme", theme);
  }, [theme]);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      if (file) {
        setPhotoPreview(URL.createObjectURL(file));
      } else {
        setPhotoPreview(null);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLanguageChange = (e) => setLanguage(e.target.value);
  const clearForm = () => {
    setFormData(initialFormData);
    setPhotoPreview(null);
  };
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  const themes = {
    light: {
      backgroundColor: "#f5f7fa",
      formBackground: "white",
      textColor: "#212529",
      inputBackground: "white",
      inputTextColor: "#212529",
      borderColor: "#ced4da",
      btnPrimary: "btn-primary",
      btnSecondary: "btn-danger",
      btnSuccess: "btn-success",
      sectionHeaderBg: "#0d6efd",
      sectionHeaderText: "white",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    dark: {
      backgroundColor: "#121212",
      formBackground: "#1e1e1e",
      textColor: "#e0e0e0",
      inputBackground: "#212529",
      inputTextColor: "#e0e0e0",
      borderColor: "#6c757d",
      btnPrimary: "btn-outline-primary",
      btnSecondary: "btn-outline-danger",
      btnSuccess: "btn-outline-success",
      sectionHeaderBg: "#0d6efd",
      sectionHeaderText: "white",
      fontFamily: "'Cairo', sans-serif",
    },
  };

  const currentTheme = themes[theme];

  const renderInput = (name, type = "text") => {
    const isDate = type === "date";

    return (
      <div 
        className="col-md-4 mb-3"
        key={name}
        style={{
          opacity: 0,
          animation: "fadeInUp 0.5s ease forwards",
          animationDelay: `${0.1 * Object.keys(formData).indexOf(name)}s`,
        }}
      >
        <label
          htmlFor={name}
          className="form-label fw-semibold"
          style={{ color: currentTheme.textColor }}
        >
          {formLabels[language][name]}
        </label>

        {isDate ? (
       <DatePicker
       selected={formData[name] ? new Date(formData[name]) : null}
       onChange={(date) =>
         setFormData((prev) => ({
           ...prev,
           [name]: date ? date.toISOString().split("T")[0] : "",
         }))
       }
       dateFormat="yyyy-MM-dd"
       placeholderText={language === "en" ? "Select date" : "اختر التاريخ"}
       className={
        theme === "light"
          ? "form-control shadow-sm"
          : "form-control shadow-sm bg-dark text-light  border-secondary"
          
      }
      
      wrapperClassName="w-100"
       popperPlacement="top"
       portalId="root-portal"
   
  
       
     />
     
        
        
        
        ) : (
          type === "file" ? (
            <div className="d-flex align-items-center gap-3">
              <input
                type="file"
                id={name}
                name={name}
                className="form-control shadow-sm"
                onChange={handleChange}
                style={{
                  backgroundColor: currentTheme.inputBackground,
                  color: currentTheme.inputTextColor,
                  borderColor: currentTheme.borderColor,
                  transition: "all 0.3s ease",
                  fontFamily: currentTheme.fontFamily,
                }}
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    border: `1px solid ${currentTheme.borderColor}`,
                    animation: "fadeInImage 0.7s ease forwards",
                  }}
                />
              )}
            </div>
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              className="form-control shadow-sm"
              value={formData[name] || ""}
              onChange={handleChange}
              style={{
                backgroundColor: currentTheme.inputBackground,
                color: currentTheme.inputTextColor,
                borderColor: currentTheme.borderColor,
                transition: "all 0.3s ease",
                fontFamily: currentTheme.fontFamily,
              }}
            />
          )
          
        )}
      </div>
    );
  };

  const renderSelect = (name, options) => (
    <div
      className="col-md-4 mb-3"
      key={name}
      style={{
        opacity: 0,
        animation: "fadeInUp 0.5s ease forwards",
        animationDelay: `${0.1 * Object.keys(formData).indexOf(name)}s`,
      }}
    >
      <label
        htmlFor={name}
        className="form-label fw-semibold"
        style={{ color: currentTheme.textColor }}
      >
        {formLabels[language][name]}
      </label>
      <select
        id={name}
        name={name}
        className="form-select shadow-sm"
        value={formData[name] || ""}
        onChange={handleChange}
        style={{
          backgroundColor: currentTheme.inputBackground,
          color: currentTheme.inputTextColor,
          borderColor: currentTheme.borderColor,
          fontFamily: currentTheme.fontFamily,
        }}
      >
        <option value="">{language === "en" ? "Select" : "حدد"}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {language === "en" ? opt.label.en : opt.label.ar}
          </option>
        ))}
      </select>
    </div>
  );

  const genderOptions = [
    { value: "male", label: { en: "Male", ar: "ذكر" } },
    { value: "female", label: { en: "Female", ar: "أنثى" } },
  ];

  const yesNoOptions = [
    { value: "yes", label: { en: "Yes", ar: "نعم" } },
    { value: "no", label: { en: "No", ar: "لا" } },
  ];

  const section = (title, fields) => (
    <section className="mb-5">
      <div
        className="px-3 py-2 rounded-top fw-bold fs-5"
        style={{
          backgroundColor: currentTheme.sectionHeaderBg,
          color: currentTheme.sectionHeaderText,
          fontFamily: currentTheme.fontFamily,
        }}
      >
        {title}
      </div>
      <div
        className="border border-top-0 rounded-bottom p-4 row"
        style={{
          backgroundColor: currentTheme.formBackground,
          borderColor: currentTheme.borderColor,
        }}
      >
        {fields.map((field) => {
          if (typeof field === "object" && field.selectOptions) {
            return renderSelect(field.name, field.selectOptions);
          } else if (typeof field === "object") {
            return renderInput(field.name, field.type);
          } else if (
            field === "gender" ||
            field === "military_service" ||
            field === "political_party_membership"
          ) {
            const options = field === "gender" ? genderOptions : yesNoOptions;
            return renderSelect(field, options);
          } else {
            return renderInput(field);
          }
        })}
      </div>
    </section>
  );

  return (
    <div
      dir={language === "ar" ? "rtl" : "ltr"}
      style={{
        width: "100vw",
        minHeight: "100vh",
        padding: "20px 40px",
        backgroundColor: currentTheme.backgroundColor,
        fontFamily: currentTheme.fontFamily,
        color: currentTheme.textColor,
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInImage {
          to { opacity: 1; }
        }
          
      `}</style>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: currentTheme.formBackground,
          padding: "30px 40px",
          borderRadius: "10px",
          boxShadow:
            theme === "light"
              ? "0 4px 12px rgb(0 0 0 / 0.1)"
              : "0 4px 12px rgba(0,0,0,0.8)",
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <img
              src="src/assets/moi.svg"
              style={{
                borderRadius: "8px",
                width: "120px",
                height: "120px",
              }}
            />
            <h1 className="fw-bold mb-0" style={{ color: theme === "light" ? "#0d6efd" : "#66aaff" }}>
              {language === "en" ? "Immigration Order Form" : "نموذج طلب اللجوء"}
            </h1>
          </div>
          <div className="d-flex gap-3 align-items-center">
            <select className="form-select" style={{ width: "130px" }} value={language} onChange={handleLanguageChange}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
            <button className={`btn btn-outline-${theme === "light" ? "dark" : "light"}`} onClick={toggleTheme}>
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        <form>
          {section(language === "en" ? "Personal Information" : "المعلومات الشخصية", [
            "name_plain",
            { name: "birth_date", type: "date" },
            "birth_place",
            "gender",
            "religion",
            "marital_status",
            "spouse_nationality",
            "phone_number",
            "nationality",
            "origin_country",
            "profession",
            { name: "personal_photo", type: "file" },
          ])}

          {photoPreview && (
            <div style={{ marginTop: "10px", textAlign: language === "ar" ? "right" : "left", animation: "fadeInImage 0.7s ease forwards" }}>
              <img
                src={photoPreview}
                alt="Preview"
                style={{ maxWidth: "150px", maxHeight: "150px", borderRadius: "8px" }}
              />
            </div>
          )}

          {section(language === "en" ? "Political & Social Information" : "المعلومات السياسية والاجتماعية", [
            "political_opinion",
            "social_group_membership",
            "reasons_for_persecution",
            "last_place_of_residence",
            "residency_duration",
            "military_service",
            "political_party_membership",
            "political_party_names",
          ])}

          {section(language === "en" ? "Migration Details" : "معلومات الهجرة", [
            { name: "departure_date_from_origin", type: "date" },
            { name: "date_of_arrival_to_iraq", type: "date" },
            { name: "passport_expiry_date", type: "date" },
            "reasons_for_leaving_origin",
            "previous_country_before_iraq",
            "reasons_for_asylum",
          ])}

          <div className="d-flex justify-content-center gap-3 mt-4 flex-wrap">

            <button className={`btn ${currentTheme.btnSecondary} px-4 py-2 fw-semibold`} type="button" onClick={clearForm}>
              {formLabels[language].clear}
            </button>
            <button
  className={`btn ${currentTheme.btnPrimary} px-4 py-2 fw-semibold`}
  type="button"
  onClick={generatePDFWithQR}
>
  {formLabels[language].send}
</button>

          </div>
        </form>

        <footer className="mt-5 pt-4 border-top text-center text-muted small">
          <p style={{ color: currentTheme.textColor }}>
            {language === "en"
              ? "© 2025 Immigration Services. All rights reserved."
              : "© 2025 خدمات الهجرة. جميع الحقوق محفوظة."}
          </p>
          <p style={{ color: currentTheme.textColor }}>
            {language === "en"
              ? "Designed by Information systems Team"
              : "تصميم فريق نظم المعلومات"}
          </p>
        </footer>
      </div>
    </div>
  );
};



export default App;
