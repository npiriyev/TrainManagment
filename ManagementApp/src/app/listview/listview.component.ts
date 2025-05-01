import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { EditModalComponent } from '../edit-modal/edit-modal.component';
import { AuthService } from '../services/auth.service';
import { TrainComponentService } from '../services/train-component.service';
import { AddModalComponent } from '../add-modal/add-modal.component';
import { FormsModule } from '@angular/forms';
import { 
  TrainComponentApiModel, 
  TrainComponentViewModel,
  CreateComponentRequest,
  PaginatedResponse
} from '../models/train-component.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-listview',
  imports: [NgFor, NgIf, FormsModule, EditModalComponent, AddModalComponent],
  templateUrl: './listview.component.html',
  styleUrl: './listview.component.css'
})
export class ListviewComponent implements OnInit, OnDestroy {
  trainComponents: TrainComponentViewModel[] = [];
  pagedTrains: TrainComponentViewModel[] = [];
  loading = false;
  error: string | null = null;
  private authSubscription: Subscription | null = null;

  pageSize = 10;
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  hasNextPage = false;
  hasPreviousPage = false;

  // Modal properties
  showModal = false;
  selectedTrain: TrainComponentViewModel | null = null;
  tempQuantity: number | null = null;

  // Search properties
  nameSearchTerm: string = '';
  numberSearchTerm: string = '';
  showAddModal: boolean = false;
  searchTimeout: any = null;
  searchError: string | null = null;
  isSearchMode = false;

  constructor(
    public authService: AuthService, 
    public trainComponentService: TrainComponentService
  ) { }

