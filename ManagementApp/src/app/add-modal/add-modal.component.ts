import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-modal.component.html',
  styleUrl: './add-modal.component.css'
})

export class AddModalComponent {
  id: number = 0;
  name: string = '';
  uniqueNumber: string = '';
  canAssign: boolean = true;
  validationErrors: boolean=false;
  
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<any>();
  
  onClose(): void {
    this.close.emit();
  }

  validateId(): boolean {
    // Check if ID is a valid integer
    const isValid = Number.isInteger(this.id) && this.id >= 0;
    
    if (!isValid) {
      this.validationErrors = true;
    } else {
      this.validationErrors = false;
    }
    
    return isValid;
  }
  
  isValid(): boolean {
    return !!this.name && !!this.uniqueNumber;
  }
  
  onAdd(): void {
    this.validateId();
    if(!this.validationErrors){
      return;
    }
   
    if (this.isValid()) {
      this.add.emit({
        id: this.id,
        name: this.name,
        uniqueNumber: this.uniqueNumber,
        canAssign: this.canAssign
      });
    }
  }
}
