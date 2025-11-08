import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import RegionTable from "../../components/tables/BasicTables/regionTable";
import { useTranslation } from "react-i18next";
export default function City() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.region_management")}
        description={t("basedata.subtitle", { title: t("basedata.region") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.region_management")}>
          <RegionTable />
        </ComponentCard>
      </div>
    </>
  );
}
