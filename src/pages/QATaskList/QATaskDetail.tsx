import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";
import { Upload, CheckCircle2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Screenshot1 from "../../assets/screenshot1.png";
import Screenshot2 from "../../assets/screenshot2.png";
import Screenshot3 from "../../assets/screenshot2.png";
import Alert from "../../components/ui/alert/Alert";
import { motion, AnimatePresence } from "framer-motion";

export default function TeamLeaderTask_Detail() {
  const { t } = useTranslation();
  const [modalImageIndex, setModalImageIndex] = useState<number | null>(null);
  const images = [Screenshot2, Screenshot1, Screenshot3];
  const closeModal = () => setModalImageIndex(null);
  const openModal = (index: number) => setModalImageIndex(index);
const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedOfficer, setSelectedOfficer] = useState("");
const [assignmentNote, setAssignmentNote] = useState("");
const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(
    null
  );
  const prevImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex - 1 + images.length) % images.length);
    }
  };
  interface TeamMember {
  id: string;
  name: string;
}
interface Project {
  id: string;
  project_name: string;
  backend_team: TeamMember[];
  frontend_team: TeamMember[];
  api_team: TeamMember[];
  devops_team: TeamMember[];
  mobile_team: TeamMember[];
  qa_team: TeamMember[];
}

  const mockUsers: TeamMember[] = [
  { id: "u1", name: "Alice" },
  { id: "u2", name: "Bob" },
  { id: "u3", name: "Charlie" },
  { id: "u4", name: "Dina" },
  { id: "u5", name: "Elias" },
];

const mockProjects: Project[] = [
  {
    id: "proj001",
    project_name: "Addis Ababa Revamp",
    backend_team: [mockUsers[0], mockUsers[1]],
    frontend_team: [mockUsers[2]],
    api_team: [mockUsers[1], mockUsers[3]],
    devops_team: [mockUsers[4]], 
    mobile_team: [mockUsers[0], mockUsers[4]],
    qa_team: [mockUsers[2]],
  },
];
  const nextImage = () => {
    if (modalImageIndex !== null) {
      setModalImageIndex((modalImageIndex + 1) % images.length);
    }
  };
