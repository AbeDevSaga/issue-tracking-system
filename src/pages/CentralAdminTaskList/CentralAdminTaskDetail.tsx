import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import PageMeta from "../../components/common/PageMeta";
import { Upload, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Screenshot1 from "../../assets/screenshot1.png";
import Screenshot2 from "../../assets/screenshot2.png";
import Screenshot3 from "../../assets/screenshot2.png";
import AssignDeveloper from "./QAExpertTaskModal";
import { toast } from "sonner";
export default function CentralAdminTask_Detail() {
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = (index: number) => setModalImageIndex(index);
  const closeModal = () => setModalImageIndex(null);

  const handleMarkAsInProgress = async () => {
    try {
      toast.success("Status updated to In Progress!");
      setSelectedAction(null);
    } catch (error) {
      toast.error("Error updating status.");
      console.error(error);
    }
  };

  const openAssignModal = () => {
    setIsModalOpen(true);
  };
  const closeAssignModal = () => {
    setIsModalOpen(false);
  };
  const handleFormSubmit = (values: Record<string, any>) => {
    toast.success("Developer Assigned successfully!");
    closeAssignModal();
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Issue Esclated successfully!");
    setSelectedAction(null);
  };
  const handleSubmitDocument = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Issue Solved successfully!");
    setSelectedAction(null);
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

              <h3 className="text-[#1E516A] font-semibold text-lg mt-4 mb-3 flex items-center gap-2">
                🎯 Select Action
              </h3>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                {[
                  {
                    key: "mark_as_inprogress",
                    label: "Mark as Inprogress",
                    desc: "Start working on this issue It will update the status to “In progress",
                    color: "#c2b56cff",
                    bg: "#E7F3FF",
                    border: "#BFD7EA",
                  },
                  {
                    key: "resolve",
                    label: "Resolve Issue",
                    desc: "You have fixed the issue. Provide resolution detail to close the issue.",
                    color: "#1E516A",
                    bg: "#E7F3FF",
                    border: "#BFD7EA",
                  },
                  {
                    key: "escalate",
                    label: "Escalate Issue",
                    desc: "This issue requires advanced debugging or specialized expertise from EAII.",
                    color: "#6D28D9",
                    bg: "#F5F3FF",
                    border: "#D9D3FA",
                  },
                ].map((action) => (
                  <button
                    key={action.key}
                    onClick={() => {
                      if (action.key === "mark_as_inprogress") {
                        handleMarkAsInProgress();
                          setSelectedAction(action.key);
                      } else {
                        setSelectedAction(action.key);
                      }
                    }}
                    className={`flex-1 text-left border rounded-lg p-4 transition-all ${selectedAction === action.key
                      ? `border-[${action.border}] bg-[${action.bg}]`
                      : "border-[#D5E3EC] bg-white"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAction === action.key
                          ? `border-[${action.color}]`
                          : "border-gray-300"
                          }`}
                      >
                        {selectedAction === action.key && (
                          <CheckCircle2
                            className="w-4 h-4"
                            style={{ color: action.color }}
                          />
                        )}
                      </div>
                      <p className="font-semibold text-[#1E516A]">
                        {action.label}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">{action.desc}</p>
                  </button>
                ))}
              </div>
              {/* <div className="max-w-[1200px] mx-auto p-6 flex flex-col gap-6"> 
                            <div className="grid md:grid-cols-2 gap-6"> 
                            <div className="bg-[#F5F8FA] border border-[#D1E3F0] rounded-lg p-4"> 
                            <h4 className="font-semibold text-[#1E516A] mb-2">Developer’s Note</h4> 
                            <p className="text-gray-700 text-sm mb-2">Explanation of fix and affected files</p> 
                            <div className="bg-[#EAF2FA] border border-[#BFD7EA] rounded-md p-3 text-sm text-gray-700"> Updated authentication handler in auth.service.ts. Fixed token validation logic that was incorrectly comparing hashed passwords. Also updated session management to properly handle concurrent logins. </div> 
                            </div> <div className="bg-[#F5F8FA] border border-[#D1E3F0] rounded-lg p-4">
                             <h4 className="font-semibold text-[#1E516A] mb-2">Action Taken</h4>
                              <div className="bg-[#EAF2FA] border border-[#BFD7EA] rounded-md p-3 text-sm text-gray-700"> 
                              <ul className="list-disc list-inside space-y-1"> <li>Reconfigured authentication module.</li>
                               <li>Restarted service.</li> <li>Verified login with test accounts.</li> </ul>
                                </div> </div> </div> <div className="grid gap-6"> <div className="bg-white border border-[#BFD7EA] rounded-lg p-3 flex-1">
                                 <h4 className="font-semibold text-[#1E516A] mb-2">Solved Issue Images</h4>
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
                             </div> 
                             </div> */}
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
          {selectedAction === "resolve" ? (<>Resolution Detail</>):(<>Esclation Reason</>)}  
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
      {isModalOpen && (
        <AssignDeveloper
          onClose={closeAssignModal}
          onSubmit={handleFormSubmit}
          fields={[
            {
              id: "developer",
              label: t("TLTask.developer"),
              type: "select",
              options: [
                { value: "developer1", label: "Developer 1" },
                { value: "developer2", label: "Developer 2" },
              ],
              placeholder: "Select developer",
            },
            {
              id: "priority_level",
              label: "Priority Level",
              type: "select",
              options: [
                { value: "High", label: "High" },
                { value: "Medium", label: "Medium" },
                { value: "Low", label: "Low" },
              ],
            },
            {
              id: "deadline",
              label: "Deadline",
              type: "date",
              placeholder: "Enter ",
            },
            {
              id: "task_summary",
              label: t("TLTask.task_summary"),
              type: "textarea",
              placeholder: "Enter Task Summary",
            },
            {
              id: "document_attachement",
              label: "Document Attachement",
              type: "file",
              placeholder: "Enter Task Summary",
            },

          ]}
        />
      )}
    </>
  );
}
