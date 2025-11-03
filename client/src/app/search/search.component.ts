import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { GithubService } from '../_services/github.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule, FormsModule, SlicePipe,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatListModule, MatDividerModule, MatProgressBarModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})


export class SearchComponent {
  searchText = '';
  results: any = null;
  loading = false;
  error = '';

  constructor(private githubService: GithubService) {}

  onSearch() {
    this.loading = true;
    this.error = '';
    this.githubService.searchGlobalData(this.searchText).subscribe({
      next: (data) => { this.results = data; this.loading = false; },
      error: (err) => {
        this.error = 'Search failed';
        this.loading = false;
      }
    });
  }
}
