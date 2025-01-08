import AvatarWithUniqueNameAvatar from "@components/common/AvatarWithUniqueName";
import { useUser } from "@hooks/useUser";
import type { Department } from "@ou-ca/api/models";
import { useApiDepartmentInfoQuery } from "@services/api/department/api-department-queries";
import type { FunctionComponent } from "react";
import TableCellActionButtons from "../common/TableCellActionButtons";

type DepartmentTableRowProps = {
  department: Department;
  onEditClicked?: (department: Department) => void;
  onDeleteClicked?: (department: Department) => void;
};

const DepartmentTableRow: FunctionComponent<DepartmentTableRowProps> = ({
  department,
  onEditClicked,
  onDeleteClicked,
}) => {
  const { data: departmentInfo } = useApiDepartmentInfoQuery(department.id);

  const user = useUser();

  const isOwner = user != null && department?.ownerId === user.id;

  return (
    <tr className="table-hover">
      <td>{department.code}</td>
      <td>{departmentInfo?.townsCount}</td>
      <td>{departmentInfo?.localitiesCount}</td>
      <td>{departmentInfo?.ownEntriesCount}</td>
      <td align="center" className="w-32">
        <AvatarWithUniqueNameAvatar input={department.ownerId} />
      </td>
      <td align="center" className="w-32">
        <TableCellActionButtons
          canEdit={isOwner || user?.permissions.department.canEdit}
          canDelete={departmentInfo?.canBeDeleted && (isOwner || user?.permissions.department.canDelete)}
          onEditClicked={() => onEditClicked?.(department)}
          onDeleteClicked={() => onDeleteClicked?.(department)}
        />
      </td>
    </tr>
  );
};

export default DepartmentTableRow;
