import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.css'
})
export class EditModalComponent implements OnInit {
  errorMessage: string | null = null;
  @Input() train: any;
  @Input() quantity: number | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<number>();
  
  ngOnInit() {
    console.log('EditModal initialized with train:', this.train);
    console.log('Current quantity:', this.quantity);
  }
  
  onClose(): void {
    console.log('Close button clicked');
    this.close.emit();
  }
  
  onSave(): void {
    console.log('Save button clicked with quantity:', this.quantity);
    if (this.quantity === null || isNaN(this.quantity) || 
      this.quantity < 0 || !Number.isInteger(this.quantity)) {
    // Set an error message
    this.errorMessage = 'Quantity must be a positive integer';
    return;
  }
  
  // Clear any previous error
  this.errorMessage = null;
  this.save.emit(this.quantity);
  }
}
