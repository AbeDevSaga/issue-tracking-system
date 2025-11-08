import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import QATaskListTable from "../../components/tables/BasicTables/QATaskListTable";
import { useTranslation } from "react-i18next";
export default function TaskList() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("QATask.qa_task_list")}
        description={t("QATask.qa_task_list", { title: t("QATask.title") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("QATask.title")} desc={t("QATask.subtitle")}>
          <QATaskListTable />
        </ComponentCard>
      </div>
    </>
  );
}
