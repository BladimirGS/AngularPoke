import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.model';
import axios from 'axios';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  authenticate(email: string, password: string): Observable<boolean> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email: email, password: password});
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  createUser(formData: FormData): Observable<any> {
    console.log(formData);
    
    return this.http.post<any>(`${this.apiUrl}/users/create`, formData);
  }

  updateUser(id: number, data: FormData): Observable<User> {
    const url = `${this.apiUrl}/users/update/${id}`;
  
    return new Observable((observer) => {
      axios
        .put(url, data, { headers: { 'Content-Type': 'application/json' } }
        )  // Elimina el encabezado Content-Type
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }  
  
  deleteUser(id: number): Observable<any> {
    const url = `${this.apiUrl}/users/delete/${id}`;
    return this.http.delete<any>(url);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }
}
