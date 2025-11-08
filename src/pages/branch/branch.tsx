import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import BranchTable from "../../components/tables/BasicTables/branchTable";
import { useTranslation } from "react-i18next";
export default function Branch() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.branch_management")}
        description={t("basedata.subtitle", { title: t("basedata.branch") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.branch_management")}>
          <BranchTable />
        </ComponentCard>
      </div>
    </>
  );
}