const handleAssignSubmit = async () => {
  if (!selectedOfficer) {

    setAlert({ type: "error", message: "Please select a QA officer before submitting." });

    return;
  }

  setIsSubmitting(true);

  try {



    setAlert({ type: "success", message: "QA officer assigned successfully!" });

    setShowAssignModal(false);
    setSelectedOfficer("");
    setAssignmentNote("");
  } catch (error) {
    console.error(error);
    setAlert({ type: "error", message: "Error assigning QA officer. Please try again." });

  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <>
      <PageMeta
        title="Bug Detail"
        description="Bug detail page"
      />
      <div className="bg-[#F9FBFC] p-4 flex flex-col lg:flex-row gap-4 pb-10">
        <div className="flex-1 bg-white rounded-xl shadow-md border border-dashed border-[#BFD7EA] p-4">
          <div className="bg-[#094C81] text-white font-semibold p-4 rounded mb-3 text-sm">
            BUG-2025-001
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3 text-sm">
            <div>
              <p className="font-semibold text-[#1E516A]">Category</p>
              <p className="text-gray-700">Mobile App</p>
            </div>
            <div>
              <p className="font-semibold text-[#1E516A]">Reported By</p>
              <p className="text-gray-700">AA Land Admin Center Admin</p>
            </div>
            <div>
              <p className="font-semibold text-[#1E516A]">Reported Date</p>
              <p className="text-gray-700">08/06/2025</p>
            </div>
            <div>
              <p className="font-semibold text-[#1E516A]">Status</p>
              <p className="text-gray-700">New</p>
            </div>
          </div>

          <div className="rounded-md p-1 mb-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                <p className="font-semibold text-[#1E516A] text-sm mb-1">Description</p>
                Database connection timeout occurring during peak hours
              </div>

              <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                <p className="font-semibold text-[#1E516A] text-sm mb-1">
                  Escalation Reason Submitted by Center Admin
                </p>
                Database connection timeout occurring during peak hours
              </div>

              <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700">
                <p className="font-semibold text-[#1E516A] text-sm mb-1">Action Taken</p>
                Beyond Our Capacity
              </div>
            </div>
          </div>

   <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700 flex items-center justify-between">
    <p className="font-semibold font-[20px] text-[#1E516A] text-sm">Assigned QA Expert:</p>
    <p className="text-sm text-gray-700 font-medium ml-2">Hana Alemu</p>
  </div>

  <div className="bg-[#094C810D] border border-[#BFD7EA] rounded-md p-3 text-gray-700 flex items-center justify-between">
    <p className="font-semibold text-[#1E516A] text-sm">Assigned Developer:</p>
    <p className="text-sm text-gray-700 font-medium ml-2">Abebe Kebede</p>
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
  <div className="bg-white border border-[#BFD7EA] rounded-lg p-3 flex-1">
            <h4 className="font-semibold text-[#1E516A] mb-2">
              Developer Attachement
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
          <div className="flex items-center justify-between border border-[#BFD7EA] rounded-md p-2 mt-4 mb-3 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-700" />
              <p className="text-gray-700 text-xs">crash-log.pdf • 11/3/2025, 7:45 PM</p>
            </div>
            <button className="px-2 py-1 border border-[#BFD7EA] rounded text-[#1E516A] text-xs font-semibold">
              View
            </button>
          </div>

          <div className="flex gap-2 justify-end">
           
            <button
              className="px-3 py-1 bg-[#1E516A] text-white rounded text-sm font-semibold"
              onClick={() => setShowAssignModal(true)}
            >
              Forward to QA Expert
            </button>

          </div>
        </div>

        <div className="w-full lg:w-[300px] flex flex-col gap-4">
          {/* <div className="bg-[#094C81] text-white rounded-lg p-3 text-sm">
            <p className="font-semibold mb-1">Quick Actions</p>
            <button className="w-full bg-white text-[#094C81] px-2 py-1 rounded font-semibold text-sm">
              Start Video Call
            </button>
            
          </div> */}
          <div className="bg-white border border-[#BFD7EA] rounded-lg overflow-hidden text-sm">
            <div className="bg-[#094C81] px-3 py-2">
              <p className="font-semibold text-[20px] text-white">Developer Fix Report</p>
            </div>

            <div className="p-3 flex flex-col gap-3">
              <div className="font-semibold  text-[#094C81]"> Fix Description</div>

              <p>The issue was identified as a problem with authentication module.The issue was identified as a problem with authentication module</p>
              {/* <div className="font-semibold  text-[#094C81]">Steps Taken</div>
              <ul className="list-disc pl-5">
                <li>Reviewed the authentication code</li>
                <li>Update the error handling logic</li>
                <li>Reviewed the authentication code</li>
              </ul> */}

            </div>
          </div>
  <div className="bg-white border border-[#BFD7EA] rounded-lg overflow-hidden text-sm">
  <div className="bg-[#094C81] px-3 py-2">
    <p className="font-semibold text-white">History</p>
  </div>

  <div className="p-3 flex flex-col gap-3">
    <div className="bg-[#F7FBFF] border border-[#BFD7EA] rounded-md p-3">
      {/* <div className="border-l-4 border-[#094C81] pl-3"> */}
        <p className="font-semibold text-[#1E516A]">Issue Created</p>
        <p className="text-xs text-gray-600">Initial report submitted</p>
        <p className="text-xs text-gray-400 mt-1">
          11/5/2025, 12:30 PM • By: Ahmed Hassan
        </p>
      {/* </div> */}
    </div>

    <div className="bg-[#F7FBFF] border border-[#BFD7EA] rounded-md p-3">
      {/* <div className="border-l-4 border-[#094C81] pl-3"> */}
        <p className="font-semibold text-[#1E516A]">Escalated to QA</p>
        <p className="text-xs text-gray-600">Beyond local capacity</p>
        <p className="text-xs text-gray-400 mt-1">
          11/5/2025, 12:30 PM • By: Tigist Mekonnen
        </p>
      {/* </div> */}
    </div>
  </div>
</div>

        </div>
      </div>
{showAssignModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-30 backdrop-blur-sm">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        onClick={() => setShowAssignModal(false)}
      >
        <X className="w-5 h-5" />
      </button>
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
      <h2 className="text-lg font-semibold text-[#1E516A] mb-3">
        Assign to QA Officer
      </h2>
    
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm font-semibold text-[#1E516A] mb-1">
      Select Quality Assurance Officer <span className="text-red-500">*</span>
    </label>
   <select
  value={selectedOfficer}
  onChange={(e) => setSelectedOfficer(e.target.value)}
  className="w-full border border-[#BFD7EA] rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E516A]"
>
  <option value="">Select officer</option>
  {mockProjects[0].qa_team.map((member) => (
    <option key={member.id} value={member.id}>
      {member.name}
    </option>
  ))}
</select>

  </div>

  <div>
    <label className="block text-sm font-semibold text-[#1E516A] mb-1">
      Assignment Note
    </label>
    <textarea 
      value={assignmentNote}
      onChange={(e) => setAssignmentNote(e.target.value)}
      placeholder="Add any specific instruction/note"
      className="w-full border border-[#BFD7EA] rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#1E516A]"
    />
  </div>
</div>

<div className="flex justify-end gap-2 mt-4">
  <button
    onClick={() => setShowAssignModal(false)}
    className="px-4 py-1 border border-[#BFD7EA] rounded text-[#1E516A] font-semibold text-sm"
  >
    Cancel
  </button>
  <button
    onClick={handleAssignSubmit}
    disabled={isSubmitting}
    className={`px-4 py-1 rounded text-sm font-semibold ${
      isSubmitting
        ? "bg-gray-400 text-white cursor-not-allowed"
        : "bg-[#1E516A] text-white hover:bg-[#0b3954]"
    }`}
  >
    {isSubmitting ? "Assigning..." : "Assign"}
  </button>
</div>

    </div>
  </div>
)}

    </>
  );
}
