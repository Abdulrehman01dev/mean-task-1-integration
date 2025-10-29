import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    MatCheckboxModule
  ],
  templateUrl: './github.component.html',
  styleUrl: './github.component.css'
})
export class GithubComponent implements OnInit {
  isConnected = false;
  connectedUser?: { url: string; login: string, connectedAt: Date};

  // Dummy grid data
  displayedColumns: string[] = [
    'select', 'id', 'hash', 'branch', 'message', 'date', 'repoName', 'repoUid', 'authorUid', 'authorName', 'pullrequest', 'url', 'checksum'
  ];
  dataSource = new MatTableDataSource<CommitRow>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private githubService: AuthService, private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {

    this.githubService.connected$.subscribe(isConn => {
      this.isConnected = !!isConn;
    });

    this.githubService.user$.subscribe(user => {
      console.log("🚀 ~ GithubComponent ~ ngOnInit ~ user:", user)
      if (user) {
        this.connectedUser = { url: user.url, login: user.login, connectedAt: user?.connectedAt };
      }
    });

    // seed dummy rows
    this.dataSource.data = this.generateDummyRows(100);
  }

  connect(): void {
    this.githubService.connectGithub();
  }

  removeIntegration(): void {
    this.isConnected = false;
    this.connectedUser = undefined;
    localStorage.removeItem('githubIntegration');
    localStorage.removeItem('githubToken');
  }

  resync(): void {
    // UI-only, no-op placeholder
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private generateDummyRows(count: number): CommitRow[] {
    const rows: CommitRow[] = [];
    for (let i = 1; i <= count; i++) {
      rows.push({
        id: `c-${1000 + i}`,
        hash: Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
        branch: i % 3 === 0 ? 'main' : i % 3 === 1 ? 'develop' : 'feature/ui-grid',
        message: `Refactor module ${i} and update docs`,
        date: new Date(Date.now() - i * 86400000).toISOString(),
        repoName: 'angular',
        repoUid: `${900000 + i}`,
        authorUid: `${170000 + i}`,
        authorName: i % 2 ? 'alex.g' : 'sara.k',
        pullrequest: i % 4 === 0 ? `#${200 + i}` : '',
        url: `https://github.com/example/repo/commit/${i}`,
        checksum: Math.random().toString(36).slice(2, 10)
      });
    }
    return rows;
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
