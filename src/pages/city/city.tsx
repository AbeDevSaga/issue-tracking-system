import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import CityTable from "../../components/tables/BasicTables/cityTable";
import { useTranslation } from "react-i18next";
export default function City() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.city_management")}
        description={t("basedata.subtitle", { title: t("basedata.city") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.city_management")}>
          <CityTable />
        </ComponentCard>
      </div>
    </>
  );
}
