// import ComponentCard from "../../components/common/ComponentCard";
// import PageMeta from "../../components/common/PageMeta";
// import OrganizationTable from "../../components/tables/BasicTables/organizationTable";
// import { useTranslation } from "react-i18next";
import BunchInstituteList from "./inistituteList";
export default function BunchCreation() {
  // const { t } = useTranslation();

  return (
    <>
      <BunchInstituteList />
      {/* <PageMeta
        title={t("basedata.organization_management")}
        description={t("basedata.subtitle", { title: t("basedata.organization") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.organization_management")}>
          <OrganizationTable />
        </ComponentCard>
      </div> */}
    </>
  );
}
