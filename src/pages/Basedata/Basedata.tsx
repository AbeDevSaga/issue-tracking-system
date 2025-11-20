import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import InfoCard from "../../components/Basedata/card";
import {
  FaProjectDiagram,
  FaExclamationTriangle,
  FaFlag,
  FaBuilding,
} from "react-icons/fa";

export default function Basedata() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const cards = [
    // {
    //   title: t("basedata.organization_management"),
    //   description: t("basedata.subtitle", {
    //     title: t("basedata.organization"),
    //   }),
    //   icon: <FaBuilding size={24} color={"#094C81"} />,
    //   route: "/organization",
    // },
    // {
    //   title: t("basedata.org_structure_management"),
    //   description: t("basedata.subtitle", {
    //     title: t("basedata.org_structure"),
    //   }),
    //   icon: <FaBuilding size={24} color={"#094C81"} />,
    //   route: "/org_structure",
    // },
    // {
    //   title: t("basedata.level_management"),
    //   description: t("basedata.subtitle", { title: t("basedata.level") }),
    //   icon: <FaBuilding size={24} />,
    //   route: "/branch",
    // },

    // {
    //   title: t("basedata.branch_management"),
    //   description: t("basedata.subtitle", { title: t("basedata.branch") }),
    //   icon: <FaBuilding size={24} color={"#094C81"} />,
    //   route: "/branch",
    // },

    // {
    //   title: t("basedata.project_management"),
    //   description: t("basedata.subtitle", { title: t("basedata.project") }),
    //   icon: <FaProjectDiagram size={24} color={"#094C81"} />,
    //   route: "/project",
    // },
    {
      title: t("basedata.priority_level_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.priority_level"),
      }),
      icon: <FaFlag size={24} color={"#094C81"} />,
      route: "/priority_level",
    },

    {
      title: t("basedata.issue_category_management"),
      description: t("basedata.subtitle", {
        title: t("basedata.issue_category"),
      }),
      icon: <FaExclamationTriangle size={24} color={"#094C81"} />,
      route: "/issue_category",
    },
    {
      title: t("basedata.role"),
      description: t("basedata.subtitle", {
        title: t("basedata.role"),
      }),
      icon: <FaExclamationTriangle size={24} />,
      route: "/role",
    },
    {
      title: t("basedata.permission"),
      description: t("basedata.subtitle", {
        title: t("basedata.permission"),
      }),
      icon: <FaExclamationTriangle size={24} />,
      route: "/permission",
    },
  ];

  return (
    <>
      <PageMeta title={t("basedata.title")} description="" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5">
        <h3 className="text-xl lg:text-2xl font-bold text-[#11255A] dark:text-white/90">
          {t("basedata.title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("basedata.first_subtitle")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {cards.map((card, index) => (
            <InfoCard
              key={index}
              title={card.title}
              description={card.description}
              icon={card.icon}
              buttonText={t("common.viewButton")}
              onClick={() => navigate(card.route)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
