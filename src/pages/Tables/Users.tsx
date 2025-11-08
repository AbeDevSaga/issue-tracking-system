import { useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import UsersTable from "../../components/tables/BasicTables/UsersTable";

export default function Users() {
  const [showTrash, setShowTrash] = useState(false);

  return (
    <>
      <PageMeta
        title="User Management"
        description="This is the user management page"
      />
      <div className="space-y-1">
        <ComponentCard title="User Management">
          <UsersTable showTrash={showTrash} setShowTrash={setShowTrash} />
        </ComponentCard>
      </div>
    </>
  );
}
