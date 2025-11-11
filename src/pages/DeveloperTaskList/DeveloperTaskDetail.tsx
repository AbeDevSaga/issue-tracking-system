import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { Upload, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Screenshot1 from "../../assets/screenshot1.png";
import Screenshot2 from "../../assets/screenshot2.png";
import Screenshot3 from "../../assets/screenshot2.png";
import Alert from "../../components/ui/alert/Alert";
export default function DeveloperTask_Detail() {
  const { t } = useTranslation();
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const [reworkModal, setReworkModal] = useState(false);
  const images = [Screenshot2, Screenshot1, Screenshot3];

  const prevImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex - 1 + images.length) % images.length);
    }
  };

  const nextImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex + 1) % images.length);
    }
  };

  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const openModal = (index: number) => setModalImageIndex(index);

  const closeModal = () => setModalImageIndex(null);

  const handleMarkAsInProgress = async () => {
    try {
      setAlert({ type: "success", message: "Status updated to In Progress!" });
      setSelectedAction(null);
      setTimeout(() => setAlert(null), 2000);
    } catch (error) {
      setAlert({ type: "error", message: "Error updating status." });
      console.error(error);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleFormSubmit = (values: Record<string, any>) => {
    setAlert({ type: "success", message: "Developer Assigned successfully!" });
;
    setTimeout(() => setAlert(null), 3000);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: "success", message: "File and Description added successfully!" });
    setSelectedAction(null);
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };
  const handleSubmitDocument = (e: React.FormEvent) => {
    e.preventDefault();
    setAlert({ type: "success", message: "File and Description added successfully!" });
    setSelectedAction(null);
    setTimeout(() => {
      setAlert(null);
    }, 1500);
  };
  return (
    <>
      <PageMeta
        title={t("CATask.ca_task_detail")}
        description={t("CATask.ca_task_detail", { title: t("QATasCATaskk.detail") })}
      />
      <div className="min-h-screen bg-[#F9FBFC] p-6 pb-24 flex flex-col items-start">
        <div
          className={`w-full max-w-[1440px] mx-auto bg-white shadow-md rounded-xl border border-dashed border-[#BFD7EA] p-6 relative overflow-hidden`}
        >
          <div
            className={`transition-all duration-500 ease-in-out ${selectedAction === "resolve" || selectedAction === "escalate"
              ? "lg:pr-[380px]"
              : ""
              }`}
          >
            <div className="flex flex-col w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <div>
                  <h2 className="text-[#1E516A] text-xl font-bold mb-1">
                    Central Admin Action
                  </h2>
                  <p className="text-gray-600">
                    Review issue details and take appropriate action
                  </p>
                </div>
                <AnimatePresence>
                  {alert && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${alert.type === "success" ? "bg-green-600" : "bg-red-600"
                        }`}
                    >
                      {alert.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="border border-[#BFD7EA] rounded-lg p-4 mb-6"
                style={{ backgroundColor: "rgba(9, 76, 129, 0.05)" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-2">
                                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      System
                    </p>
                    <p className="text-gray-700">Citizen ID Portal</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Category
                    </p>
                    <p className="text-gray-700">Database</p>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E516A] text-sm">
                      Reported By
                    </p>
                    <p className="text-gray-700">Addis Ketema IT Dep.</p>
                  </div>
                  <div >
                 <p className="font-semibold text-[#1E516A] text-sm">
                    Reported On
                  </p>
                  <p className="text-gray-700">2025-11-02 09:30 am</p>
                </div>
                </div>

             

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
    <p className="font-semibold text-[#1E516A] text-sm mb-1">
      Description
    </p>
    Database connection timeout occurring during peak hours
  </div>

  <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
    <p className="font-semibold text-[#1E516A] text-sm mb-1">
      Action Taken
    </p>
    Database connection timeout occurring during peak hours
  </div>
</div>

              </div>

              <div className="bg-white border border-[#BFD7EA] rounded-lg p-3 flex-1">
                <h4 className="font-semibold text-[#1E516A] mb-2">
                  Reported Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Screenshot ${idx + 1}`}
                      className="rounded-md border w-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => openModal(idx)}
                    />
                  ))}
                </div>
              </div>
