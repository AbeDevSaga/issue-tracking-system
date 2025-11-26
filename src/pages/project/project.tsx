// import ComponentCard from "../../components/common/ComponentCard";
// import PageMeta from "../../components/common/PageMeta";
// import ProjectTable from "../../components/tables/BasicTables/projectTable";

import ProjectList from "../../components/tables/lists/projectList";

// import { useTranslation } from "react-i18next";
export default function Project() {
  // const { t } = useTranslation();

  return (
    <>
      <ProjectList />
      {/* <PageMeta
        title={t("basedata.project_management")}
        description={t("basedata.subtitle", { title: t("basedata.project") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.project_management")}>
          <ProjectTable />
        </ComponentCard>
      </div> */}
    </>
  );
}
