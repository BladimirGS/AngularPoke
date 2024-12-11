import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon } from '../models/pokemon.model';
import { HttpHeaders } from '@angular/common/http';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'http://127.0.0.1:8000/api/pokemon';

  constructor(private http: HttpClient) {}

  getPokemonList(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.apiUrl);
  }

  createPokemon(formData: FormData): Observable<any> {
    console.log(formData);
    return this.http.post<any>(`${this.apiUrl}/create`, formData);
  }

  updatePokemon(id: number, formData: FormData): Observable<any> {
    const url = `${this.apiUrl}/update/${id}`;

    // Agregar el método override
    formData.append('_method', 'PUT');

    // Usar POST en lugar de PUT
    return this.http.post<any>(url, formData);
  }

  deletePokemonImage(id: number): Observable<any> {
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.delete<any>(url);
  }
}
