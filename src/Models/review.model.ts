export interface ReviewResponse {
  id: number;
  customerId: number;
  customerNom: string;
  note: number;
  commentaire: string;
  dateCreation: string;
  approuve: boolean;
}
