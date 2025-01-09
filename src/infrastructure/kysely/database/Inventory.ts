export type Inventory = {
  id: string;
  observateurId: number;
  date: Date;
  heure: string | null;
  duree: string | null;
  lieuditId: number;
  altitude: number | null;
  longitude: number | null;
  latitude: number | null;
  temperature: number | null;
  dateCreation: Date;
  ownerId: string | null;
};
