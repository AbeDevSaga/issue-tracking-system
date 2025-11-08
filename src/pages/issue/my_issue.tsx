import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import MyIssueTable from "../../components/tables/BasicTables/myIssueTable";
import { useTranslation } from "react-i18next";
export default function IssueCategory() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("issue.myissue")}
        description={t("basedata.subtitle", { title: t("issue.myissue") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("issue.issue_management")}>
          <MyIssueTable />
        </ComponentCard>
      </div>
    </>
  );
}
