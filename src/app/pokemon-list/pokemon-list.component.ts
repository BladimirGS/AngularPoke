import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../services/pokemon.service';
import { Pokemon } from '../models/pokemon.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
})
export class PokemonListComponent implements OnInit {
  pokemonList: Pokemon[] = [];
  localPokemonList: Pokemon[] = [];
  filteredPokemonList: Pokemon[] = [];
  tempPokemon = { id: 0, nombre: '', imagenFile: null as File | null };
  selectedPokemon: Pokemon | null = null;
  loading = true;
  currentPage = 1;
  pageSize = 5;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortBy: 'id' | 'nombre' = 'id';
  searchTerm: string = '';

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {
    this.fetchPokemon();
  }

  fetchPokemon(): void {
    this.pokemonService.getPokemonList().subscribe({
      next: (response) => {
        this.pokemonList = response;
        this.filteredPokemonList = [...this.pokemonList];
        this.updateLocalPokemonList();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching Pokémon:', error);
        this.loading = false;
      },
    });
  }

  updateLocalPokemonList() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.localPokemonList = this.filteredPokemonList.slice(start, end);
  
    this.sortList();
  }

  onPageSizeChange() {
    this.currentPage = 1; 
    this.updateLocalPokemonList();
  }  

  onSearch(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredPokemonList = this.pokemonList.filter(
      (pokemon) =>
        pokemon.nombre.toLowerCase().includes(term) ||
        pokemon.id.toString().includes(term)
    );

    this.currentPage = 1;
    this.updateLocalPokemonList();
  }

  goToFirstPage(): void {
    if (this.currentPage !== 1) {
      this.currentPage = 1;
      this.updateLocalPokemonList();
    }
  }

  goToLastPage(): void {
    const lastPage = Math.ceil(this.filteredPokemonList.length / this.pageSize);
    if (this.currentPage !== lastPage) {
      this.currentPage = lastPage;
      this.updateLocalPokemonList();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateLocalPokemonList();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateLocalPokemonList();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPokemonList.length / this.pageSize);
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get endIndex(): number {
    return Math.min(
      this.startIndex + this.pageSize,
      this.filteredPokemonList.length
    );
  }

  get showingMessage(): string {
    const start = this.startIndex + 1;
    const end = Math.min(this.endIndex, this.filteredPokemonList.length);
    const total = this.filteredPokemonList.length;

    return `Showing ${start} to ${end} of ${total} entries`;
  }

  sortList() {
    this.localPokemonList.sort((a, b) => {
      let compareA = a[this.sortBy];
      let compareB = b[this.sortBy];

      if (typeof compareA === 'string' && typeof compareB === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (this.sortDirection === 'asc') {
        return compareA > compareB ? 1 : compareA < compareB ? -1 : 0;
      } else {
        return compareA < compareB ? 1 : compareA > compareB ? -1 : 0;
      }
    });
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortList();
  }

  changeSortField(field: 'id' | 'nombre') {
    if (this.sortBy === field) {
      this.toggleSortDirection();
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.sortList();
  }

  openViewMoreModal(index: number): void {
    const pokemon = this.localPokemonList[index];
    this.selectedPokemon = pokemon; 
  }

  openCreateModal(): void {
    this.tempPokemon = { id: 0, nombre: '', imagenFile: null };
  
    const fileInput = document.getElementById('pokemonImage') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = ''; 
    }
  }  

  openEditModal(index: number): void {
    const selectedPokemon = this.localPokemonList[index];
    this.tempPokemon = {
      ...selectedPokemon,
      imagenFile: null, 
    };
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.tempPokemon.imagenFile = file;
    }
  }

  createPokemon(): void {
    if (this.tempPokemon.nombre && this.tempPokemon.imagenFile) {
      const formData = new FormData();
      formData.append('nombre', this.tempPokemon.nombre);
      formData.append(
        'imagen',
        this.tempPokemon.imagenFile,
        this.tempPokemon.imagenFile.name
      );
  
      this.pokemonService.createPokemon(formData).subscribe({
        next: (response) => {
          Swal.fire(
            '¡Éxito!',
            'El Pokémon ha sido creado correctamente.',
            'success'
          );
  
          this.fetchPokemon();
  
          this.tempPokemon = { id: 0, nombre: '', imagenFile: null };
  
          const fileInput = document.getElementById('createPokemonImage') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
  
          const boton = document.getElementById('closeCreate') as HTMLButtonElement;

          if (boton) {
            boton.click();
          }
        },
        error: (error) => {
          console.error('Error al crear el Pokémon:', error);
          Swal.fire('Error', 'Hubo un problema al crear el Pokémon.', 'error');
        },
      });
    } else {
      Swal.fire(
        'Advertencia',
        'Por favor complete todos los campos.',
        'warning'
      );
    }
  }  

  updatePokemon(): void {
    if (this.tempPokemon.nombre && this.tempPokemon.id) {
      const formData = new FormData();
      formData.append('nombre', this.tempPokemon.nombre);
      if (this.tempPokemon.imagenFile) {
        formData.append(
          'imagen',
          this.tempPokemon.imagenFile,
          this.tempPokemon.imagenFile.name
        );
      }
  
      this.pokemonService.updatePokemon(this.tempPokemon.id, formData).subscribe({
        next: (response) => {
          Swal.fire(
            '¡Éxito!',
            'El Pokémon ha sido actualizado correctamente.',
            'success'
          );
  
          this.fetchPokemon();
  
          this.tempPokemon = { id: 0, nombre: '', imagenFile: null };
  
          const fileInput = document.getElementById('editPokemonImage') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
  
          const boton = document.getElementById('closeEdit') as HTMLButtonElement;

          if (boton) {
            boton.click(); 
          }
        },
        error: (error) => {
          console.error('Error al actualizar el Pokémon:', error);
          Swal.fire(
            'Error',
            'Hubo un problema al actualizar el Pokémon.',
            'error'
          );
        },
      });
    } else {
      Swal.fire(
        'Advertencia',
        'Por favor complete todos los campos.',
        'warning'
      );
    }
  }  

  deleteImage(pokemonId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.pokemonService.deletePokemonImage(pokemonId).subscribe({
          next: (response) => {
            Swal.fire('Deleted!', 'The Pokémon has been deleted.', 'success');

            this.fetchPokemon();
          },
          error: (error) => {
            Swal.fire('Error', 'An error has occurred.', 'error');
          },
        });
      }
    });
  }
}
