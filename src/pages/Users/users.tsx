import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UserTable from "../../components/tables/BasicTables/userTable";
import { useTranslation } from "react-i18next";
export default function Users() {
      const { t } = useTranslation();
    
  return (
    <>
      <PageMeta
        title={t("basedata.user_management")}
        description={t("basedata.subtitle", { title: t("basedata.users") })}
      />
    
      <div className="space-y-1">
        <ComponentCard title={t("basedata.user_management")}>
          <UserTable />
        </ComponentCard>
      </div>
    </>
  );
}
