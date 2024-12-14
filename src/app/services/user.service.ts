import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://127.0.0.1:8000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createUser(user: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: number, user: { name: string; email: string; password?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  authenticate(email: string, password: string): Observable<boolean> {
    const loginUrl = 'http://127.0.0.1:8000/api/login';
    return this.http.post<any>(loginUrl, { email, password }).pipe(
      map((response) => {
        if (response && response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          return true;
        }
        return false;
      }),
      catchError((error) => {
        const errorMessage = error.error?.message || 'Error al autenticar';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  logout(): void {
    const logoutUrl = 'http://127.0.0.1:8000/api/logout';
    this.http.post(logoutUrl, {}).subscribe(() => {
      localStorage.removeItem('currentUser');
    });
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
}