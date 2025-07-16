import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule,
    MatBadgeModule
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit {
  
  isHandset$: Observable<boolean>;

  navigationItems = [
    { 
      title: 'Dashboard', 
      icon: 'dashboard', 
      route: '/dashboard',
      description: 'Overview of your expenses and income'
    },
    { 
      title: 'Expenses', 
      icon: 'receipt_long', 
      route: '/expenses',
      description: 'View and manage your expenses'
    },
    { 
      title: 'Categories', 
      icon: 'category', 
      route: '/categories',
      description: 'Organize your expenses by categories'
    },
    { 
      title: 'Budget', 
      icon: 'account_balance_wallet', 
      route: '/budget',
      description: 'Set and track your budget goals'
    },
    { 
      title: 'Reports', 
      icon: 'analytics', 
      route: '/reports',
      description: 'Detailed analysis and reports'
    },
    { 
      title: 'Settings', 
      icon: 'settings', 
      route: '/settings',
      description: 'Configure your preferences'
    }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {
    // Component initialization
  }

  onMenuItemClick(item: any): void {
    console.log('Navigation item clicked:', item.title);
    // Add any additional logic for menu item clicks
  }

  onExportData(): void {
    console.log('Export data clicked');
    // This will be implemented later
  }

  onImportData(): void {
    console.log('Import data clicked');
    // This will be implemented later
  }

  onClearData(): void {
    console.log('Clear data clicked');
    // This will be implemented later
  }
}