import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import WoredaTable from "../../components/tables/BasicTables/woredaTable";
import { useTranslation } from "react-i18next";
export default function Woreda() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.woreda_management")}
        description={t("basedata.subtitle", { title: t("basedata.woreda") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.woreda_management")}>
          <WoredaTable />
        </ComponentCard>
      </div>
    </>
  );
}
