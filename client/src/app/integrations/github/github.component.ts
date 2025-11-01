import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
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
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-github',
  imports: [
    CommonModule,
    NgIf,
    DatePipe,
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

  dataSource = new MatTableDataSource<CommitRow>([]);
  isLoading: boolean = true;
  totalCount: number = 0;
  pageIndex: number = 0;
  pageSize: number = 10;
  searchText: string = "";
  sortField: string = "_id";
  sortDir: string = "desc";
  selectedEntity: string = "github_commits";
  selectedActiveIntegration: string = "github";

  entries: { name: string, value: string }[] = [
    { name: "Commits", value: "github_commits" },
    { name: "Repositories", value: "github_repos" },
    { name: "Pull Requests", value: "github_pulls" },
    { name: "Issues", value: "github_issues" },
    { name: "Users", value: "github_users" },
    { name: "Organizations", value: "github_organizations" },
  ]

  activeIntegrations: { name: string, value: string }[] = [
    { name: 'GitHub', value: 'github' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private githubService: AuthService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {

    this.githubService.connected$.subscribe(isConn => {
      this.isConnected = !!isConn;
      if (isConn) {
        this.fetchData(true);
      };
    });

    this.githubService.user$.subscribe(user => {
      console.log("🚀 ~ GithubComponent ~ ngOnInit ~ user:", user)
      if (user) {
        this.connectedUser = { url: user.url, login: user.login, connectedAt: user?.connectedAt };
      }
    });

    // seed dummy rows
    // this.dataSource.data = this.generateDummyRows(100);
  }

  connect(): void {
    this.githubService.connectGithub();
  }

  removeIntegration(): void {
    this.githubService.removeIntegration().subscribe(() => {
      this.isConnected = false;
      this.connectedUser = { url: "", login: "", connectedAt: undefined };
      this.dataSource.data = [];
      localStorage.removeItem('githubToken');
    });
  }

  resync(): void {
    this.githubService.resyncIntegration().subscribe((res) => {
      console.log("🚀 ~ GithubComponent ~ resync ~ res:", res)
      this.fetchData(true);
    });
  };

  fetchData(updateColumns: boolean = false) {
    // if (!this.selectedEntity) return;
    this.isLoading = true;
    this.githubService.getGithubData(this.selectedEntity, this.pageIndex + 1, this.pageSize, this.searchText, this.sortField, this.sortDir).pipe()
      .subscribe({
        next: (res: any) => {
          console.log("🚀 ~ GithubComponent ~ fetchData ~ res:", res)
          this.totalCount = res.total || 0;
          this.dataSource.data = res.data;
          this.isLoading = false;

          if (updateColumns) {
            console.log('Columns are updating......');
            this.displayedColumns = Object.keys(res.data[0] || {}).slice(0, 10);
          };
        },
        error: error => {
          console.log("🚀 ~ GithubComponent ~ fetchData ~ error:", error)
          this.isLoading = false;
        }
      });
  }


  applyFilter(value: string): void {
    this.searchText = value.trim().toLowerCase();
    this.pageIndex = 0;
    this.fetchData(false);
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


}

interface CommitRow {
  id: string;
  hash: string;
  branch: string;
  message: string;
  date: string; // ISO
  repoName: string;
  repoUid: string;
  authorUid: string;
  authorName: string;
  pullrequest: string;
  url: string;
  checksum: string;
}
