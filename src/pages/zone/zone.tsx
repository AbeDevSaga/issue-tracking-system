import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import ZoneTable from "../../components/tables/BasicTables/zoneTable";
import { useTranslation } from "react-i18next";
export default function Zone() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.zone_management")}
        description={t("basedata.subtitle", { title: t("basedata.zone") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.zone_management")}>
          <ZoneTable />
        </ComponentCard>
      </div>
    </>
  );
}
