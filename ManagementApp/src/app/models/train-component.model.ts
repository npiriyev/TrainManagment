// Create a new file: models/train-component.model.ts

export interface TrainComponent {
    id: number;
    uniqueNumber: string;
    name: string;
    
    // This property has different types in backend vs frontend
    // Backend uses boolean, frontend uses string | number | boolean
    canAssign?: boolean;             // From backend API
    canAssignQuantity?: string | number; // For UI representation
    
    quantity?: number;
  }
  
  // View model specifically for UI display
  export interface TrainComponentViewModel {
    id: number;
    uniqueNumber: string;
    name: string;
    canAssignQuantity: string | number; // "Yes", "No", or number
    quantity?: number;
  }
  
  // API model for backend communication
  export interface TrainComponentApiModel {
    id: number;
    uniqueNumber: string;
    name: string;
    canAssign: boolean;
    quantity?: number;
  }
  
  // Request model for creating a component
  export interface CreateComponentRequest {
    id: number
    name: string;
    uniqueNumber: string;
    canAssign: boolean;
  }
  
  // Request model for updating quantity
  export interface UpdateQuantityRequest {
    uniqueNumber: string;
    quantity: number;
  }

  export interface PaginatedResponse<T> {
    items: T[];
    pageNumber: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  }