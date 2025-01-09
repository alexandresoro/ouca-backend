export type AccessFailureReason = "notAllowed";

export type EntityFailureReason = "alreadyExists";

export type CannotDeleteReason = "isUsed";

export type CommonFailureReason = AccessFailureReason | EntityFailureReason;

export type DeletionFailureReason = AccessFailureReason | CannotDeleteReason;
