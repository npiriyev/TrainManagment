import { Injectable } from '@angular/core';
import { HttpClient , HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments';
import { TrainComponent, 
  TrainComponentApiModel, 
  CreateComponentRequest, 
  UpdateQuantityRequest,
  PaginatedResponse  } from '../models/train-component.model';

  @Injectable({
    providedIn: 'root'
  })
  export class TrainComponentService {
    private apiUrl = environment.apiUrl;
  
    constructor(private http: HttpClient, private authService: AuthService) { }


  getPagedComponents(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<TrainComponentApiModel>> {
    // Build query parameters
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    // Make the API request with parameters
    return this.http.get<PaginatedResponse<TrainComponentApiModel>>(
      `${this.apiUrl}/ComponentManagment/GetPaged`, 
      { params }
    ).pipe(
      tap(response => console.log('Paged components received:', response)),
      catchError(error => {
        console.error('Error fetching paged components:', error);
        return throwError(() => error);
      })
    );
  }
    
    getAllComponents(): Observable<TrainComponentApiModel[]> {
      return this.http.get<TrainComponentApiModel[]>(`${this.apiUrl}/ComponentManagment/GetAll`)
        .pipe(
          tap(data => console.log('Components received:', data)),
          catchError(error => {
            console.error('Error fetching components:', error);
            return throwError(() => error);
          })
        );
    }
  
    updateComponent(request: UpdateQuantityRequest): Observable<TrainComponentApiModel> {
      return this.http.post<TrainComponentApiModel>(
        `${this.apiUrl}/ComponentManagment/UpdateComponent`, 
        request
      ).pipe(
        tap(data => console.log('Component updated:', data)),
        catchError(error => {
          console.error('Error updating component:', error);
          return throwError(() => error);
        })
      );
    }
  
    createComponent(component: CreateComponentRequest): Observable<TrainComponentApiModel> {
      return this.http.post<TrainComponentApiModel>(
        `${this.apiUrl}/ComponentManagment/CreateComponent`, 
        component
      ).pipe(
        tap(data => console.log('Component created:', data)),
        catchError(error => {
          console.error('Error creating component:', error);
          return throwError(() => error);
        })
      );
    }
  
    searchByUniqueNumber(uniqueNumber: string): Observable<TrainComponentApiModel> {
      return this.http.post<TrainComponentApiModel>(
        `${this.apiUrl}/ComponentManagment/SearchByUniqueNumber`, 
        JSON.stringify(uniqueNumber), 
        { headers: { 'Content-Type': 'application/json' } }
      ).pipe(
        tap(data => console.log('Component found by unique number:', data)),
        catchError(error => {
          console.error('Error searching by unique number:', error);
          return throwError(() => error);
        })
      );
    }
    
    searchByName(name: string): Observable<TrainComponentApiModel[]> {
      return this.http.post<TrainComponentApiModel[]>(
        `${this.apiUrl}/ComponentManagment/SearchByName`, 
        JSON.stringify(name), 
        { headers: { 'Content-Type': 'application/json' } }
      ).pipe(
        tap(data => console.log('Components found by name:', data)),
        catchError(error => {
          console.error('Error searching by name:', error);
          return throwError(() => error);
        })
      );
    }
  }