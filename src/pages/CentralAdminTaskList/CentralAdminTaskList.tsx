import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CentralAdminTaskListTable from "../../components/tables/BasicTables/CentralAdminTaskListTable";
import { useTranslation } from "react-i18next";
export default function TaskList() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("CATask.ca_task_list")}
        description={t("CATask.CA_task_list", { title: t("CATask.title") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("CATask.title")} desc={t("CATask.subtitle")}>
          <CentralAdminTaskListTable />
        </ComponentCard>
      </div>
    </>
  );
}
