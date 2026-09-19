export interface RecipeItemDto {
  id?: number;
  rawMaterialId: number;
  rawMaterialName?: string | null;
  quantity: number;
  unitId?: number | null;
  unitName?: string | null;
  unitAbbr?: string | null;
}

export interface CreateRecipeDto {
  productId: number;
  name: string;
  yieldQuantity?: number;
  instructions?: string;
  isActive?: boolean;
  items: {
    rawMaterialId: number;
    quantity: number;
    unitId?: number;
  }[];
}

export interface UpdateRecipeDto {
  productId?: number;
  name?: string;
  yieldQuantity?: number;
  instructions?: string;
  isActive?: boolean;
  items?: {
    rawMaterialId: number;
    quantity: number;
    unitId?: number;
  }[];
}

export interface RecipeResponseDto {
  id: number;
  productId: number;
  productName: string | null;
  name: string;
  yieldQuantity: number;
  instructions: string | null;
  isActive: boolean;
  createdAt: Date;
  items: RecipeItemDto[];
}
