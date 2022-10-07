import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortable } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { OffersService } from './services/http/getOffers.service';
import { wiborService } from './services/http/getWibor.service';
import { calculationFormulas } from './services/wzory/wzory.service';
import { MatSliderChange } from '@angular/material/slider';
//import { IOffer } from './IOffer';
import { Offer } from './offer';

/** Tutaj logika zaznacz jaki rodzaj rat Cię interesuje */
interface RodzajRat {
  value: string;
  viewValue: string;
}
/** Tutaj logika zaznacz jaki rodzaj rat nieruchomosci */
interface RodzajNieruchomosci {
  value: string;
  viewValue: string;
}
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  //animacje dla rozwijanego wiersza kolumny
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class AppComponent implements OnInit {
  displayedColumns: string[] = ['szczegoly', 'bank', 'ofertaNazwa', 'kosztyCalkowite', 'kosztyPoczatkowe', 'rata', 'oplatyMiesieczne', 'marza', 'pomostoweSuma'];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('wiekNajstarszegoInput') wiekNajstarszegoInput: ElementRef;
  @ViewChild('przykrywkaPoczatkowa') private przykrywkaPoczatkowaElement: ElementRef;
  @ViewChild('snav2') snav2: MatSidenav;

  dataSource: MatTableDataSource<Offer>;
  offers: Offer[];
  mWIBOR3M: number;
  mWIBOR6M: number;


  constructor(
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private _snackBar: MatSnackBar,
    public dialogBlad: MatDialog,
    public dialogKontakt: MatDialog,
    private offersService: OffersService,
    private wiborService: wiborService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 1800px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit() {
    // get Offers from server
    this.offersService.getOffers().subscribe((offers: Offer[]) => {
      this.offers = offers;
      this.dataSource = new MatTableDataSource(offers);
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = this.customFilterPredicate();

      //FILTR: W trakcie Budowy checkbox
      this.wTrakcieBudowyFilter.valueChanges.subscribe((wTrakcieBudowyFilterValue) => {
        if (wTrakcieBudowyFilterValue == true) {
          this.filteredValues['wTrakcieBudowy'] = "tak";
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        } else {
          this.filteredValues['wTrakcieBudowy'] = "";
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        }
      });

      //FILTR: Deklarowane wpływy
      this.wDeklarowaneWplywy.valueChanges.subscribe((wDeklarowaneWplywyFilterValue) => {
        this.offers.forEach((element) => {
          if (wDeklarowaneWplywyFilterValue >= element.minimalneWpływy || wDeklarowaneWplywyFilterValue === null) {
            element.minimalneWplywyStatus = "wplywyOK"
            this.filteredValues['minimalneWplywyStatus'] = "wplywyOK";
            this.dataSource.filter = JSON.stringify(this.filteredValues);
          } else {
            element.minimalneWplywyStatus = "wplywyMalo"
          }
        })
      });

      //FILTR: Wiek najstarszego kredytobiorcy
      this.wWiekNajstarszego.valueChanges.subscribe((wWiekNajstarszegoFilterValue) => {
        this.offers.forEach((element) => {
          if (+this.mLiczbaLat + +wWiekNajstarszegoFilterValue < element.maxWiek) {
            element.maxWiekStatus = "wiekOK"
            this.filteredValues['maxWiekStatus'] = "wiekOK";
          } else {
            element.maxWiekStatus = "wiekMalo"
          }
        })
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      });


      //Dzisiajsza data dla OD-kiedyobowiazuje
      var todayDate = new Date();
      this.offers.forEach((element) => {
        var mElementOdKiedyObowiazuje = new Date(element.odKiedyObowiazuje)
        if (mElementOdKiedyObowiazuje < todayDate) { //Data jest z minutami i sekundami, więc nie musi być <= bo już sekundę po północy mElementOdKiedyObowiazuje jest mniejszy od todayDate
          element.odKiedyObowiazuje = "już"
        }

        //Dzisiajsza data dla DO-kiedyobowiazuje
        var mElementDoKiedyObowiazuje = new Date(element.doKiedyObowiazuje)
        mElementDoKiedyObowiazuje.setDate(mElementDoKiedyObowiazuje.getDate() + 1);// dodaj 1 dzień do daty, do kiedy obowiązuje, bo data obowiązuje do godziny 0:00:00 danego dnia, więc jest już nieaktualna jak tylko ten dzień siezacznie, a chcemy, aby była aktualna jeszcze tego jednego ostatniego dnia. Zatem.
        if (element.doKiedyObowiazuje === "do odwołania")
          element.doKiedyObowiazujeStatus = "aktualne"
        if (mElementDoKiedyObowiazuje > todayDate) {
          element.doKiedyObowiazujeStatus = "aktualne"
          element.doKiedyObowiazuje = mElementDoKiedyObowiazuje
        }

      });
      this.filteredValues['odKiedyObowiazuje'] = "już";
      this.filteredValues['doKiedyObowiazujeStatus'] = "aktualne";
      this.dataSource.filter = JSON.stringify(this.filteredValues);
      this.dataSource.sort = this.sort;

      /**funkcja pokazywania paginatora */
      this.dataSource.paginator = this.paginator;

      /**tutaj jest tłumaczenie dla paginatora na polski */
      this.dataSource.paginator._intl.itemsPerPageLabel = "Pozycji na stronę:";
      this.dataSource.paginator._intl.nextPageLabel = 'Następna strona';
      this.dataSource.paginator._intl.previousPageLabel = 'Poprzednia strona';
      this.dataSource.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length == 0 || pageSize == 0) { return `0 z ${length}`; }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
          Math.min(startIndex + pageSize, length) :
          startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} z ${length}`;
      }

    });

    // get WIBOR from server
    this.wiborService.getWibor().subscribe(data => {
      this.mWIBOR3M = data['mWIBOR3M'],
        this.mWIBOR6M = data['mWIBOR6M']
    });

    //stwórz form Bilder
    this.zbudujFormularz();

    // Domyslnie sortuj po kosztach całkowitych podczas uruchomienia 
    this.sort.sort(({ id: 'kosztyCalkowite', start: 'asc' }) as MatSortable);
    // this.dataSource.sort = this.sort;


  }
  //dodaj do slidera % na końcu łezki (label) do
  formatLabel(value: number) {
    return value + '%';
  }

  //dla responsywnego sideNMavigacji
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;
  ofertyPobrane: Object; //varable dla pobieranych ofert z sieci
  selection = new SelectionModel<Offer>(true, []);
  expandedElement: Offer | null;

  //Grupa dla Formularza sprawdzania walidacji danych
  myGroup: FormGroup;
  ngWartoscNieruchomosci = 300000;
  mWartoscNieruchomosci = +this.ngWartoscNieruchomosci;
  ngLiczbaLat = 25
  sliderValue = 10
  wkladWlasnyNowy = (this.sliderValue / 100) * this.ngWartoscNieruchomosci

  ngWartoscNieruchomosciZmiana(wartosc: number) {
    this.ngWartoscNieruchomosci = wartosc;
    this.wkladWlasnyNowy = (this.sliderValue / 100) * this.ngWartoscNieruchomosci
  }
  sliderSunie(sliderWkladWlasny: MatSliderChange) {
    this.sliderValue = sliderWkladWlasny.value
    this.wkladWlasnyNowy = (this.sliderValue / 100) * this.ngWartoscNieruchomosci
  }

  // używany w działaniach wkład własny ustaw na wwyokość obliczoną przez slider
  mwkladWlasny = this.wkladWlasnyNowy
  mKwotaKredytu: number = 0;
  mLiczbaLat = this.ngLiczbaLat;
  /**Zaznacz domyślnie RATY RÓWNE */
  selectedOptionRaty = '0';
  //zaznacz domyslnie rodzaj nieruchomości
  selectedOptionRodzajNieruchomosci = '0';
  //zaznacz domyslnie w jakim banku konto: inny
  selectedOptionInny = '0';

  //zmienna żeby odczytywać jaki bank jest aktualnie wybrany, domyslnie 0 czyli Inny
  inWhichBankAlreadyAccount: number = 0;

  mpokazOpcjeZaawansowane: boolean;

  //Ustal domyślne wartości dla stawek WIBOR i czasu pomostowego
  mPomostoweIleMiesiecy: number = 3;

  /** ZADEKLAROWANE ZMIENNE DO FILTRÓW */
  wTrakcieBudowyFilter = new FormControl();
  wDeklarowaneWplywy = new FormControl();
  wWiekNajstarszego = new FormControl();
  nameFilter = new FormControl();

  //Filtry dochodów
  wUmowaOPraceCzasNieokreslony = new FormControl();
  wUmowaOPraceCzasOkreslony = new FormControl({ value: '', disabled: true });
  wUmowaZlecenieDzielo = new FormControl({ value: '', disabled: true });
  uUmowaNaZastepstwo = new FormControl({ value: '', disabled: true });
  wDzialanoscGospodarcza = new FormControl({ value: '', disabled: true });
  wDochodyZnajmu = new FormControl({ value: '', disabled: true });
  wEmerytura = new FormControl({ value: '', disabled: true });
  wRenta = new FormControl({ value: '', disabled: true });
  wDywidendy = new FormControl({ value: '', disabled: true });
  wDietyDelegacje = new FormControl({ value: '', disabled: true });
  wDochodyMarynarzy = new FormControl({ value: '', disabled: true });
  wPowolanie = new FormControl({ value: '', disabled: true });

  globalFilter = '';
  //Ustal zmienne dla filtrów
  mLTV: number = 0;

  //po tych kolumnach mogą być filtrowane oferty
  filteredValues = {
    minimalneWplywyStatus: '', bank: '', maxLiczbaLat: '', maxWiekStatus: '', ofertaNazwa: '', minKwotaKredytuFILTR: '', maxKwotaKredytuFILTR: '', wTrakcieBudowy: '', maxLTVsave: '', minLTVsave: '', doKiedyObowiazujeStatus: '', odKiedyObowiazuje: '', wWielkimMiescieFilterKolumna: ''
  };

  calculateOffers(): void {
    if (window.matchMedia("(max-width: 1800px)").matches) {
      this.snav2.close();
    }

    this.mKwotaKredytu = calculationFormulas.calculateCreditAmount(this.mWartoscNieruchomosci, this.wkladWlasnyNowy);

    this.offers.forEach((offer) => {

      offer.kwotaKredytuOferty = calculationFormulas.calculateCreditAmountWithAddictionalCosts(this.mKwotaKredytu, offer.oplatyZawszeKredytowane);
      this.mLTV = calculationFormulas.calculateGeneralLTV(this.mKwotaKredytu, this.mWartoscNieruchomosci);
      offer.LTVobliczone = calculationFormulas.calculateOfferLTV(offer.kwotaKredytuOferty, this.mWartoscNieruchomosci);
      offer.WIBORstawka = calculationFormulas.assignCurrentWIBORtoOffers(offer.WIBOR, this.mWIBOR3M, this.mWIBOR6M);
      offer.rata = calculationFormulas.calculateFirstEqualInstallment(offer.oprocStale, offer.kwotaKredytuOferty, offer.WIBORstawka, offer.marza, this.mLiczbaLat);
      offer.ubezpNieruchSuma = calculationFormulas.CalculateApartmentInsuranceMonthly(offer.ubezpNieruchOdCzegoLicz, offer.ubezpNieruchStawkaRok, this.mWartoscNieruchomosci, this.mKwotaKredytu)
      offer.ubezpNieruchTOTAL = calculationFormulas.calculateTotalAppartmentInsurance(offer.ubezpNieruchOdCzegoLicz, offer.ubezpNieruchSuma, this.mLiczbaLat);
      offer.ubezpZycieSuma = calculationFormulas.calculateLifeInsuranceMonthly(offer.ubezpZycieStawkaMiesieczna, offer.kwotaKredytuOferty);
      //** oblicz OPŁATY MIESIECZNE */
      offer.oplatyMiesieczne = offer.ubezpNieruchSuma + offer.ubezpZycieSuma;
      /** */


      /**
       * 
       *    OPŁATY NA START
       * 
       */

      /**oblicz PROWIZJĘ*/
      offer.prowizjaSuma = + (+this.mKwotaKredytu * (+offer.prowizjaStawka / 100));
      /** Oblicz UBEZP. ŻYCIE NA START */
      offer.ubezZycieNaStartSuma = +offer.kwotaKredytuOferty * (+offer.ubezZycieNaStart / 100);
      /** Olblicz UBEZP. PRACA NA START */
      offer.upezpPracaNaStartSuma = +this.mKwotaKredytu * (+offer.upezpPracaNaStart / 100);
      /**oblicz OPŁATY NA START -  SUMA*/
      offer.kosztyPoczatkowe = +offer.prowizjaSuma + +offer.wycenaMieszkanie + +offer.ubezZycieNaStartSuma + +offer.upezpPracaNaStartSuma;
      /** */


      /**oblicz UBEZPIECZENIE POMOSTOWE  */
      if (offer.pomostoweJakLiczone === "stawka") { //Jeśli ubezp. pomostowe jest płątne jako dodatkowa opłata ze swojąstawką

        // Oblicz ile jest płątne miesieczne ubezp. pomosotowe
        offer.pomostoweSuma = (offer.pomostoweStawkaMiesieczna / 100 / 12) * offer.kwotaKredytuOferty;

        //Oblicz ile jest płątne za cały okres założony do kalkulacji
        offer.pomostoweTOTAL = offer.pomostoweSuma * +this.mPomostoweIleMiesiecy;


      } if (offer.pomostoweJakLiczone === "doliczoneDoMarzy") { //Jeśli ubezpieczenie pomostowe jest płatne jako podwyżka do marży, to oblicz je jako różnicę miedzy ratą z oprocentowaniem powiększonym o element.pomostoweStawkaMiesieczna a zwykła ratą bez tego

        offer.pomostoweSuma =
          //rata z element.pomostoweStawkaMiesieczna
          calculationFormulas.rata(offer.kwotaKredytuOferty, offer.WIBORstawka + offer.marza + offer.pomostoweStawkaMiesieczna, this.mLiczbaLat)
          //rata zwykła standardowa
          - calculationFormulas.rata(offer.kwotaKredytuOferty, offer.WIBORstawka + offer.marza, this.mLiczbaLat)

        //Oblicz ile jest płątne za cały okres założony do kalkulacji
        offer.pomostoweTOTAL = offer.pomostoweSuma * +this.mPomostoweIleMiesiecy;
      }



      /***
       * 
       *    SUMA ODSETEK
       * 
       */


      //**Oblicz sumę ODSETEK RATY RÓWNE */
      if (offer.oprocStale === "nie")  //jeśli oprocentowanie zmienne
        offer.odsetkiSuma = calculationFormulas.odsetkiZaplaconeWcalymOkresie(+offer.rata, +this.mLiczbaLat, offer.kwotaKredytuOferty)

      //Jeśli Pekao z ofertą z % wyższym do czasu jak LTV jest > 0.8 bez CPI
      if (offer.oprocStale === "jakPEKAO") {
        var ileRazy = 0;
        var i = 0;
        for (i = 0; i <= this.mLiczbaLat * 12; i++) {
          var kwotaKredytu = offer.kwotaKredytuOferty;
          var rata = offer.rata;
          ileRazy++;
          var r = (offer.marza + offer.WIBORstawka) / 1200;
          var cz1 = (1 + r) ** i;
          var gora = ((1 + r) ** i) - 1;
          var goradol = gora / r;
          var zostaloDoSplaty = cz1 * +kwotaKredytu - goradol * +rata;
          suma = suma + zostaloDoSplaty;
          if (zostaloDoSplaty < (+this.mWartoscNieruchomosci * 0.8)) { break }

        }
        ileRazy = i;
        console.log("ile razy: " + offer.id + "  " + ileRazy)
        console.log("zostało do spłaty: " + zostaloDoSplaty)
        //policz sumę odsetek w okresie kiedy LTV jest > 80%
        let odsetkiZaplaconeAA = calculationFormulas.odsetkiZaplaconeNaKoniecNokresu(offer.rata, ileRazy / 12, offer.kwotaKredytuOferty, offer.marza + offer.WIBORstawka)
        console.log("odsetki zanim 80%: " + odsetkiZaplaconeAA)
        //Oblicz ratę potem, czyli wg oprocentowania obowiązującego od momentu, kiedy LTV spadnie poniżej 80%
        let rataPotem2 = calculationFormulas.rata(offer.kwotaKredytuOferty, offer.WIBORstawka + offer.oprocStaleMarzaPotem, this.mLiczbaLat)

        //Oblicz odsetki zapłacone w całym okresie wg raty potem
        let odsetkiZaplaconeBB = calculationFormulas.odsetkiZaplaconeWcalymOkresie(rataPotem2, this.mLiczbaLat, offer.kwotaKredytuOferty)

        //Oblicz sumę odsetek płatnych na koniec okresu z początkowym oprocentowaniem, gdy LTV > 80%. ileRazy / 12 bo we wzorze jest mnożone * 12
        let odsetkiZaplaconeCC = calculationFormulas.odsetkiZaplaconeNaKoniecNokresu(rataPotem2, ileRazy / 12, offer.kwotaKredytuOferty, offer.oprocStaleMarzaPotem + offer.WIBORstawka)

        //policz sumę odsetek: do odsetek płatnych w orkesie LTV >80% (odsetkiZaplaconeA) dodaj odsetki płątne w całym okresie (odsetkiZaplaconeB) pomniejszone o odsetki (odsetkiZaplaconeC), czyli, które nie będą przecież zapłacone, bo już sa zapłącone te w okresie LTV >80%.
        offer.odsetkiSuma = odsetkiZaplaconeAA + (odsetkiZaplaconeBB - odsetkiZaplaconeCC);
      }



      if (offer.oprocStale === "tak") { //jesli oprocentowanie stałe TAK

        //policz sumę odsetek w okresie ze stałą stopą
        let odsetkiZaplaconeA = calculationFormulas.odsetkiZaplaconeNaKoniecNokresu(offer.rata, offer.oprocStaleIleLat, offer.kwotaKredytuOferty, offer.marza)

        //Oblicz ratę potem, czyli wg oprocentowania w kolejnym okresie po oprocentowaniu zmiennym
        let rataPotem = calculationFormulas.rata(offer.kwotaKredytuOferty, +offer.WIBORstawka + +offer.oprocStaleMarzaPotem, +this.mLiczbaLat)

        //Oblicz odsetki zapłacone w całym okresie wg raty potem
        // @@@@@@@@@@@@@@@@@@@@@ czy tu nie powinna byćponiżej element.kwotaKredytuOferty zamiast this.mKwotaKRedytu???????????????????????????????????
        let odsetkiZaplaconeB = calculationFormulas.odsetkiZaplaconeWcalymOkresie(rataPotem, this.mLiczbaLat, this.mKwotaKredytu)

        //Oblicz sumę odsetek płatnych na koniec okresu ze stałą stopą
        let odsetkiZaplaconeC = calculationFormulas.odsetkiZaplaconeNaKoniecNokresu(rataPotem, offer.oprocStaleIleLat, offer.kwotaKredytuOferty, offer.oprocStaleMarzaPotem + offer.WIBORstawka)

        //policz sumę odsetek: do odsetek płatnych w orkesie ze stałąstopą (odsetkiZaplaconeA) dodaj odsetki płątne w całym okresie (odsetkiZaplaconeB) pomniejszone o odsetki (odsetkiZaplaconeC), czyli, które nie będą przecież zapłacone, bo już sa zapłącone te w okresie ze stałą stopą.
        offer.odsetkiSuma = odsetkiZaplaconeA + (odsetkiZaplaconeB - odsetkiZaplaconeC);
      }


      /** CAŁKOWITY KOSZT UBEZPIECZENIA OD SALDA KREDYTU MALEJACEGO CO ROKU */

      if (offer.ubezpZycieIleLat === 999) { // jesi ubezpieczenie jest pobierane przez cały okres kredytu
        var liczbaLat = this.mLiczbaLat;
      } else {
        var liczbaLat = offer.ubezpZycieIleLat - 1;
      }

      var suma = offer.kwotaKredytuOferty;
      var skladkaCalkowita = 0;

      if (offer.ubezpZycieIleLat > 1) { //licz tylko jeśli oferta zawiera ubezpieczenie na życie
        for (i = offer.ubezpZycieOdKtoregoMiesiaca; i <= liczbaLat * 12; i = i + 12) {
          var kwotaKredytu = offer.kwotaKredytuOferty;
          var rata = offer.rata;
          var i: number;
          var r = (offer.marza + offer.WIBORstawka) / 1200;
          var cz1 = (1 + r) ** i;
          var gora = ((1 + r) ** i) - 1;
          var goradol = gora / r;
          var zostaloDoSplaty = cz1 * +kwotaKredytu - goradol * +rata;
          suma = suma + zostaloDoSplaty;
        }
        skladkaCalkowita = (suma / liczbaLat) * (offer.ubezpZycieStawkaMiesieczna / 100 * 12) * liczbaLat;
        /**Oblicz ubezpieczenie na zycie TOTAL przec cały okres kredytu */
        offer.ubezpZycieTOTAL = skladkaCalkowita;
      }

      /** KOSZTY CAŁKOWITE */
      offer.kosztyCalkowite = +offer.prowizjaSuma + +offer.wycenaMieszkanie + +offer.ubezpZycieTOTAL + +offer.ubezpNieruchTOTAL + +offer.odsetkiSuma + +offer.ubezZycieNaStartSuma + offer.upezpPracaNaStartSuma + +offer.pomostoweTOTAL;



      /**
       * 
       *  F
       *    I
       *      L
       *        T
       *          R
       *            Y
       * 
       */

      //FILTR: maxLiczbaLat
      if (this.mLiczbaLat > 30) {
        this.filteredValues['maxLiczbaLat'] = "35";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.minLTVsave = "abc";
        this.filteredValues['maxLiczbaLat'] = "";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }






      //FILTR: minLTV
      if (offer.LTVobliczone > offer.minLTV) {
        offer.minLTVsave = "minLTVok";
        this.filteredValues['minLTVsave'] = "minLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.minLTVsave = "abc";
        this.filteredValues['minLTVsave'] = "minLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }


      //FILTR: maxLTV
      if (offer.LTVobliczone <= offer.maxLTV) {
        offer.maxLTVsave = "maxLTVok";
        this.filteredValues['maxLTVsave'] = "maxLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);

      } else {
        offer.maxLTVsave = "abc";
        this.filteredValues['maxLTVsave'] = "maxLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }


      //FILTR minimalnej kwoty kredytu
      if (offer.kwotaKredytuOferty >= offer.minKwotaKredytu) {
        offer.minKwotaKredytuFILTR = "minKwotaKredytuOK";
        this.filteredValues['minKwotaKredytuFILTR'] = "minKwotaKredytuOK";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        offer.minKwotaKredytuFILTR = "abc";
      }

      //FILTR maxymalnej kwoty kredytu
      if (offer.kwotaKredytuOferty <= offer.maxKwotaKredytu) {
        offer.maxKwotaKredytuFILTR = "maxKWotaKredytuOK";
        this.filteredValues['maxKwotaKredytuFILTR'] = "maxKWotaKredytuOK";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
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
        if (+this.wDeklarowaneWplywy.value >= offer.minimalneWpływy || this.wDeklarowaneWplywy === null) {
          offer.minimalneWplywyStatus = "wplywyOK"
          this.filteredValues['minimalneWplywyStatus'] = "wplywyOK";
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        } else {
          offer.minimalneWplywyStatus = "wplywyMalo"
        }
      }


      /**Tutaj jak klikniesz przelicz sprawdź, ile jest wpisanych lat dla filtra WiekNajstarszegoKredytobiorcy i dodaj zmienioną liczbę lat kredytu (okres trwania).
      Musi to tu byc, bo inaczej, jak wpiszesz filtr wieknajstarszego i potem zminisz liczbę lat kredytu, to się filtr nie zaktualizuje */

      this.offers.forEach((element) => {
        if (+this.mLiczbaLat + +this.wiekNajstarszegoInput.nativeElement.value < element.maxWiek) {
          element.maxWiekStatus = "wiekOK"
          this.filteredValues['maxWiekStatus'] = "wiekOK";
        } else {
          element.maxWiekStatus = "wiekMalo"
        }
      })
      this.dataSource.filter = JSON.stringify(this.filteredValues);




    });


    //**pokaż snack bar */
    this._snackBar.open("Oferty zostały przeliczone", "zamknij", {
      duration: 4000,
    });



    // usuń przykrywkę początkową
    this.przykrywkaPoczatkowaElement.nativeElement.remove();




  }










  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Offer): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.bank + 1}`;
  }




  // konstruktor dla ERROR dla  formWartoscNieruchomosci
  get errorMessageformWartoscNieruchomosci(): string {
    const form: FormControl = (this.myGroup.get('formWartoscNieruchomosci') as FormControl);
    return form.hasError('required') ?
      'Pole wymagane' :
      form.hasError('min') ?
        'Minimum 100 000' :
        form.hasError('max') ?
          'Maksymalnie 2 000 000' : '';
  }







  // konstruktor dla ERROR dla  formWkladWlasny
  // get errorMessageformWkladWlasny(): string {

  //  let nazwa = this.mWartoscNieruchomosci * 0.1
  //   let nazwa3 = nazwa.toString()
  //   nazwa3 = this.currencyPipe.transform(nazwa3, 'zł', 'symbol', '1.0-0', 'fr');

  //   const form: FormControl = (this.myGroup.get('formWkladWlasny') as FormControl);
  //   return form.hasError('required') ?
  //     'Minimum ' + nazwa3 :
  //    form.hasError('min') ?
  //      'Minimum ' + nazwa3 :
  //      form.hasError('max') ?
  //        'Maksymalnie 2 000 000' : '';
  // }


  // konstruktor dla ERROR dla  formKwotaKredytu
  // get errorMessageformKwotaKredytu(): string {
  //   const form: FormControl = (this.myGroup.get('formKwotaKredytu') as FormControl);
  //  return form.hasError('required') ?
  //    'Pole wymagane' :
  //    form.hasError('min') ?
  //      'Minimum 50 000' :
  //      form.hasError('max') ?
  //        'Maksymalnie 2 000 000' : '';
  // }





  // konstruktor dla ERROR dla  formLiczbaLat
  get errorMessageformLiczbaLat(): string {
    const form: FormControl = (this.myGroup.get('formLiczbaLat') as FormControl);
    return form.hasError('required') ?
      'Minimum 5' :
      form.hasError('min') ?
        'Minimum 5' :
        form.hasError('max') ?
          'Maksymalnie 35' : '';
  }




  zbudujFormularz(): void {
    //DO VALIDACJI DANCH FORMULARZA
    this.myGroup = new FormGroup({
      formWartoscNieruchomosci: new FormControl("", [Validators.max(2000000), Validators.min(100000)]),
      //formKwotaKredytu: new FormControl("", [Validators.max(2000000), Validators.min(50000)]),
      formLiczbaLat: new FormControl("", [Validators.max(35), Validators.min(5)]),
      formPomostoweIleMiesiecy: new FormControl("", [Validators.max(48), Validators.min(0)]),
      formWIBOR3M: new FormControl("", [Validators.max(10), Validators.min(-10)]),
      formWIBOR6M: new FormControl("", [Validators.max(10), Validators.min(-10)]),
      // formWkladWlasny: new FormControl("", [Validators.max(2000000), Validators.min(1)]),

    });
  }

  customFilterPredicate() {
    const myFilterPredicate = (data: Offer, filter: string): boolean => {
      var globalMatch = !this.globalFilter;
      if (this.globalFilter) {
        // search data.bank text fields
        globalMatch = data.bank.toString().trim().toLowerCase().indexOf(this.globalFilter.toLowerCase()) !== -1;
      }
      if (!globalMatch) {
        return;
      }
      let searchString = JSON.parse(filter);
      return data.wTrakcieBudowy.toString().trim().indexOf(searchString.wTrakcieBudowy) !== -1
        &&
        data.maxLTVsave.toString().trim().toLowerCase().indexOf(searchString.maxLTVsave.toLowerCase()) !== -1
        &&
        data.doKiedyObowiazujeStatus.toString().trim().toLowerCase().indexOf(searchString.doKiedyObowiazujeStatus.toLowerCase()) !== -1
        &&
        data.odKiedyObowiazuje.toString().trim().toLowerCase().indexOf(searchString.odKiedyObowiazuje.toLowerCase()) !== -1
        &&
        data.minLTVsave.toString().trim().toLowerCase().indexOf(searchString.minLTVsave.toLowerCase()) !== -1
        &&
        data.minKwotaKredytuFILTR.toString().trim().toLowerCase().indexOf(searchString.minKwotaKredytuFILTR.toLowerCase()) !== -1
        &&
        data.maxKwotaKredytuFILTR.toString().trim().toLowerCase().indexOf(searchString.maxKwotaKredytuFILTR.toLowerCase()) !== -1
        &&
        data.minimalneWplywyStatus.toString().trim().toLowerCase().indexOf(searchString.minimalneWplywyStatus.toLowerCase()) !== -1
        &&
        data.maxLiczbaLat.toString().trim().toLowerCase().indexOf(searchString.maxLiczbaLat.toLowerCase()) !== -1
        &&
        data.maxWiekStatus.toString().trim().toLowerCase().indexOf(searchString.maxWiekStatus.toLowerCase()) !== -1

        ;
    }
    return myFilterPredicate;
  }


  RodzajeRat: RodzajRat[] = [
    { value: '0', viewValue: 'Równe' },
    { value: '1', viewValue: 'Malejące' },
  ];

  RodzajeNieruchomosci: RodzajNieruchomosci[] = [
    { value: '0', viewValue: 'Mieszkanie' },
    { value: '1', viewValue: 'Dom' },
    { value: '2', viewValue: 'Działka' },
  ];

  zamienNaDate(d: string) {
    var b = new Date(d);
    var curr_date = b.getDate();
    var curr_month = b.getMonth();
    var curr_year = b.getFullYear()
    var months = new Array("01", "02", "03",
      "04", "05", "06", "07", "08", "09",
      "10", "11", "12");
    var dataDzisiajX = curr_date + "." + months[curr_month] + "." + curr_year
    return dataDzisiajX;
  }

  // Otwórz formularz ZOHO do liczenia zdolnoąci kredytowej w nowej karcie przeglądarki
  openZohoForm() {
    window.open("https://forms.zohopublic.eu/jakubickim/form/abc/formperma/4CTCfBkz-6-h29FkJPHQmyeFShrErtcsuppDiUTmZOI", "_blank");
  }


  openDialogKontakt() {
    const dialogRef = this.dialogKontakt.open(DialogKontakt, {
      disableClose: true, //nie zamykaj po kliknięciu poza dialogiem
      backdropClass: 'backdropBackground' // ta klasa będzie przypisana do zaciemnienia tła kiedy Dialog jest otwarty
    });

    //funkcja odpalana kiedy zamykam dialog
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Rezultat dialogu: ${result}`);
    });
  }

  openDialogBlad() {
    const dialogRef = this.dialogBlad.open(DialogBlad, {
      disableClose: true, //nie zamykaj po kliknięciu poza dialogiem
      backdropClass: 'backdropBackground' // ta klasa będzie przypisana do zaciemnienia tła kiedy Dialog jest otwarty
    });

    //funkcja odpalana kiedy zamykam dialog
    dialogRef.afterClosed().subscribe(result => {
      // console.log(`Rezultat dialogu błąd: ${result}`);
    });
  }


}



@Component({
  selector: './dialog-kontakt',
  styleUrls: ['./dialog-kontakt.scss'],
  templateUrl: './dialog-kontakt.html',
})
export class DialogKontakt { }

@Component({
  selector: './dialog-blad',
  styleUrls: ['./dialog-blad.scss'],
  templateUrl: './dialog-blad.html',
})
export class DialogBlad { }
