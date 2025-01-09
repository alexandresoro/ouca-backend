import type { DepartmentCreateInput, DepartmentFailureReason } from "@domain/department/department.js";
import type { AccessFailureReason, DeletionFailureReason } from "@domain/shared/failure-reason.js";
import type { LoggedUser } from "@domain/user/logged-user.js";
import type { DepartmentRepository } from "@interfaces/department-repository-interface.js";
import type { LocalityRepository } from "@interfaces/locality-repository-interface.js";
import type { TownRepository } from "@interfaces/town-repository-interface.js";
import type { DepartmentsSearchParams, UpsertDepartmentInput } from "@ou-ca/common/api/department.js";
import type { Department } from "@ou-ca/common/api/entities/department.js";
import { type Result, err, ok } from "neverthrow";
import { getSqlPagination } from "../entities-utils.js";

type DepartmentServiceDependencies = {
  departmentRepository: DepartmentRepository;
  townRepository: TownRepository;
  localityRepository: LocalityRepository;
};

export const buildDepartmentService = ({
  departmentRepository,
  townRepository,
  localityRepository,
}: DepartmentServiceDependencies) => {
  const findDepartment = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const department = await departmentRepository.findDepartmentById(id);
    return ok(department);
  };

  const getEntriesCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await departmentRepository.getEntriesCountById(id, loggedUser.id));
  };

  const getLocalitiesCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await localityRepository.getCount(undefined, undefined, id));
  };

  const getTownsCountByDepartment = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await townRepository.getCount(undefined, id));
  };

  const isDepartmentUsed = async (
    id: string,
    loggedUser: LoggedUser | null,
  ): Promise<Result<boolean, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const totalTownsWithDepartment = await townRepository.getCount(id);

    return ok(totalTownsWithDepartment > 0);
  };

  const findDepartmentOfTownId = async (
    communeId: string | undefined,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department | null, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const department = await departmentRepository.findDepartmentByTownId(
      communeId ? Number.parseInt(communeId) : undefined,
    );
    return ok(department);
  };

  const findAllDepartments = async (): Promise<Department[]> => {
    const departments = await departmentRepository.findDepartments({
      orderBy: "code",
    });

    return departments;
  };

  const findPaginatedDepartments = async (
    loggedUser: LoggedUser | null,
    options: DepartmentsSearchParams,
  ): Promise<Result<Department[], AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    const { q, orderBy: orderByField, sortOrder, ...pagination } = options;

    const departments = await departmentRepository.findDepartments(
      {
        q,
        ...getSqlPagination(pagination),
        orderBy: orderByField,
        sortOrder,
      },
      loggedUser.id,
    );

    return ok(departments);
  };

  const getDepartmentsCount = async (
    loggedUser: LoggedUser | null,
    q?: string | null,
  ): Promise<Result<number, AccessFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    return ok(await departmentRepository.getCount(q));
  };

  const createDepartment = async (
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department, DepartmentFailureReason>> => {
    if (!loggedUser?.permissions.department.canCreate) {
      return err("notAllowed");
    }

    const createdDepartmentResult = await departmentRepository.createDepartment({
      ...input,
      ownerId: loggedUser.id,
    });

    return createdDepartmentResult;
  };

  const updateDepartment = async (
    id: number,
    input: UpsertDepartmentInput,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department, DepartmentFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.department.canEdit) {
      const existingData = await departmentRepository.findDepartmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const updatedDepartmentResult = await departmentRepository.updateDepartment(id, input);

    return updatedDepartmentResult;
  };

  const deleteDepartment = async (
    id: number,
    loggedUser: LoggedUser | null,
  ): Promise<Result<Department | null, DeletionFailureReason>> => {
    if (!loggedUser) {
      return err("notAllowed");
    }

    // Check that the user is allowed to modify the existing data
    if (!loggedUser.permissions.department.canDelete) {
      const existingData = await departmentRepository.findDepartmentById(id);

      if (existingData?.ownerId !== loggedUser?.id) {
        return err("notAllowed");
      }
    }

    const isEntityUsedResult = await isDepartmentUsed(`${id}`, loggedUser);

    if (isEntityUsedResult.isErr()) {
      return err(isEntityUsedResult.error);
    }

    const isEntityUsed = isEntityUsedResult.value;
    if (isEntityUsed) {
      return err("isUsed");
    }

    const deletedDepartment = await departmentRepository.deleteDepartmentById(id);
    return ok(deletedDepartment);
  };

  const createDepartments = async (
    departments: Omit<DepartmentCreateInput, "ownerId">[],
    loggedUser: LoggedUser,
  ): Promise<readonly Department[]> => {
    const createdDepartments = await departmentRepository.createDepartments(
      departments.map((department) => {
        return { ...department, ownerId: loggedUser.id };
      }),
    );

    return createdDepartments;
  };

  return {
    findDepartment,
    getEntriesCountByDepartment,
    getLocalitiesCountByDepartment,
    getTownsCountByDepartment,
    isDepartmentUsed,
    findDepartmentOfTownId,
    findAllDepartments,
    findPaginatedDepartments,
    getDepartmentsCount,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createDepartments,
  };
};

export type DepartmentService = ReturnType<typeof buildDepartmentService>;
