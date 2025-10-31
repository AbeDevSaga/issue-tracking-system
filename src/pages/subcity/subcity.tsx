import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import SubCityTable from "../../components/tables/BasicTables/subcityTable";
import { useTranslation } from "react-i18next";
export default function SubCity() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.subcity_management")}
        description={t("basedata.subtitle", { title: t("basedata.subcity") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.subcity_management")}>
          <SubCityTable />
        </ComponentCard>
      </div>
    </>
  );
}
