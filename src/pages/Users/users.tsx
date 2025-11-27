import { Users } from "lucide-react";
import UserList from "../../components/tables/lists/userList";
import { ActionButton } from "../../types/layout";
import { useState } from "react";
import { useGetUserTypesQuery } from "../../redux/services/userApi";

// import { useTranslation } from "react-i18next";
export default function UsersPage() {
  // const { t } = useTranslation();
  const { data: userTypesResponse, isLoading: loadingUserTypes } =
    useGetUserTypesQuery();
  const internalUserType = userTypesResponse?.data?.find(
    (t) => t.name === "internal_user"
  );

  const externalUserType = userTypesResponse?.data?.find(
    (t) => t.name === "external_user"
  );

  const [activeTab, setActiveTab] = useState<"internal" | "external">(
    "internal"
  );

  const actions: ActionButton[] = [
    {
      label: "Internal Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "internal" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("internal"),
    },
    {
      label: "External Users",
      icon: <Users className="h-4 w-4" />,
      variant: activeTab === "external" ? "default" : "outline",
      size: "default",
      onClick: () => setActiveTab("external"),
    },
  ];

  return (
    <>
      {activeTab === "internal" && (
        <UserList
          user_type="internal_user"
          user_type_id={internalUserType?.user_type_id}
          toggleActions={actions}
        />
      )}

      {activeTab === "external" && (
        <UserList
          user_type_id={externalUserType?.user_type_id}
          user_type="external_user"
          toggleActions={actions}
        />
      )}
    </>
  );
}
