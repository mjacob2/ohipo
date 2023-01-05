import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { DialogBlad, DialogKontakt } from "../app.component";
import { WiborService } from "../services/http/getWibor.service";
import { Calculate } from "../services/wzory/wzory.service";
import { UserInput } from "../user-input";
import { Wibor } from "../wibor";

@Component({
  selector: "app-sidenav-edit",
  templateUrl: "./sidenav-edit.component.html",
  styleUrls: ["./sidenav-edit.component.scss"],
})
export class SidenavEditComponent implements OnInit {
  myGroup: FormGroup;
  propertyValue = 400000;
  sliderValue = 10;
  creditLengthInYears = 25;
  selectedOptionRodzajNieruchomosci = "0";
  RodzajeNieruchomosci: any[] = [
    { value: "0", viewValue: "Mieszkanie" },
    { value: "1", viewValue: "Dom" },
    { value: "2", viewValue: "Działka" },
  ];
  selectedOptionRaty = "0";
  RodzajeRat: any[] = [
    { value: "0", viewValue: "Równe" },
    { value: "1", viewValue: "Malejące" },
  ];
  mWIBOR3M: number;
  mWIBOR6M: number;
  userInput = new UserInput();
  loanValue = 0;
  contribution: number;
  wibors: Wibor[] = [];
  wiborDataSource: Wibor[] = [];

  @Output() CalculateOffersClick = new EventEmitter<UserInput>();
  @Output() ToggleSidenavEditClick = new EventEmitter();

  constructor(
    public dialogBlad: MatDialog,
    public dialogKontakt: MatDialog,
    private wiborService: WiborService
  ) {}

  ngOnInit(): void {
    this.wiborService.getWibor().subscribe((response: Wibor[]) => {
      for (let i in response) {
        this.wibors[i] = Object.assign(new Wibor(), response[i]);
      }
      this.wiborDataSource = this.wibors;
      this.mWIBOR3M = this.wibors.find((i) => i.name === "wibor3m").getWibor();
      this.mWIBOR6M = this.wibors.find((i) => i.name === "wibor6m").getWibor();
    });

    this.zbudujFormularz();
  }

  toggleSidenavEdit() {
    this.ToggleSidenavEditClick.emit();
  }
  calculateOffers() {
    this.contribution = (this.sliderValue / 100) * this.propertyValue;
    this.loanValue = Calculate.CreditAmount(
      this.propertyValue,
      this.contribution
    );

    this.userInput.loanValue = this.loanValue;
    this.userInput.propertyValue = this.propertyValue;
    this.userInput.mWIBOR3M = this.mWIBOR3M;
    this.userInput.mWIBOR6M = this.mWIBOR6M;
    this.userInput.creditLengthInYears = this.creditLengthInYears;

    this.CalculateOffersClick.emit(this.userInput);
  }

  // konstruktor dla ERROR dla  formWartoscNieruchomosci
  get errorMessageformWartoscNieruchomosci(): string {
    const form: FormControl = this.myGroup.get(
      "formWartoscNieruchomosci"
    ) as FormControl;
    return form.hasError("required")
      ? "Pole wymagane"
      : form.hasError("min")
      ? "Minimum 100 000"
      : form.hasError("max")
      ? "Maksymalnie 2 000 000"
      : "";
  }

  // konstruktor dla ERROR dla  formLiczbaLat
  get errorMessageformLiczbaLat(): string {
    const form: FormControl = this.myGroup.get("formLiczbaLat") as FormControl;
    return form.hasError("required")
      ? "Minimum 5"
      : form.hasError("min")
      ? "Minimum 5"
      : form.hasError("max")
      ? "Maksymalnie 35"
      : "";
  }

  zbudujFormularz(): void {
    this.myGroup = new FormGroup({
      formWartoscNieruchomosci: new FormControl("", [
        Validators.max(2000000),
        Validators.min(100000),
      ]),
      //formKwotaKredytu: new FormControl("", [Validators.max(2000000), Validators.min(50000)]),
      formLiczbaLat: new FormControl("", [
        Validators.max(35),
        Validators.min(5),
      ]),
      formWIBOR3M: new FormControl("", [
        Validators.max(10),
        Validators.min(-10),
      ]),
      formWIBOR6M: new FormControl("", [
        Validators.max(10),
        Validators.min(-10),
      ]),
      // formWkladWlasny: new FormControl("", [Validators.max(2000000), Validators.min(1)]),
    });
  }

  contributionSliderLabel(value: number) {
    return value + "%";
  }

  openZohoForm() {
    window.open(
      "https://forms.zohopublic.eu/jakubickim/form/abc/formperma/4CTCfBkz-6-h29FkJPHQmyeFShrErtcsuppDiUTmZOI",
      "_blank"
    );
  }

  openDialogKontakt() {
    const dialogRef = this.dialogKontakt.open(DialogKontakt, {
      disableClose: true,
      backdropClass: "backdropBackground",
    });
  }

  openDialogBlad() {
    const dialogRef = this.dialogBlad.open(DialogBlad, {
      disableClose: true,
      backdropClass: "backdropBackground",
    });
  }
}
