import type {
  Age,
  Behavior,
  BehaviorNicheur,
  Department,
  Environment,
  GetV1EntriesParams,
  Locality,
  Observer,
  Sex,
  Species,
  SpeciesClass,
  Town,
} from "@ou-ca/api/models";
import { atom } from "jotai";

export const searchEntriesFilterObserversAtom = atom<Observer[]>([]);

export const searchEntriesFilterFromDateAtom = atom<string | null>(null);

export const searchEntriesFilterToDateAtom = atom<string | null>(null);

const searchEntriesFilterInternalDepartmentsAtom = atom<Department[]>([]);

export const searchEntriesFilterDepartmentsAtom = atom<Department[], [Department[]], unknown>(
  (get) => get(searchEntriesFilterInternalDepartmentsAtom),
  (get, set, departments) => {
    set(searchEntriesFilterInternalDepartmentsAtom, departments);

    // If more than one department is selected, reset the towns filter
    // Here we want to allow the user to select towns directly - without having to select a department first
    if (departments.length > 1) {
      set(searchEntriesFilterTownsInternalAtom, []);
    } else if (departments.length === 1) {
      // If only a single department is selected, set the towns filter to the towns of that department
      const townsOfDepartments = get(searchEntriesFilterTownsInternalAtom).filter(
        ({ departmentId }) => departmentId === departments[0].id,
      );
      set(searchEntriesFilterTownsInternalAtom, townsOfDepartments);
    }
  },
);

const searchEntriesFilterTownsInternalAtom = atom<Town[]>([]);

export const searchEntriesFilterTownsAtom = atom<Town[], [Town[]], unknown>(
  (get) => get(searchEntriesFilterTownsInternalAtom),
  (_, set, towns) => {
    set(searchEntriesFilterTownsInternalAtom, towns);

    // If no town is selected or more than one, reset the localities filter
    if (towns.length !== 1) {
      set(searchEntriesFilterLocalitiesAtom, []);
    }
  },
);

export const searchEntriesFilterLocalitiesAtom = atom<Locality[]>([]);

export const searchEntriesFilterClassesAtom = atom<SpeciesClass[]>([]);

export const searchEntriesFilterSpeciesAtom = atom<Species[]>([]);

export const searchEntriesFilterSexesAtom = atom<Sex[]>([]);

export const searchEntriesFilterAgesAtom = atom<Age[]>([]);

export const searchEntriesFilterBehaviorsAtom = atom<Behavior[]>([]);

export const searchEntriesFilterBreedersAtom = atom<NonNullable<BehaviorNicheur>[]>([]);

export const searchEntriesFilterEnvironmentsAtom = atom<Environment[]>([]);

export const searchEntriesFilterCommentAtom = atom<string | null>(null);

export const searchEntriesFromAllUsersAtom = atom<boolean>(false);

export const searchEntriesCriteriaAtom = atom((get) => {
  const observerIds = get(searchEntriesFilterObserversAtom).map(({ id }) => id);
  const fromDate = get(searchEntriesFilterFromDateAtom) ?? undefined;
  const toDate = get(searchEntriesFilterToDateAtom) ?? undefined;
  const departmentIds = get(searchEntriesFilterInternalDepartmentsAtom).map(({ id }) => id);
  const townIds = get(searchEntriesFilterTownsInternalAtom).map(({ id }) => id);
  const localityIds = get(searchEntriesFilterLocalitiesAtom).map(({ id }) => id);
  const classIds = get(searchEntriesFilterClassesAtom).map(({ id }) => id);
  const speciesIds = get(searchEntriesFilterSpeciesAtom).map(({ id }) => id);
  const sexIds = get(searchEntriesFilterSexesAtom).map(({ id }) => id);
  const ageIds = get(searchEntriesFilterAgesAtom).map(({ id }) => id);
  const behaviorIds = get(searchEntriesFilterBehaviorsAtom).map(({ id }) => id);
  const breeders = get(searchEntriesFilterBreedersAtom);
  const environmentIds = get(searchEntriesFilterEnvironmentsAtom).map(({ id }) => id);
  const comment = get(searchEntriesFilterCommentAtom) ?? undefined;
  const fromAllUsers = get(searchEntriesFromAllUsersAtom);

  return {
    observerIds,
    fromDate,
    toDate,
    departmentIds,
    townIds,
    localityIds,
    classIds,
    speciesIds,
    sexIds,
    ageIds,
    behaviorIds,
    breeders: breeders.length ? breeders : undefined,
    environmentIds,
    comment: comment?.length ? comment : undefined,
    fromAllUsers,
  } satisfies Omit<GetV1EntriesParams, "pageNumber" | "pageSize" | "orderBy" | "sortOrder">;
});