<div>
  <h3 className="text-[#1E516A] font-semibold text-lg mt-4 mb-3 flex items-center gap-2">
    🎯 Select Action
  </h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Document Attachment */}
  <div>
    <h4 className="font-semibold text-[#1E516A] mb-2">Document Attachment</h4>
    <div className="border border-dashed border-[#BFD7EA] rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-[#F9FBFC] transition">
      <Upload className="w-8 h-8 mb-2 text-[#1E516A]" />
      <p className="text-sm">
        Drag your file(s) or{" "}
        <span className="text-[#1E516A] underline cursor-pointer">browse</span>
      </p>
      <p className="text-xs mt-1">Max xx MB files allowed</p>
    </div>
  </div>

  {/* Fix Description */}
  <div className="flex flex-col">
    <h4 className="font-semibold text-[#1E516A] mb-2">Fix Description</h4>
    <textarea
      className="w-full border border-[#BFD7EA] rounded-lg p-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#1E516A]"
      placeholder="Describe how you solved this issue"
    ></textarea>
  </div>
</div>

{/* Submit button outside the grid for proper alignment */}
<div className="mt-4 flex justify-end">
  <button
    type="submit"
    className="px-6 py-2 bg-[#094C81] text-white rounded-md hover:bg-blue-800 transition"
  >
    Submit
  </button>
</div>

</div>

                     </div>
          </div>
          {modalImageIndex !== null && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30 backdrop-blur-sm"
              onClick={closeModal}
            >
              <div className="relative max-w-[90%] p-8 bg-white shadow-xl max-h-[90%]" onClick={(e) => e.stopPropagation()}>
                <img
                  src={images[modalImageIndex]}
                  alt={`Screenshot ${modalImageIndex + 1}`}
                  className="rounded-md max-h-full max-w-full object-contain"
                />
                <button
                  className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1"
                  onClick={closeModal}
                >
                  <X className="w-5 h-5" />
                </button>
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-1"
                      onClick={prevImage}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-1"
                      onClick={nextImage}
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        <AnimatePresence>
  {(selectedAction === "resolve" || selectedAction === "escalate") && (
    <motion.div
      key={selectedAction}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute top-0 right-0 w-full lg:w-[360px] bg-white border-l border-[#D5E3EC] h-full p-6 flex flex-col gap-4"
    >
 
        <>
          <h4 className="font-semibold text-[#1E516A]">Document Attachment</h4>
          <div className="border border-dashed border-[#BFD7EA] rounded-lg flex flex-col items-center justify-center p-6 text-gray-500 hover:bg-[#F9FBFC] transition">
            <Upload className="w-8 h-8 mb-2 text-[#1E516A]" />
            <p className="text-sm">
              Drag your file(s) or{" "}
              <span className="text-[#1E516A] underline cursor-pointer">
                browse
              </span>
            </p>
            <p className="text-xs mt-1">Max xx MB files allowed</p>
          </div>

          <h4 className="font-semibold text-[#1E516A] mt-6">
            Resolution Detail
          </h4>
          <textarea
            className="w-full border border-[#BFD7EA] rounded-lg p-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-[#1E516A]"
            placeholder="Describe how you solved this issue"
          ></textarea>
 {selectedAction === "resolve" ? (<>
 <div className="w-full flex justify-end">
            <button
              onClick={handleSubmitDocument}
              className="px-4 py-2 rounded-md bg-[#1E516A] text-white font-semibold"
            >
              Confirm
            </button>
          </div></>):(<>
            <div className="w-full flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md bg-[#1E516A] text-white font-semibold"
            >
              Confirm
            </button>
          </div>
          </>)}
        </>
    
    </motion.div>
  )}
</AnimatePresence>

        </div>
      </div>
   
    </>
  );
}
