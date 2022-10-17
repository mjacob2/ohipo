import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { DialogKontakt } from '../app.component';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['../app.component.scss'],
})
export class NavigationBarComponent implements OnInit {

  @ViewChild('snav2') snav2: MatSidenav;

  constructor(
    public dialogKontakt: MatDialog,
  ) { }

  ngOnInit(): void {

  }


  openDialogKontakt() {
    const dialogRef = this.dialogKontakt.open(DialogKontakt, {
      disableClose: true,
      backdropClass: 'backdropBackground'
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
}
