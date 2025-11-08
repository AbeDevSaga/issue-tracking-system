import PageMeta from "../../components/common/PageMeta";
import RoleListTable from "../../components/tables/BasicTables/RoleListTable";

export default function Roles() {
  return (
    <>
      <PageMeta
        title="Role/Permission Management"
        description="This is the role management page"
      />
      <div className="space-y-1">
        <RoleListTable />
      </div>
    </>
  );
}
