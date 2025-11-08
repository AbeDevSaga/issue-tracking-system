import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import DeveloperTaskListTable from "../../components/tables/BasicTables/DeveloperTaskListTable";
import { useTranslation } from "react-i18next";
export default function TaskList() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("DeveloperTask.developer_task_list")}
        description={t("DeveloperTask.developer_task_list", { title: t("DeveloperTask.title") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("DeveloperTask.title")} desc={t("DeveloperTask.subtitle")}>
          <DeveloperTaskListTable />
        </ComponentCard>
      </div>
    </>
  );
}
