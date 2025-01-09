import type { Department, DepartmentCreateInput, DepartmentFindManyInput } from "@domain/department/department.js";
import type { EntityFailureReason } from "@domain/shared/failure-reason.js";
import type { Result } from "neverthrow";

export type DepartmentRepository = {
  findDepartmentById: (id: number) => Promise<Department | null>;
  findDepartmentByTownId: (townId: number | undefined) => Promise<Department | null>;
  findDepartments: (
    { orderBy, sortOrder, q, offset, limit }: DepartmentFindManyInput,
    ownerId?: string,
  ) => Promise<Department[]>;
  getCount: (q?: string | null) => Promise<number>;
  getEntriesCountById: (id: string, ownerId?: string) => Promise<number>;
  createDepartment: (departmentInput: DepartmentCreateInput) => Promise<Result<Department, EntityFailureReason>>;
  createDepartments: (departmentInputs: DepartmentCreateInput[]) => Promise<Department[]>;
  updateDepartment: (
    departmentId: number,
    departmentInput: DepartmentCreateInput,
  ) => Promise<Result<Department, EntityFailureReason>>;
  deleteDepartmentById: (departmentId: number) => Promise<Department | null>;
};
