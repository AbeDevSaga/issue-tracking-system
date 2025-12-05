import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import InfoCard from "../../components/Basedata/card";
import {
  FaExclamationTriangle,
  FaFlag,
  FaUserTie,
  FaLock,
  FaProjectDiagram,
  FaClock,
  FaUsers,
  FaCog,
  FaDatabase,
} from "react-icons/fa";
import {
  FiSettings,
  FiUsers,
  FiFlag,
  FiClock,
  FiAlertTriangle,
  FiGrid,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";
import { motion } from "framer-motion";

export default function Basedata() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    {
      title: t("basedata.issue_flow"),
      description: t("basedata.subtitle", { title: t("basedata.issue_flow") }),
      icon: <FiGrid className="w-8 h-8" />,
      route: "/issue_configuration",
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10",
      accentColor: "border-blue-500/20",
      iconColor: "text-blue-600",
      delay: 0.1,
    },
    {
      title: t("Response Time Management"),
      description: t("Response Time Management", {
        title: t("basedata.response_time"),
      }),
      icon: <FiClock className="w-8 h-8" />,
      route: "/response_times",
      color: "from-emerald-500 to-teal-500",
      gradient: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
      accentColor: "border-emerald-500/20",
      iconColor: "text-emerald-600",
      delay: 0.2,
    },
    {
      title: t("basedata.priority_level_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.priority_level"),
      }),
      icon: <FiTrendingUp className="w-8 h-8" />,
      route: "/priority_level",
      color: "from-amber-500 to-orange-500",
      gradient: "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
      accentColor: "border-amber-500/20",
      iconColor: "text-amber-600",
      delay: 0.3,
    },
    {
      title: t("Human Resource Management"),
      description: t("Human Resource Management", {
        title: t("basedata.project_human_resource"),
      }),
      icon: <FiUsers className="w-8 h-8" />,
      route: "/human_resource",
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-br from-purple-500/10 to-pink-500/10",
      accentColor: "border-purple-500/20",
      iconColor: "text-purple-600",
      delay: 0.4,
    },
    {
      title: t("basedata.issue_category_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.issue_category"),
      }),
      icon: <FiAlertTriangle className="w-8 h-8" />,
      route: "/issue_category",
      color: "from-rose-500 to-red-500",
      gradient: "bg-gradient-to-br from-rose-500/10 to-red-500/10",
      accentColor: "border-rose-500/20",
      iconColor: "text-rose-600",
      delay: 0.5,
    },
    {
      title: t("System Configuration"),
      description: "Advanced system settings and configurations",
      icon: <FiSettings className="w-8 h-8" />,
      route: "/system_config",
      color: "from-gray-600 to-gray-800",
      gradient: "bg-gradient-to-br from-gray-600/10 to-gray-800/10",
      accentColor: "border-gray-500/20",
      iconColor: "text-gray-600",
      delay: 0.6,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  return (
    <>
      <PageMeta title={t("basedata.title")} description="" />

      <div className="min-h-[85vh] bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <FaDatabase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-400">
                {t("basedata.title")}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-lg font-medium">
                {t("basedata.first_subtitle")}
              </p>
            </div>
          </div>

          <div className="max-w-3xl">
            <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
              Manage your system's foundational data with precision and ease.
              Configure workflows, set priorities, and organize resources in one
              centralized location.
            </p>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {cards.map((card, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              custom={card.delay}
              onClick={() => navigate(card.route)}
              className="group cursor-pointer"
            >
              <div
                className={`
                relative h-full rounded-2xl border-2 ${card.accentColor} 
                bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                shadow-lg shadow-black/5 dark:shadow-black/20
                overflow-hidden transition-all duration-300
                hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
                hover:border-opacity-40
              `}
              >
                {/* Background Gradient Effect */}
                <div
                  className={`
                  absolute inset-0 ${card.gradient} opacity-0 
                  group-hover:opacity-100 transition-opacity duration-500
                `}
                />

                {/* Content */}
                <div className="relative p-6 h-full flex flex-col">
                  {/* Icon with Gradient Background */}
                  <div
                    className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                    bg-gradient-to-br ${card.color}
                    shadow-lg shadow-black/10
                    transition-transform duration-300 group-hover:scale-110
                  `}
                  >
                    <div className="text-white">{card.icon}</div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow leading-relaxed">
                    {card.description}
                  </p>

                  {/* Action Button */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`
                      text-sm font-medium ${card.iconColor}
                      flex items-center gap-2
                      transition-all duration-300 group-hover:gap-3
                    `}
                    >
                      Configure
                      <svg
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Active
                      </span>
                    </div>
                  </div>

                  {/* Hover Line Effect */}
                  <div
                    className={`
                    absolute bottom-0 left-0 right-0 h-1 ${card.gradient.replace(
                      "/10",
                      ""
                    )}
                    transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left
                  `}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </>
  );
}
