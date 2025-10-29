import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UsersTable from "../../components/tables/BasicTables/UsersTable";

export default function Users() {
  return (
    <>
      <PageMeta
        title="Users Management"
        description=""
      />
    
      <div className="space-y-1">
        <ComponentCard title="Users Management">
          <UsersTable />
        </ComponentCard>
      </div>
    </>
  );
}
