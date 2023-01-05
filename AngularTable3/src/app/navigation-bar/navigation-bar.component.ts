import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { DialogKontakt } from "../app.component";

@Component({
  selector: "app-navigation-bar",
  templateUrl: "./navigation-bar.component.html",
  styleUrls: ["../app.component.scss"],
})
export class NavigationBarComponent implements OnInit {
  @Output() ClickEditButton = new EventEmitter();
  @Output() ClickFilterButton = new EventEmitter();

  clickEditButton() {
    this.ClickEditButton.emit();
  }

  clickFilterButton() {
    this.ClickFilterButton.emit();
  }

  constructor(public dialogKontakt: MatDialog) {}

  ngOnInit(): void {}

  openDialogKontakt() {
    const dialogRef = this.dialogKontakt.open(DialogKontakt, {
      disableClose: true,
      backdropClass: "backdropBackground",
    });

    dialogRef.afterClosed().subscribe();
  }
}
