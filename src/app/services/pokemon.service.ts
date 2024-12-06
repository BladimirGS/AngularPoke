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

  getPokemonList(): Observable<Pokemon[]> {
    return this.http.get<Pokemon[]>(this.apiUrl);
  }

  updatePokemon(id: number, data: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;

    console.log(data)
    
    const formData = new FormData();
    formData.append('id', data.id.toString());
    formData.append('nombre', data.nombre);
    if (data.imagenFile) {
      formData.append('imagen', data.imagenFile, data.imagenFile.name);
    }

    // No necesitas poner 'Content-Type': 'application/json' aquí, porque FormData lo maneja automáticamente
    return this.http.put<any>(url, formData);
  }
}
