import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import SubroleTable from "../../components/tables//BasicTables/subRoleTable";
import { useTranslation } from "react-i18next";
export default function City() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.role_management")}
        description={t("basedata.subtitle", { title: t("basedata.role") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.role_management")}>
          <SubroleTable />
        </ComponentCard>
      </div>
    </>
  );
}
