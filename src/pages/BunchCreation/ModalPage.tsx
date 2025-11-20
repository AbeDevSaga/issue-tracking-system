"use client";

import React, { useEffect, useState } from "react";
import { BunchCreateInstituteModal } from "./CreateInstituteModal";
import { BunchCreateProjectModal } from "./CreateProjectModal";

interface ModalPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalPage({ isOpen, onClose }: ModalPageProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<Record<string, any>>({});

  // When ModalPage opens, start with step 1
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setOrganizationId(null);
      setSavedData({});
    }
  }, [isOpen]);

  const handleOrganizationCreated = (id: string) => {
    setOrganizationId(id);
    setSavedData((prev) => ({ ...prev, organizationId: id }));
    setStep(2); // Move to next step automatically
  };

  const handleProjectCreated = () => {
    setSavedData((prev) => ({ ...prev, projectCreated: true }));
    onClose(); // Close only after last step
  };

  const handleInstituteModalClose = () => {
    if (step === 1) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Step 1: Organization Creation */}
      {step === 1 && (
        <BunchCreateInstituteModal
          isOpen={true}
          onClose={handleInstituteModalClose}
          onCreated={handleOrganizationCreated}
        />
      )}

      {/* Step 2: Project Creation */}
      {step === 2 && organizationId && (
        <BunchCreateProjectModal
          isOpen={true}
          instituteId={organizationId}
          onClose={handleProjectCreated}
        />
      )}
    </>
  );
}
