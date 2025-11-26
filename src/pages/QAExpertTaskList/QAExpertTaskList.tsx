import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import TeamLeaderTaskListTable from "../../components/tables/BasicTables/QAExpertTaskListTable";
import { useTranslation } from "react-i18next";
export default function TaskList() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("TLTask.tl_task_list")}
        description={t("TLTask.tl_task_list", { title: t("TLTask.title") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("TLTask.title")} desc={t("TLTask.subtitle")}>
          <TeamLeaderTaskListTable />
        </ComponentCard>
      </div>
    </>
  );
}