  ngOnInit(): void {
    
    this.authSubscription = this.authService.authSuccess.subscribe(() => {
      console.log('Auth success event received, loading first page...');
      this.loadPage(1);
    });
    
    if (this.authService.isAuthenticated()) {
      this.loadPage(1);
    }
  }
  
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }


  loadPage(pageNumber: number): void {

    if (!this.authService.isAuthenticated()) {
      this.error = 'Please log in to view data';
      return;
    }
    
 
    this.loading = true;
    this.error = null;
    
    if (this.isSearchMode) {
      this.applyFilter();
      return;
    }
    
  
    this.trainComponentService.getPagedComponents(pageNumber, this.pageSize)
      .subscribe({
        next: (response: PaginatedResponse<TrainComponentApiModel>) => {
          console.log('Page data received:', response);
          
          // Update pagination info
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;
          this.totalItems = response.totalCount;
          this.totalPages = response.totalPages;
          this.hasNextPage = response.hasNext;
          this.hasPreviousPage = response.hasPrevious;
          
          // Map API models to view models
          this.pagedTrains = this.mapToViewModels(response.items);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading page:', error);
          this.loading = false;
          this.error = 'Failed to load components. Please try again.';
        }
      });
  }

  // Map API models to view models
  private mapToViewModels(apiModels: TrainComponentApiModel[]): TrainComponentViewModel[] {
    return apiModels.map(component => ({
      id: component.id,
      name: component.name,
      uniqueNumber: component.uniqueNumber,
      quantity: component.quantity,
      // Convert canAssign boolean to "Yes"/"No" or use the quantity
      canAssignQuantity: component.quantity !== undefined && component.quantity !== null ? 
                        component.quantity : 
                        (component.canAssign ? "Yes" : "No")
    }));
  }

  // Apply filters using backend search
  applyFilter(): void {
    // Clear any existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    // Set a debounce timeout to prevent too many API calls
    this.searchTimeout = setTimeout(() => {
      this.loading = true;
      this.searchError = null;
      
 
      if (!this.nameSearchTerm && !this.numberSearchTerm) {
        this.isSearchMode = false;
        this.loadPage(1);
        return;
      }
      

      this.isSearchMode = true;
      
      
      if (this.nameSearchTerm && !this.numberSearchTerm) {
        this.trainComponentService.searchByName(this.nameSearchTerm).subscribe({
          next: (results) => {
            this.processSearchResults(results);
          },
          error: (error) => {
            console.error('Error searching by name:', error);
            this.searchError = 'Failed to search by name';
            this.loading = false;
            this.pagedTrains = [];
            this.updatePaginationForSearchResults(0);
          }
        });
        return;
      }
      
    
      if (this.numberSearchTerm && !this.nameSearchTerm) {
        this.trainComponentService.searchByUniqueNumber(this.numberSearchTerm).subscribe({
          next: (result) => {
     
            this.processSearchResults([result]);
          },
          error: (error) => {
            console.error('Error searching by unique number:', error);
            if (error.status === 404) {
              this.pagedTrains = [];
              this.updatePaginationForSearchResults(0);
            } else {
              this.searchError = 'Failed to search by unique number';
            }
            this.loading = false;
          }
        });
        return;
      }
      

      if (this.nameSearchTerm && this.numberSearchTerm) {
        this.trainComponentService.searchByName(this.nameSearchTerm).subscribe({
          next: (results) => {
           
            const filteredByNumber = results.filter(
              component => component.uniqueNumber.toLowerCase().includes(this.numberSearchTerm.toLowerCase())
            );
            this.processSearchResults(filteredByNumber);
          },
          error: (error) => {
            console.error('Error with combined search:', error);
            this.searchError = 'Failed to perform search';
            this.loading = false;
            this.pagedTrains = [];
            this.updatePaginationForSearchResults(0);
          }
        });
      }
    }, 300); // 300ms debounce
  }


  private processSearchResults(apiResults: TrainComponentApiModel[]): void {
    
    this.pagedTrains = this.mapToViewModels(apiResults || []);
    
  
    this.updatePaginationForSearchResults(apiResults?.length || 0);
    
    this.loading = false;
  }
  
  private updatePaginationForSearchResults(totalCount: number): void {
    this.totalItems = totalCount;
    this.totalPages = Math.ceil(totalCount / this.pageSize);
    this.currentPage = 1;
    this.hasNextPage = false;
    this.hasPreviousPage = false;
  }

  clearNameSearch(): void {
    this.nameSearchTerm = '';
    this.applyFilter();
  }

  clearNumberSearch(): void {
    this.numberSearchTerm = '';
    this.applyFilter();
  }


  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      if (this.isSearchMode) {
    
        this.currentPage = page;
      } else {
  
        this.loadPage(page);
      }
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = 5; // Show max 5 page numbers at once
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }


  addComponent(newComp: CreateComponentRequest): void {
    this.trainComponentService.createComponent({
      id: newComp.id,
      name: newComp.name,
      uniqueNumber: newComp.uniqueNumber,
      canAssign: newComp.canAssign
    }).subscribe({
      next: (createdTrain) => {
        console.log('Train component created successfully:', createdTrain);
        

        this.loadPage(this.currentPage);
        
        // Close the modal
        this.closeAddModal();
      },
      error: (error) => {
        console.error('Error creating train:', error);
      }
    });
  }
  
  isEditable(train: TrainComponentViewModel): boolean {
    return train.canAssignQuantity === 'Yes' || typeof train.canAssignQuantity === 'number';
  }

  getQuantityDisplay(train: TrainComponentViewModel): string {
    if (train.canAssignQuantity === 'No') {
      return 'No';
    } else if (train.canAssignQuantity === 'Yes') {
      return 'Yes';
    } else if (typeof train.canAssignQuantity === 'number') {
      return train.canAssignQuantity.toString();
    }
    return 'No';
  }

  openEditModal(train: TrainComponentViewModel): void {
    if (!this.isEditable(train)) return;
    
    this.selectedTrain = train;
    this.tempQuantity = typeof train.canAssignQuantity === 'number' 
      ? train.canAssignQuantity 
      : null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedTrain = null;
    this.tempQuantity = null;
  }

  saveQuantity(newQuantity: number): void {
    if (this.selectedTrain && newQuantity !== null) {
      if (isNaN(newQuantity) || newQuantity < 0 || !Number.isInteger(newQuantity)) {
        console.error('Invalid quantity: Must be a positive integer');
        return;
      }

    
      this.selectedTrain.canAssignQuantity = newQuantity;
      

      this.trainComponentService.updateComponent({
        uniqueNumber: this.selectedTrain.uniqueNumber,
        quantity: newQuantity
      }).subscribe({
        next: (updatedComponent) => {
          console.log('Component updated successfully:', updatedComponent);
          
      
          this.loadPage(this.currentPage);
          
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating component:', error);
        }
      });
    }
  }
  
  openAddModal(): void {
    this.showAddModal = true;
  }
  
  closeAddModal(): void {
    this.showAddModal = false;
  }
}