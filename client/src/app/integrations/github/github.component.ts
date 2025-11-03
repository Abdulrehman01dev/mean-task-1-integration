import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ViewChild } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { GithubService } from '../../_services/github.service';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CommitRow } from '../../_models/commit';

@Component({
  selector: 'app-github',
  imports: [
    CommonModule,
    NgIf,
    DatePipe,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './github.component.html',
  styleUrl: './github.component.css'
})
export class GithubComponent implements OnInit {
  isConnected = false;
  connectedUser: { url: string; login: string, connectedAt: Date | undefined } = {
    url: "",
    login: "",
    connectedAt: undefined,
  }

  // Dummy grid data
  displayedColumns: string[] = [
    'select', 'id', 'hash', 'branch', 'message', 'date', 'repoName', 'repoUid', 'authorUid', 'authorName', 'pullrequest', 'url', 'checksum'
  ];

  dataSource = new MatTableDataSource<any>([]);
  isLoading: boolean = false;
  isSyncing: boolean = false;
  isRemoving: boolean = false;
  totalCount: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  searchText: string = "";
  sortField: string = "_id";
  sortDir: string = "desc";
  selectedEntity: string = "github_commits";
  selectedActiveIntegration: string = "github";
  filters: Record<string, any> = {};
  filterRows: { field: string; value: string }[] = [];
  availableFields: string[] = [];
  searchSubject = new Subject<string>();

  entries: { name: string, value: string }[] = [
    { name: "Commits", value: "github_commits" },
    { name: "Repositories", value: "github_repos" },
    { name: "Pull Requests", value: "github_pulls" },
    { name: "Issues", value: "github_issues" },
    { name: "Users", value: "github_users" },
    { name: "Organizations", value: "github_organizations" },
    { name: "Changelogs", value: "github_issues_changelog" },
  ]

  activeIntegrations: { name: string, value: string }[] = [
    { name: 'GitHub', value: 'github' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService, private githubService: GithubService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(value => {
      this.searchText = value.trim().toLowerCase();
      this.pageIndex = 0;
      this.fetchData(false);
    });


    this.authService.connected$.subscribe(isConn => {
      this.isConnected = !!isConn;
      if (isConn) {
        this.fetchData(true);
      };
    });

    this.authService.user$.subscribe(user => {
      console.log("🚀 ~ GithubComponent ~ ngOnInit ~ user:", user)
      if (user) {
        this.connectedUser = { url: user.url, login: user.login, connectedAt: user?.connectedAt };
      }
    });
  }

  onConnect(): void {
    this.authService.connectGithub();
  }

  onRemoveIntegration(): void {
    this.isRemoving = true;
    this.githubService.removeIntegration().subscribe({
      next: (res) => {
      this.isConnected = false;
      this.connectedUser = { url: "", login: "", connectedAt: undefined };
      this.dataSource.data = [];
      localStorage.removeItem('githubToken');
      },
      error: (err) => console.error(err),
      complete: () => this.isRemoving = false
      

    });
  }

  onResync(): void {
    this.isSyncing = true;
    this.githubService.resyncIntegration().subscribe(({
      next: (res) => {
        console.log("Resync response:", res);
        this.fetchData(true);
      },
      error: (err) => console.error(err),
      complete: () => this.isSyncing = false
    }));
  };

  fetchData(updateColumns: boolean = false) {
    if (!this.selectedEntity) return;
    this.isLoading = true;
    this.githubService.getGithubData(this.selectedEntity, this.pageIndex + 1, this.pageSize, this.searchText, this.sortField, this.sortDir, this.filters).pipe()
      .subscribe({
        next: (res: any) => {
          console.log("🚀 ~ GithubComponent ~ fetchData ~ res:", res)
          this.totalCount = res.total || 0;
          this.dataSource.data = res.data;
          this.isLoading = false;

          if (updateColumns && res.data && res.data.length > 0) {
            console.log('Columns are updating......');
            this.displayedColumns = Object.keys(res.data[0] || {}).slice(0, 10);
            this.availableFields = Object.keys(res.data[0] || {}).filter(col => col !== 'select' && col !== '_id');
          }
        },
        error: error => {
          console.log("🚀 ~ GithubComponent ~ fetchData ~ error:", error)
          this.isLoading = false;
        }
      });
  }


  onApplyFilter(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent) {
    console.log('Page event:', event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchData(false);
  }

  onEntityChange() {
    //reset search and sorting as well.
    this.resetpagination(true, true);
    this.resetFilters();
    this.fetchData(true);
  };

  onActiveIntegrationChange() {
    // static list for now 
  };

  onSort(sortState: Sort) {
    if (sortState.direction) {
      this.sortField = sortState.active
      this.sortDir = sortState.direction;
      this.fetchData(false)
      console.log(`Sorted ${sortState.direction}ending and applied on ${this.sortField}`);

    } else {
      console.log('Sorting cleared');
    }
  }

  resetpagination(resetQuery: boolean = false, resetSort: boolean = false) {
    this.totalCount = 0;
    this.pageIndex = 0;
    this.pageSize = 10;
    if (resetQuery) {
      this.searchText = "";
    };
    if (resetSort) {
      this.sortField = "_id";
      this.sortDir = "desc";
    }
    if (this.paginator) {
      this.paginator.pageIndex = 0;
      this.paginator.pageSize = this.pageSize;
    }
  }

  onAddFilterRow() {
    this.filterRows.push({ field: '', value: '' });
  }

  onRemoveFilterRow(index: number) {
    this.filterRows.splice(index, 1);
  }

  onApplyFilters() {
    // Converting the filter rows to filter object
    this.filters = {};
    this.filterRows.forEach(filter => {
      if (filter.field && filter.value) {
        this.filters[filter.field] = filter.value;
      }
    });
    this.pageIndex = 0;
    this.fetchData(false);
  }

  onClearFilters() {
    this.resetFilters();
    this.fetchData(false);
  }

  resetFilters() {
    this.filterRows = [];
    this.filters = {};
    this.pageIndex = 0;
  }

  getFilteredCount(): number {
    return this.filterRows.filter(f => f.field && f.value).length;
  }

}