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
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedUsers: User[] = [];
  loading = true;
  currentPage = 1;
  pageSize = 5;
  tempUser: { id?: number; name?: string; email?: string; password?: string } =
    {};
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

  openCreateModal(): void {
    this.tempUser = { id: 0, name: '', email: '', password: '' };
  }

  createUser(): void {
    if (this.tempUser.name && this.tempUser.email && this.tempUser.password) {
      const user = {
        name: this.tempUser.name,
        email: this.tempUser.email,
        password: this.tempUser.password,
      };

      this.userService.createUser(user).subscribe({
        next: () => {
          Swal.fire(
            'Success!',
            'The user has been created successfully.',
            'success'
          );
          this.fetchUsers();
          this.tempUser = { id: 0, name: '', email: '', password: '' };

          const closeButton = document.getElementById(
            'closeCreate'
          ) as HTMLButtonElement;
          if (closeButton) closeButton.click();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          Swal.fire('Error', 'There was a problem creating the user.', 'error');
        },
      });
    } else {
      Swal.fire('Warning', 'Please fill in all fields.', 'warning');
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
      const user: any = {
        name: this.tempUser.name,
        email: this.tempUser.email,
      };

      if (this.tempUser.password) {
        user.password = this.tempUser.password;
      }

      this.userService.updateUser(this.tempUser.id, user).subscribe({
        next: () => {
          Swal.fire(
            'Success!',
            'The user has been updated successfully.',
            'success'
          );
          this.fetchUsers();

          const closeButton = document.getElementById(
            'closeEdit'
          ) as HTMLButtonElement;
          if (closeButton) closeButton.click();
        },
        error: (error) => {
          console.error('Error updating the user:', error);
          Swal.fire('Error', 'There was a problem updating the user.', 'error');
        },
      });
    } else {
      Swal.fire('Warning', 'Please fill in all required fields.', 'warning');
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
          next: () => {
            Swal.fire(
              'Deleted!',
              'The user has been deleted successfully.',
              'success'
            );
            this.fetchUsers();
          },
          error: (error) => {
            console.error('Error deleting the user:', error);
            Swal.fire(
              'Error',
              'An error occurred while deleting the user.',
              'error'
            );
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
