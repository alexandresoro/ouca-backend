import { getV1InventoriesResponse } from "@ou-ca/api/zod/inventory.zod";
import { useApiFetch } from "@services/api/useApiFetch";
import { InfoCircle } from "@styled-icons/boxicons-regular";
import { type FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router";

const LastInventory: FunctionComponent = () => {
  const { t } = useTranslation();

  const fetchLastInventory = useApiFetch({
    schema: getV1InventoriesResponse,
  });

  const [inventoryId, setInventoryId] = useState<string | null | undefined>();

  useEffect(() => {
    void fetchLastInventory({
      path: "/inventories",
      queryParams: {
        orderBy: "creationDate",
        sortOrder: "desc",
        pageNumber: 1,
        pageSize: 1,
      },
    }).then((data) => {
      if (data?.data.length === 0) {
        setInventoryId(null);
      } else {
        setInventoryId(data?.data?.[0].id);
      }
    });
  }, [fetchLastInventory]);

  if (inventoryId === null) {
    return (
      <div className="container mx-auto mt-10">
        <div className="alert alert-info">
          <InfoCircle className="h-6" />
          {t("noInventoryExists")}
        </div>
      </div>
    );
  }

  return <>{inventoryId && <Navigate to={`/inventory/${inventoryId}`} replace={true} />}</>;
};

export default LastInventory;
