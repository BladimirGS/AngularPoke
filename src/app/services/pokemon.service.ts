import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pokemon  } from '../models/pokemon.model';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  private apiUrl = 'http://127.0.0.1:8000/api/pokemon'; 

  constructor(private http: HttpClient) {}

  getPokemonList(): Observable<Pokemon []> {
    return this.http.get<Pokemon []>(this.apiUrl);
  }

  updatePokemon(id: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    console.log(data)
    return this.http.put<any>(url, data, { headers: { 'Content-Type': 'application/json' } });
  }  

  deletePokemonImage(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}/delete`; // Ruta de eliminación de la imagen
    return this.http.delete<any>(url); // Usamos DELETE para eliminar la imagen
  }

    // Método para crear un nuevo Pokémon
    createPokemon(formData: FormData): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/create`, formData);
    }
}
