import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  ElementRef,
} from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort, MatSortable } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { MatPaginator } from "@angular/material/paginator";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MediaMatcher } from "@angular/cdk/layout";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatDialog } from "@angular/material/dialog";
import { MatSidenav } from "@angular/material/sidenav";
import { OffersService } from "./services/http/getOffers.service";
import { Offer } from "./offer";
import { UserInput } from "./user-input";

@Component({
  selector: "app-root",
  styleUrls: ["./app.component.scss"],
  templateUrl: "./app.component.html",
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("500ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = [
    "szczegoly",
    "bank",
    "ofertaNazwa",
    "kosztyCalkowite",
    "kosztyPoczatkowe",
    "rata",
    "oplatyMiesieczne",
    "marza",
    "LTVobliczone",
    "doKiedyObowiazuje",
  ];
  wiborDisplayedColumns: string[] = ["name", "value"];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild("wiekNajstarszegoInput") wiekNajstarszegoInput: ElementRef;
  @ViewChild("cover") private cover: ElementRef;
  @ViewChild("snav2") snav2: MatSidenav;

  offersDataSource: MatTableDataSource<Offer>;
  offers: Offer[] = [];
  globalFilter = "";
  creditLengthInYears: number;
  filteredValues = {
    minimalneWplywyStatus: "",
    bank: "",
    maxLiczbaLat: "",
    maxWiekStatus: "",
    ofertaNazwa: "",
    minKwotaKredytuFILTR: "",
    maxKwotaKredytuFILTR: "",
    wTrakcieBudowy: "",
    maxLTVsave: "",
    minLTVsave: "",
    doKiedyObowiazujeStatus: "",
    odKiedyObowiazuje: "",
    wWielkimMiescieFilterKolumna: "",
  };
  //dla responsywnego sideNMavigacji
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  selection = new SelectionModel<Offer>(true, []);
  expandedElement: Offer | null;

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

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _snackBar: MatSnackBar,
    public dialogBlad: MatDialog,
    public dialogKontakt: MatDialog,
    private offersService: OffersService
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 1800px)");
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit() {
    this.offersService.getOffers().subscribe((response: Offer[]) => {
      for (let i in response) {
        this.offers[i] = Object.assign(new Offer(), response[i]);
      }
      this.offersDataSource = new MatTableDataSource(this.offers);
      this.offersDataSource.sort = this.sort;
      this.offersDataSource.filterPredicate = this.customFilterPredicate();

      //FILTR: W trakcie Budowy checkbox
      this.wTrakcieBudowyFilter.valueChanges.subscribe(
        (wTrakcieBudowyFilterValue) => {
          if (wTrakcieBudowyFilterValue == true) {
            this.filteredValues["wTrakcieBudowy"] = "tak";
            this.offersDataSource.filter = JSON.stringify(this.filteredValues);
          } else {
            this.filteredValues["wTrakcieBudowy"] = "";
            this.offersDataSource.filter = JSON.stringify(this.filteredValues);
          }
        }
      );

      //FILTR: Deklarowane wpływy
      this.wDeklarowaneWplywy.valueChanges.subscribe(
        (wDeklarowaneWplywyFilterValue) => {
          this.offers.forEach((element) => {
            if (
              wDeklarowaneWplywyFilterValue >= element.minimalneWpływy ||
              wDeklarowaneWplywyFilterValue === null
            ) {
              element.minimalneWplywyStatus = "wplywyOK";
              this.filteredValues["minimalneWplywyStatus"] = "wplywyOK";
              this.offersDataSource.filter = JSON.stringify(
                this.filteredValues
              );
            } else {
              element.minimalneWplywyStatus = "wplywyMalo";
            }
          });
        }
      );

      //FILTR: Wiek najstarszego kredytobiorcy
      this.wWiekNajstarszego.valueChanges.subscribe(
        (wWiekNajstarszegoFilterValue) => {
          this.offers.forEach((element) => {
            if (
              +this.creditLengthInYears + +wWiekNajstarszegoFilterValue <
              element.maxWiek
            ) {
              element.maxWiekStatus = "wiekOK";
              this.filteredValues["maxWiekStatus"] = "wiekOK";
            } else {
              element.maxWiekStatus = "wiekMalo";
            }
          });
          this.offersDataSource.filter = JSON.stringify(this.filteredValues);
        }
      );

      //Dzisiajsza data dla OD-kiedyobowiazuje
      var todayDate = new Date();
      this.offers.forEach((element) => {
        var mElementOdKiedyObowiazuje = new Date(element.odKiedyObowiazuje);
        if (mElementOdKiedyObowiazuje < todayDate) {
          //Data jest z minutami i sekundami, więc nie musi być <= bo już sekundę po północy mElementOdKiedyObowiazuje jest mniejszy od todayDate
          element.odKiedyObowiazuje = "już";
        }

        //Dzisiajsza data dla DO-kiedyobowiazuje
        var mElementDoKiedyObowiazuje = new Date(element.doKiedyObowiazuje);
        mElementDoKiedyObowiazuje.setDate(
          mElementDoKiedyObowiazuje.getDate() + 1
        ); // dodaj 1 dzień do daty, do kiedy obowiązuje, bo data obowiązuje do godziny 0:00:00 danego dnia, więc jest już nieaktualna jak tylko ten dzień siezacznie, a chcemy, aby była aktualna jeszcze tego jednego ostatniego dnia. Zatem.
        if (element.doKiedyObowiazuje === "do odwołania")
          element.doKiedyObowiazujeStatus = "aktualne";
        if (mElementDoKiedyObowiazuje > todayDate) {
          element.doKiedyObowiazujeStatus = "aktualne";
          element.doKiedyObowiazuje = mElementDoKiedyObowiazuje;
        }
      });
      this.filteredValues["odKiedyObowiazuje"] = "już";
      this.filteredValues["doKiedyObowiazujeStatus"] = "aktualne";
      this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      this.offersDataSource.sort = this.sort;
      this.offersDataSource.paginator = this.paginator;
      this.offersDataSource.paginator._intl.itemsPerPageLabel =
        "Pozycji na stronę:";
      this.offersDataSource.paginator._intl.nextPageLabel = "Następna strona";
      this.offersDataSource.paginator._intl.previousPageLabel =
        "Poprzednia strona";
      this.offersDataSource.paginator._intl.getRangeLabel = (
        page: number,
        pageSize: number,
        length: number
      ) => {
        if (length == 0 || pageSize == 0) {
          return `0 z ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex =
          startIndex < length
            ? Math.min(startIndex + pageSize, length)
            : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} z ${length}`;
      };
    });

    // Domyslnie sortuj po kosztach całkowitych podczas uruchomienia
    this.sort.sort({ id: "kosztyCalkowite", start: "asc" } as MatSortable);
    // this.dataSource.sort = this.sort;
  } // NgOnInit end

  calculateOffers(userInput: UserInput): void {
    this.offers.forEach((offer) => {
      offer.calculateOffer(userInput);

      //FILTR: maxLiczbaLat
      if (this.creditLengthInYears > 30) {
        this.filteredValues["maxLiczbaLat"] = "35";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.minLTVsave = "abc";
        this.filteredValues["maxLiczbaLat"] = "";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      }

      //FILTR: minLTV
      if (offer.LTVobliczone > offer.minLTV) {
        offer.minLTVsave = "minLTVok";
        this.filteredValues["minLTVsave"] = "minLTVok";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.minLTVsave = "abc";
        this.filteredValues["minLTVsave"] = "minLTVok";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      }

      //FILTR: maxLTV
      if (offer.LTVobliczone <= offer.maxLTV) {
        offer.maxLTVsave = "maxLTVok";
        this.filteredValues["maxLTVsave"] = "maxLTVok";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.maxLTVsave = "abc";
        this.filteredValues["maxLTVsave"] = "maxLTVok";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      }

      //FILTR minimalnej kwoty kredytu
      if (offer.kwotaKredytuOferty >= offer.minKwotaKredytu) {
        offer.minKwotaKredytuFILTR = "minKwotaKredytuOK";
        this.filteredValues["minKwotaKredytuFILTR"] = "minKwotaKredytuOK";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.minKwotaKredytuFILTR = "abc";
      }

      //FILTR maxymalnej kwoty kredytu
      if (offer.kwotaKredytuOferty <= offer.maxKwotaKredytu) {
        offer.maxKwotaKredytuFILTR = "maxKWotaKredytuOK";
        this.filteredValues["maxKwotaKredytuFILTR"] = "maxKWotaKredytuOK";
        this.offersDataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.maxKwotaKredytuFILTR = "abc";
      }

      /** USTAL KWOTĘ WYMAGANYCH MINIMALNYCH WPŁYWÓW DLA OFERT, KTÓRE WYMAGAJĄ WPŁYWÓW MIN 2 X RATA
       * I OD RAZU USTAW DLA NICH FILTR NA PODSTAWIE MINIMALNYCH WPŁYWÓW, ŻEBY POTEM, JAK KTOŚ PRZELICZY ZNÓW
       * OFERTY, TO ŻEBY ZASTOSOWAĆ NOWY FILTR Z NOWYMI WARTOŚCIAMI
       */

      //Ustal kwotę wymaganych minimalnych wpływów dla ofert, które wymagają wpływów min 2 x rata
      if (offer.minimalneWpływy2xRata === "tak") {
        offer.minimalneWpływy = +offer.rata * 2;
        //zastosuj filtr ten sam co dla wpływów
        if (
          +this.wDeklarowaneWplywy.value >= offer.minimalneWpływy ||
          this.wDeklarowaneWplywy === null
        ) {
          offer.minimalneWplywyStatus = "wplywyOK";
          this.filteredValues["minimalneWplywyStatus"] = "wplywyOK";
          this.offersDataSource.filter = JSON.stringify(this.filteredValues);
        } else {
          offer.minimalneWplywyStatus = "wplywyMalo";
        }
      }

      /**Tutaj jak klikniesz przelicz sprawdź, ile jest wpisanych lat dla filtra WiekNajstarszegoKredytobiorcy i dodaj zmienioną liczbę lat kredytu (okres trwania).
      Musi to tu byc, bo inaczej, jak wpiszesz filtr wieknajstarszego i potem zminisz liczbę lat kredytu, to się filtr nie zaktualizuje */

      this.offers.forEach((element) => {
        if (
          +this.creditLengthInYears +
            +this.wiekNajstarszegoInput.nativeElement.value <
          element.maxWiek
        ) {
          element.maxWiekStatus = "wiekOK";
          this.filteredValues["maxWiekStatus"] = "wiekOK";
        } else {
          element.maxWiekStatus = "wiekMalo";
        }
      });
      this.offersDataSource.filter = JSON.stringify(this.filteredValues);
    });

    if (window.matchMedia("(max-width: 1800px)").matches) {
      this.snav2.close();
    }

    this.showSnackBar();
    this.hideCover();
  }

  customFilterPredicate() {
    const myFilterPredicate = (data: Offer, filter: string): boolean => {
      var globalMatch = !this.globalFilter;
      if (this.globalFilter) {
        // search data.bank text fields
        globalMatch =
          data.bank
            .toString()
            .trim()
            .toLowerCase()
            .indexOf(this.globalFilter.toLowerCase()) !== -1;
      }
      if (!globalMatch) {
        return;
      }
      let searchString = JSON.parse(filter);
      return (
        data.wTrakcieBudowy
          .toString()
          .trim()
          .indexOf(searchString.wTrakcieBudowy) !== -1 &&
        data.maxLTVsave
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.maxLTVsave.toLowerCase()) !== -1 &&
        data.doKiedyObowiazujeStatus
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.doKiedyObowiazujeStatus.toLowerCase()) !== -1 &&
        data.odKiedyObowiazuje
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.odKiedyObowiazuje.toLowerCase()) !== -1 &&
        data.minLTVsave
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.minLTVsave.toLowerCase()) !== -1 &&
        data.minKwotaKredytuFILTR
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.minKwotaKredytuFILTR.toLowerCase()) !== -1 &&
        data.maxKwotaKredytuFILTR
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.maxKwotaKredytuFILTR.toLowerCase()) !== -1 &&
        data.minimalneWplywyStatus
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.minimalneWplywyStatus.toLowerCase()) !== -1 &&
        data.maxLiczbaLat
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.maxLiczbaLat.toLowerCase()) !== -1 &&
        data.maxWiekStatus
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.maxWiekStatus.toLowerCase()) !== -1
      );
    };
    return myFilterPredicate;
  }

  private hideCover(): void {
    this.cover.nativeElement.remove();
  }

  private showSnackBar() {
    this._snackBar.open("Oferty zostały przeliczone", "zamknij", {
      duration: 4000,
    });
  }

  onToggleSideNaClick() {
    this.snav2.toggle();
  }
}

@Component({
  selector: "./dialog-kontakt",
  styleUrls: ["./dialog-kontakt.scss"],
  templateUrl: "./dialog-kontakt.html",
})
export class DialogKontakt {}

@Component({
  selector: "./dialog-blad",
  styleUrls: ["./dialog-blad.scss"],
  templateUrl: "./dialog-blad.html",
})
export class DialogBlad {}
