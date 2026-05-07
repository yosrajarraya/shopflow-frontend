export interface CategoryResponse {
  id: number;
  nom: string;
  description?: string;
  parentId?: number;
  children?: CategoryResponse[];
}

export interface CategoryRequest {
  nom: string;
  description?: string;
  parentId?: number;
}
