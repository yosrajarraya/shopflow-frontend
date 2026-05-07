export interface AddressResponse {
  id: number;
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}

export interface AddressRequest {
  rue: string;
  ville: string;
  codePostal: string;
  pays: string;
  principal: boolean;
}
