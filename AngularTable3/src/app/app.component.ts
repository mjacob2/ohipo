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
import { MediaMatcher } from "@angular/cdk/layout";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSidenav } from "@angular/material/sidenav";
import { OffersService } from "./services/http/getOffers.service";
import { Offer } from "./offer";
import { UserInput } from "./user-input";
import { SidenavFilterComponent } from "./sidenav-filter/sidenav-filter.component";

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
  @ViewChild("cover") private cover: ElementRef;
  @ViewChild("snav2") snav2: MatSidenav;
  @ViewChild("sideNavFilter") sideNavFilter: SidenavFilterComponent;

  offersDataSource: MatTableDataSource<Offer>;
  offers: Offer[] = [];
  globalFilter = "";
  filteredValues = {
    minimalneWplywyStatus: "",
    maxWiekStatus: "",
    wTrakcieBudowy: "",
  };

  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  selection = new SelectionModel<Offer>(true, []);
  expandedElement: Offer | null;
  creditLengthInYearsAfterCalculateOffersClick: number = 25;
  offers2: Offer[];

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private _snackBar: MatSnackBar,
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

      //FILTR: W trakcie Budowy checkbox
      this.sideNavFilter.wTrakcieBudowyFilter.valueChanges.subscribe(
        (wTrakcieBudowyFilterValue) => {
          if (wTrakcieBudowyFilterValue == true) {
            this.filteredValues["wTrakcieBudowy"] = "tak";
          } else {
            this.filteredValues["wTrakcieBudowy"] = "";
          }
          this.offersDataSource.filter = JSON.stringify(this.filteredValues);
        }
      );
      //FILTR: Deklarowane wpływy
      this.sideNavFilter.wDeklarowaneWplywy.valueChanges.subscribe(
        (wDeklarowaneWplywyFilterValue) => {
          this.offers.forEach((element) => {
            if (
              wDeklarowaneWplywyFilterValue >= element.minimalneWpływy ||
              wDeklarowaneWplywyFilterValue === null
            ) {
              element.minimalneWplywyStatus = "wplywyOK";
              this.filteredValues["minimalneWplywyStatus"] = "wplywyOK";
            } else {
              element.minimalneWplywyStatus = "wplywyMalo";
            }
          });
          this.offersDataSource.filter = JSON.stringify(this.filteredValues);
        }
      );
      //FILTR: Wiek najstarszego kredytobiorcy
      this.sideNavFilter.wWiekNajstarszego.valueChanges.subscribe(
        (wWiekNajstarszegoFilterValue: number) => {
          this.offers.forEach((element) => {
            if (
              this.creditLengthInYearsAfterCalculateOffersClick + // *** czy to nie wywala błędu?
                wWiekNajstarszegoFilterValue <
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
    });

    this.sort.sort({ id: "kosztyCalkowite", start: "asc" } as MatSortable);
  } // NgOnInit end

  calculateOffers(userInput: UserInput): void {
    const ltv = userInput.loanValue / userInput.propertyValue;
    this.offers2 = this.offers.filter(
      (x) =>
        x.maxLiczbaLat >= userInput.creditLengthInYears &&
        x.minKwotaKredytu <= userInput.loanValue &&
        x.maxKwotaKredytu >= userInput.loanValue &&
        x.maxLTV >= ltv &&
        x.minLTV <= ltv
    );

    this.offersDataSource = new MatTableDataSource(this.offers2);
    this.offersDataSource.sort = this.sort;
    this.offersDataSource.filterPredicate = this.customFilterPredicate();

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
      const endIndex =
        startIndex < length
          ? Math.min(startIndex + pageSize, length)
          : startIndex + pageSize;
      return `${startIndex + 1} – ${endIndex} z ${length}`;
    };

    this.offers2.forEach((offer) => {
      offer.calculateOffer(userInput);

      // FILTER: minimum incom
      if (offer.minimalneWpływy2xRata === "tak") {
        offer.minimalneWpływy = +offer.rata * 2;
        if (
          +this.sideNavFilter.wDeklarowaneWplywy.value >=
            offer.minimalneWpływy ||
          this.sideNavFilter.wDeklarowaneWplywy === null
        ) {
          offer.minimalneWplywyStatus = "OK";
          this.filteredValues["minimalneWplywyStatus"] = "OK";
        } else {
          offer.minimalneWplywyStatus = "NO";
        }
      }

      // FILTER: minimum age
      this.offers2.forEach((element) => {
        if (
          userInput.creditLengthInYears +
            +this.sideNavFilter.wWiekNajstarszego.value <
          element.maxWiek
        ) {
          element.maxWiekStatus = "OK";
          this.filteredValues["maxWiekStatus"] = "OK";
        } else {
          element.maxWiekStatus = "NO";
        }
      });
    });

    this.offersDataSource.filter = JSON.stringify(this.filteredValues);

    this.creditLengthInYearsAfterCalculateOffersClick =
      userInput.creditLengthInYears;

    if (window.matchMedia("(max-width: 1800px)").matches) {
      this.snav2.close();
    }

    this.showSnackBar();
    this.hideCover();

    this.offers2 = this.offers;
  }

  customFilterPredicate() {
    const myFilterPredicate = (data: Offer, filter: string): boolean => {
      let searchString = JSON.parse(filter);
      return (
        data.wTrakcieBudowy
          .toString()
          .trim()
          .indexOf(searchString.wTrakcieBudowy) !== -1 &&
        data.minimalneWplywyStatus
          .toString()
          .trim()
          .toLowerCase()
          .indexOf(searchString.minimalneWplywyStatus.toLowerCase()) !== -1 &&
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
    this._snackBar.open("Oferty zostały przeliczone", "zamknij", {
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
