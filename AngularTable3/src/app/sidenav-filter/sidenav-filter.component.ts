import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";

@Component({
  selector: "app-sidenav-filter",
  templateUrl: "./sidenav-filter.component.html",
  styleUrls: ["./sidenav-filter.component.scss"],
})
export class SidenavFilterComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  /** ZADEKLAROWANE ZMIENNE DO FILTRÓW */
  wTrakcieBudowyFilter = new FormControl();
  wDeklarowaneWplywy = new FormControl();
  wWiekNajstarszego = new FormControl();
  nameFilter = new FormControl();

  //Filtry dochodów
  wUmowaOPraceCzasNieokreslony = new FormControl();
  wUmowaOPraceCzasOkreslony = new FormControl({ value: "", disabled: true });
  wUmowaZlecenieDzielo = new FormControl({ value: "", disabled: true });
  uUmowaNaZastepstwo = new FormControl({ value: "", disabled: true });
  wDzialanoscGospodarcza = new FormControl({ value: "", disabled: true });
  wDochodyZnajmu = new FormControl({ value: "", disabled: true });
  wEmerytura = new FormControl({ value: "", disabled: true });
  wRenta = new FormControl({ value: "", disabled: true });
  wDywidendy = new FormControl({ value: "", disabled: true });
  wDietyDelegacje = new FormControl({ value: "", disabled: true });
  wDochodyMarynarzy = new FormControl({ value: "", disabled: true });
  wPowolanie = new FormControl({ value: "", disabled: true });
}
