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
  tempPokemon: Pokemon = { id: 0, nombre: '', imagen: '' };
  selectedPokemon: Pokemon | null = null;
  loading = true;
  currentPage = 1;
  pageSize = 5;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortBy: 'id' | 'nombre' = 'id';
  searchTerm: string = '';

  newPokemon = { nombre: '', imagenFile: null as File | null }; // Define el Pokémon a crear

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

  openEditModal(index: number): void {
    this.tempPokemon = { ...this.localPokemonList[index] };
  }

  onFileSelected(event: any): void {
    const file = <File>event.target.files[0];
    if (file) {
      this.tempPokemon.imagenFile = file; // Asigna el archivo seleccionado
    }
  }

  savePokemonChanges(): void {
    const filteredIndex = this.filteredPokemonList.findIndex(
      (pokemon) => pokemon.id === this.tempPokemon.id
    );

    if (filteredIndex !== -1) {
      // Llamada a la API para actualizar el Pokémon
      const pokemonData = {
        id: this.tempPokemon.id,
        nombre: this.tempPokemon.nombre, // Usamos el nombre que se haya actualizado
        imagen: this.tempPokemon.imagenFile?.name,
      };

      // Actualizamos en la API
      this.pokemonService
        .updatePokemon(this.tempPokemon.id, pokemonData)
        .subscribe({
          next: (response) => {
            console.log('Pokémon actualizado en la API:', response);

            // Muestra alerta de éxito
            Swal.fire(
              '¡Actualización exitosa!',
              'El Pokémon se actualizó correctamente.',
              'success'
            );

            // Actualiza la lista local después de que la API haya respondido correctamente
            this.fetchPokemon();
          },
          error: (error) => {
            console.error('Error al actualizar el Pokémon en la API:', error);

            // Muestra alerta de error
            Swal.fire(
              'Error',
              'Hubo un problema al actualizar el Pokémon.',
              'error'
            );
          },
          complete: () => {
            console.log('Operación completada');
          },
        });
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

            // Después de eliminar la imagen, actualizamos la lista local
            this.fetchPokemon();
          },
          error: (error) => {
            Swal.fire('Error', 'An error has occurred.', 'error');
          },
        });
      }
    });
  }

  openViewMoreModal(index: number): void {
    const pokemon = this.localPokemonList[index];
    this.selectedPokemon = pokemon; // Asigna el Pokémon seleccionado a la variable selectedPokemon
  }

  // Maneja la selección del archivo de imagen
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.newPokemon.imagenFile = file;
      console.log('Imagen seleccionada:', this.newPokemon.imagenFile);
    }
  }

  // Función para crear el Pokémon
  createPokemon(): void {
    if (this.newPokemon.nombre && this.newPokemon.imagenFile) {
      const formData = new FormData();
      formData.append('nombre', this.newPokemon.nombre);
      formData.append(
        'imagen',
        this.newPokemon.imagenFile,
        this.newPokemon.imagenFile.name
      );
  
      this.pokemonService.createPokemon(formData).subscribe({
        next: (response) => {
          console.log('Nuevo Pokémon creado:', response);
          Swal.fire(
            '¡Éxito!',
            'El Pokémon ha sido creado correctamente.',
            'success'
          );

          this.fetchPokemon();
  
          // Cierra el modal
          const modal = document.getElementById('createPokemonModal');
          if (modal) {
            (modal as any).classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('style', 'display: none;');
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
          }
  
          // Limpia los campos del formulario
          this.newPokemon = { nombre: '', imagenFile: null };
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
  
}
