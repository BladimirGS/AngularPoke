import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedUsers: User[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 5;
  tempUser: { id?: number; name?: string; email?: string; password?: string } = {};
  selectedPokemon: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response;
        this.updateDisplayedUsers();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        this.loading = false;
      },
    });
  }

  updateDisplayedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedUsers = this.users.slice(startIndex, endIndex);
  }

  openCreateModal(): void {
    this.tempUser = { id: 0, name: '', email: '', password: '' };
  }

  createUser(): void {
    if (this.tempUser.name && this.tempUser.email && this.tempUser.password) {
      const formData = new FormData();
      formData.append('name', this.tempUser.name);
      formData.append('email', this.tempUser.email);
      formData.append('password', this.tempUser.password);

      this.userService.createUser(formData).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'El usuario ha sido creado correctamente.', 'success');
          this.fetchUsers();
          this.tempUser = { id: 0, name: '', email: '', password: '' };

          const boton = document.getElementById('closeCreate') as HTMLButtonElement;
          if (boton) boton.click();
        },
        error: (error) => {
          console.error('Error al crear el usuario:', error);
          Swal.fire('Error', 'Hubo un problema al crear el usuario.', 'error');
        },
      });
    } else {
      Swal.fire('Advertencia', 'Por favor complete todos los campos.', 'warning');
    }
  }

  openEditModal(index: number): void {
    if (index >= 0 && index < this.displayedUsers.length) {
      const selectedUser = this.displayedUsers[index];
      this.tempUser = { ...selectedUser }; 
    } else {
      console.error('Índice fuera de rango al intentar editar usuario.');
    }
  }
  

  editUser(): void {
    if (this.tempUser.id && this.tempUser.name && this.tempUser.email) {
      const formData = new FormData();
      formData.append('name', this.tempUser.name);
      formData.append('email', this.tempUser.email);
      if (this.tempUser.password) {
        formData.append('password', this.tempUser.password);
      }
    
      // Verificar qué datos se están enviando
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
  
      this.userService.updateUser(this.tempUser.id, formData).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'El usuario ha sido actualizado correctamente.', 'success');
          this.fetchUsers();
  
          const boton = document.getElementById('closeEdit') as HTMLButtonElement;
          if (boton) boton.click();
        },
        error: (error) => {
          console.error('Error al editar el usuario:', error);
          Swal.fire('Error', 'Hubo un problema al actualizar el usuario.', 'error');
        },
      });
    } else {
      Swal.fire('Advertencia', 'Por favor complete todos los campos.', 'warning');
    }
  }  

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedUsers();
    }
  }

  nextPage(): void {
    if (this.currentPage < Math.ceil(this.users.length / this.pageSize)) {
      this.currentPage++;
      this.updateDisplayedUsers();
    }
  }

  deleteUser(id: number): void {
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
        this.userService.deleteUser(id).subscribe({
          next: (response) => {
            Swal.fire('Deleted!', 'The Pokémon has been deleted.', 'success');

            this.fetchUsers();
          },
          error: (error) => {
            Swal.fire('Error', 'An error has occurred.', 'error');
          },
        });
      }
    });
  }

  openViewMoreModal(index: number): void {
    if (index >= 0 && index < this.displayedUsers.length) {
      const selectedUser = this.displayedUsers[index];
      this.tempUser = { ...selectedUser }; 
    } else {
      console.error('Índice fuera de rango al intentar editar usuario.');
    }
  }
}
