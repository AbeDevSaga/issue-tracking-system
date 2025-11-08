import React from "react";

interface InfoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  buttonText?: string;
  onClick?: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  description,
  icon,
  buttonText = "View",
  onClick,
}) => {
  return (
    <div className="flex flex-col justify-between p-4 bg-white rounded-xl shadow-[0_4px_15px_rgba(9,76,129,0.4)] border border-gray-200 dark:bg-gray-800 dark:border-gray-700 w-full max-w-lg">
      <div className="flex items-center gap-3">
        {icon && <div className="text-blue-600 dark:text-blue-400">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 text-black dark:text-gray-100">
            {title}
          </h3>
          <p className="text-sm text-[#094C81] dark:text-[#094C81]">
            {description}
          </p>
        </div>
      </div>
      {onClick && (
        <div className="flex justify-end mt-4">
          <button
            onClick={onClick}
            className="px-4 py-1.5 bg-[#094C81] text-white text-sm font-medium rounded-lg hover:bg-[#07365c] transition"
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
};

export default InfoCard;
