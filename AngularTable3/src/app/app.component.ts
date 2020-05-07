import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortable } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import oferty from '../app/oferty/oferty.json';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';

//Importuj Services
import { HttpOfertyService } from './services/http-oferty.service';
import { WzoryService } from './services/wzory.service';


//import { SnackBarService } from './services/snack-bar.service';

//import oferty2 from '../assets/oferty2.json';

//Kolumny w pliku Excel


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
export interface PeriodicElement {
  id: number;
  bank: string;
  ofertaNazwa: string;
  ofertaNazwaDopisek: string;
  kosztyPoczatkowe: number;
  marza: number;
  rata: number;
  pomostoweStawkaMiesieczna: number;
  pomostoweSuma: number;
  ubezpNieruchStawkaRok: number;
  ubezpNieruchSuma: number;
  ubezpNieruchTOTAL: number;
  ubezpZycieStawkaMiesieczna: number;
  ubezpZycieSuma: number;
  wTrakcieBudowy: string;
  WIBOR: string;
  WIBORstawka: number;
  prowizjaStawka: number;
  prowizjaSuma: number;
  warunkiOferty: string;
  wycenaMieszkanie: number;
  oplatyMiesieczne: number;
  odsetkiSuma: number;
  ubezpZycieTOTAL: number;
  kosztyCalkowite: number;
  maxLTV: number;
  minLTV: number;
  ubezpZycieIleLat: number;
  ubezpNieruchOdCzegoLicz: string;
  pomostoweJakLiczone: string;
  oprocStale: string;
  oprocStaleIleLat: number;
  oprocStaleMarzaPotem: number;
  doKiedyObowiazuje: string;
  odKiedyObowiazuje: string;
  maxLTVsave: string;
  minLTVsave: string;
  ubezZycieNaStart: number;
  ubezZycieNaStartSuma: number;
  ubezpZycieOdKtoregoMiesiaca: number;
  upezpPracaNaStart: number;
  upezpPracaNaStartSuma: number;
  minKwotaKredytu: number;
  minKwotaKredytuFILTR: string;
  maxKwotaKredytu: number;
  maxKwotaKredytuFILTR: string;
  pomostoweTOTAL: number;
  link: string;
  dataDostepu: any;
  doKiedyObowiazujeStatus: string;
  doKiedyObowiazujeWyswietl: string;
  minimalneWpływy: number;
  minimalneWplywyStatus: string;
  minimalneWpływy2xRata: string;
  logoURL: string;
  oplatyZawszeKredytowane: number;
  kwotaKredytuOferty: number;
  LTVobliczone: number;
}

//co się składa na ELEMENT DATA
const ELEMENT_DATA: PeriodicElement[] = oferty

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})



export class AppComponent implements OnInit {

  //dla responsywnego sideNMavigacji
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  ofertyPobrane: Object; //varable dla pobieranych ofert z sieci

  constructor(
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private _snackBar: MatSnackBar,
    //kontruktor dla Service pobierania ofert './services/http-oferty.service'
    private _http: HttpOfertyService,

  ) { // tu rzeczy dla side Barów
    this.mobileQuery = media.matchMedia('(max-width: 1380px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  //zmienna dla akordeona pierwszego
  xpandStatus;

  dataSource = new MatTableDataSource(ELEMENT_DATA);

  selection = new SelectionModel<PeriodicElement>(true, []);
  expandedElement: PeriodicElement | null;

  //Grupa dla Formularza sprawdzania walidacji danych
  myGroup: FormGroup;

  // Utwórz zmienną dla kwoty deklarowanych wpływów
  mKwotaKredytu: number = 0;
  mWartoscNieruchomosci: number = 0;
  mLiczbaLat: number = 0;
  /**Zaznacz domyślnie RATY RÓWNE */
  selectedOptionRaty = '0';
  //zaznacz domyslnie rodzaj nieruchomości
  selectedOptionRodzajNieruchomosci = '0';
  mpokazOpcjeZaawansowane: boolean;

  //Ustal domyślne wartości dla stawek WIBOR i czasu pomostowego
  mWIBOR3M: number = 0.69;
  mWIBOR6M: number = 0.69;
  mPomostoweIleMiesiecy: number = 3;

  /** ZADEKLAROWANE ZMIENNE DO FILTRÓW */
  wTrakcieBudowyFilter = new FormControl();
  wDeklarowaneWplywy = new FormControl();
  nameFilter = new FormControl();
  globalFilter = '';
  //Ustal zmienne dla filtrów
  mWplywy: number;
  mLTV: number = 0;

  //wyświetlane kolumny
  displayedColumns: string[] = ['szczegoly', 'select', 'bank', 'ofertaNazwa', 'kosztyCalkowite', 'kosztyPoczatkowe', 'rata', 'oplatyMiesieczne', 'marza', 'pomostoweSuma', 'WIBOR', 'LTVobliczone', 'doKiedyObowiazuje'];

  //po tych kolumnach mogą być filtrowane oferty
  filteredValues = {
    minimalneWplywyStatus: '', bank: '', ofertaNazwa: '', minKwotaKredytuFILTR: '', maxKwotaKredytuFILTR: '', wTrakcieBudowy: '', maxLTVsave: '', minLTVsave: '', doKiedyObowiazujeStatus: '', odKiedyObowiazuje: ''
  };


  //**konstruktor dla SnackBar */
  //constructor(private _snackBar: MatSnackBar) { }

  //funkcja do linkowania po kliknięciu w Żródło
  linkuj(link) {
    window.open(link, "_blank");
  }

  /** to funkcja zaszyta w przycisku PRZELICZ */
  przelicz() {


    //Licz wszystko to co jest potrzebne dla każdej z ofert z osobna
    ELEMENT_DATA.forEach((element) => {

      // oblicz KWOTĘ KREDYTU dla każdej z ofert z osobna biorąc po uwagę koszty wrzucone w kredyt
      element.kwotaKredytuOferty = +this.mKwotaKredytu + (+this.mKwotaKredytu * (element.oplatyZawszeKredytowane / 100))

      //Oblicz ogólne LTV
      this.mLTV = +this.mKwotaKredytu / +this.mWartoscNieruchomosci;

      //oblicz LTV dla oferty z osobna
      element.LTVobliczone = element.kwotaKredytuOferty / +this.mWartoscNieruchomosci
      //  console.log(element.id + " " + element.LTVobliczone);

      //Ustal i wpisz stawkę WIBOR dla każdej oferty
      if (element.WIBOR === "3M") {
        element.WIBORstawka = this.mWIBOR3M;
      }
      if (element.WIBOR === "6M") {
        element.WIBORstawka = this.mWIBOR6M;
      }

      /**
       * 
       *    RATY
       * 
       */

      /**oblicz pierwszą ratę RÓWNE */
      if (element.oprocStale === "nie") { //jeśli oprocentowanie zmienne
        element.rata = WzoryService.rata(element.kwotaKredytuOferty, element.WIBORstawka + element.marza, this.mLiczbaLat)

      } else { //jesli oprocentowanie stałe to nie bierz WIBOR
        element.rata = WzoryService.rata(element.kwotaKredytuOferty, element.marza, this.mLiczbaLat)
      }
      /**Tutaj jest formuła do liczenia raty MALEJĄCEJ PIERWSZEJ 
element.rata = "" + ((element.kwotaKredytuOferty / (+this.mLiczbaLat*12)) + (element.kwotaKredytuOferty * (((+element.WIBOR + +element.marza)/100)/12))) 
*/
      /** */


      /**
       * 
       *   OPŁATY MIESIĘCZNE
       * 
       */

      /**oblicz UBEZPIECZENIE NIERUCHOMOŚCI */
      if (element.ubezpNieruchOdCzegoLicz === "wartNieruchomosci") { /** Tutaj banki, które liczą ubezp. nieruch. od wartości nieruchomości */
        element.ubezpNieruchSuma = (element.ubezpNieruchStawkaRok / 100 / 12) * +this.mWartoscNieruchomosci;
        element.ubezpNieruchTOTAL = element.ubezpNieruchSuma * +this.mLiczbaLat * 12;
      } else { /** Tutaj banki, które liczą ubezp. nieruch. od kwoty kredytu */
        element.ubezpNieruchSuma = (+element.ubezpNieruchStawkaRok / 100 / 12) * element.kwotaKredytuOferty;
        element.ubezpNieruchTOTAL = +element.ubezpNieruchSuma * +this.mLiczbaLat * 12;
      }
      /**oblicz UBEZPIECZENIE NA ŻYCIE miesieczne */
      element.ubezpZycieSuma = (element.ubezpZycieStawkaMiesieczna / 12) * element.kwotaKredytuOferty;
      //** oblicz OPŁATY MIESIECZNE */
      element.oplatyMiesieczne = element.ubezpNieruchSuma + element.ubezpZycieSuma;
      /** */


      /**
       * 
       *    OPŁATY NA START
       * 
       */

      /**oblicz PROWIZJĘ*/
      element.prowizjaSuma = + (+this.mKwotaKredytu * (+element.prowizjaStawka / 100));
      /** Oblicz UBEZP. ŻYCIE NA START */
      element.ubezZycieNaStartSuma = +element.kwotaKredytuOferty * (+element.ubezZycieNaStart / 100);
      /** Olblicz UBEZP. PRACA NA START */
      element.upezpPracaNaStartSuma = +this.mKwotaKredytu * (+element.upezpPracaNaStart / 100);
      /**oblicz OPŁATY NA START -  SUMA*/
      element.kosztyPoczatkowe = +element.prowizjaSuma + +element.wycenaMieszkanie + +element.ubezZycieNaStartSuma + +element.upezpPracaNaStartSuma;
      /** */


      /**oblicz UBEZPIECZENIE POMOSTOWE  */
      if (element.pomostoweJakLiczone === "stawka") { //Jeśli ubezp. pomostowe jest płątne jako dodatkowa opłata ze swojąstawką

        // Oblicz ile jest płątne miesieczne ubezp. pomosotowe
        element.pomostoweSuma = (element.pomostoweStawkaMiesieczna / 100 / 12) * element.kwotaKredytuOferty;

        //Oblicz ile jest płątne za cały okres założony do kalkulacji
        element.pomostoweTOTAL = element.pomostoweSuma * +this.mPomostoweIleMiesiecy;


      } if (element.pomostoweJakLiczone === "doliczoneDoMarzy") { //Jeśli ubezpieczenie pomostowe jest płatne jako podwyżka do marży, to oblicz je jako różnicę miedzy ratą z oprocentowaniem powiększonym o element.pomostoweStawkaMiesieczna a zwykła ratą bez tego

        element.pomostoweSuma =
          //rata z element.pomostoweStawkaMiesieczna
          WzoryService.rata(element.kwotaKredytuOferty, element.WIBORstawka + element.marza + element.pomostoweStawkaMiesieczna, this.mLiczbaLat)
          //rata zwykła standardowa
          - WzoryService.rata(element.kwotaKredytuOferty, element.WIBORstawka + element.marza, this.mLiczbaLat)

        //Oblicz ile jest płątne za cały okres założony do kalkulacji
        element.pomostoweTOTAL = element.pomostoweSuma * +this.mPomostoweIleMiesiecy;
      }



      /***
       * 
       *    SUMA ODSETEK
       * 
       */


      //**Oblicz sumę ODSETEK RATY RÓWNE */
      if (element.oprocStale === "nie") { //jeśli oprocentowanie zmienne
        element.odsetkiSuma = WzoryService.odsetkiZaplaconeWcalymOkresie(+element.rata, +this.mLiczbaLat, element.kwotaKredytuOferty)

        //Jeśli Pekao z ofertą z % wyższym do czasu jak LTV jest > 0.8 bez CPI
        if (element.bank === "Pekao" && element.minLTV === 0.8 && element.maxLTV === 0.9) {
          var ileRazy = 0;
          var i = 0;
          for (i = 0; i <= this.mLiczbaLat * 12; i++) {
            var kwotaKredytu = element.kwotaKredytuOferty;
            var rata = element.rata;
            ileRazy++;
            var r = (element.marza + element.WIBORstawka) / 1200;
            var cz1 = (1 + r) ** i;
            var gora = ((1 + r) ** i) - 1;
            var goradol = gora / r;
            var zostaloDoSplaty = cz1 * +kwotaKredytu - goradol * +rata;
            suma = suma + zostaloDoSplaty;
            if (zostaloDoSplaty < (+this.mWartoscNieruchomosci * 0.8)) { break }
          }
          ileRazy = i;

          //policz sumę odsetek w okresie kiedy LTV jest > 80%
          let odsetkiZaplaconeAA = WzoryService.odsetkiZaplaconeNaKoniecNokresu(element.rata, ileRazy / 12, element.kwotaKredytuOferty, element.marza + element.WIBORstawka)

          //Oblicz ratę potem, czyli wg oprocentowania obowiązującego od momentu, kiedy LTV spadnie poniżej 80%
          let rataPotem2 = WzoryService.rata(element.kwotaKredytuOferty, element.WIBORstawka + element.oprocStaleMarzaPotem, this.mLiczbaLat)

          //Oblicz odsetki zapłacone w całym okresie wg raty potem
          let odsetkiZaplaconeBB = WzoryService.odsetkiZaplaconeWcalymOkresie(rataPotem2, this.mLiczbaLat, element.kwotaKredytuOferty)

          //Oblicz sumę odsetek płatnych na koniec okresu z początkowym oprocentowaniem, gdy LTV > 80%. ileRazy / 12 bo we wzorze jest mnożone * 12
          let odsetkiZaplaconeCC = WzoryService.odsetkiZaplaconeNaKoniecNokresu(rataPotem2, ileRazy / 12, element.kwotaKredytuOferty, element.oprocStaleMarzaPotem + element.WIBORstawka)

          //policz sumę odsetek: do odsetek płatnych w orkesie LTV >80% (odsetkiZaplaconeA) dodaj odsetki płątne w całym okresie (odsetkiZaplaconeB) pomniejszone o odsetki (odsetkiZaplaconeC), czyli, które nie będą przecież zapłacone, bo już sa zapłącone te w okresie LTV >80%.
          element.odsetkiSuma = odsetkiZaplaconeAA + (odsetkiZaplaconeBB - odsetkiZaplaconeCC);
        }

      } else { //jesli oprocentowanie stałe TAK

        //policz sumę odsetek w okresie ze stałą stopą
        let odsetkiZaplaconeA = WzoryService.odsetkiZaplaconeNaKoniecNokresu(element.rata, element.oprocStaleIleLat, element.kwotaKredytuOferty, element.marza)

        //Oblicz ratę potem, czyli wg oprocentowania w kolejnym okresie po oprocentowaniu zmiennym
        let rataPotem = WzoryService.rata(element.kwotaKredytuOferty, +element.WIBORstawka + +element.oprocStaleMarzaPotem, +this.mLiczbaLat)

        //Oblicz odsetki zapłacone w całym okresie wg raty potem
        // @@@@@@@@@@@@@@@@@@@@@ czy tu nie powinna byćponiżej element.kwotaKredytuOferty zamiast this.mKwotaKRedytu???????????????????????????????????
        let odsetkiZaplaconeB = WzoryService.odsetkiZaplaconeWcalymOkresie(rataPotem, this.mLiczbaLat, this.mKwotaKredytu)

        //Oblicz sumę odsetek płatnych na koniec okresu ze stałą stopą
        let odsetkiZaplaconeC = WzoryService.odsetkiZaplaconeNaKoniecNokresu(rataPotem, element.oprocStaleIleLat, element.kwotaKredytuOferty, element.oprocStaleMarzaPotem + element.WIBORstawka)

        //policz sumę odsetek: do odsetek płatnych w orkesie ze stałąstopą (odsetkiZaplaconeA) dodaj odsetki płątne w całym okresie (odsetkiZaplaconeB) pomniejszone o odsetki (odsetkiZaplaconeC), czyli, które nie będą przecież zapłacone, bo już sa zapłącone te w okresie ze stałą stopą.
        element.odsetkiSuma = odsetkiZaplaconeA + (odsetkiZaplaconeB - odsetkiZaplaconeC);
      }


      /** CAŁKOWITY KOSZT UBEZPIECZENIA OD SALDA KREDYTU MALEJACEGO CO ROKU */

      if (element.ubezpZycieIleLat === 999) { // jesi ubezpieczenie jest pobierane przez cały okres kredytu
        var liczbaLat = this.mLiczbaLat;
      } else {
        var liczbaLat = element.ubezpZycieIleLat - 1;
      }

      var suma = element.kwotaKredytuOferty;
      var skladkaCalkowita = 0;

      if (element.ubezpZycieIleLat > 1) { //licz tylko jeśli oferta zawiera ubezpieczenie na życie
        for (i = element.ubezpZycieOdKtoregoMiesiaca; i <= liczbaLat * 12; i = i + 12) {
          var kwotaKredytu = element.kwotaKredytuOferty;
          var rata = element.rata;
          var i: number;
          var r = (element.marza + element.WIBORstawka) / 1200;
          var cz1 = (1 + r) ** i;
          var gora = ((1 + r) ** i) - 1;
          var goradol = gora / r;
          var zostaloDoSplaty = cz1 * +kwotaKredytu - goradol * +rata;
          suma = suma + zostaloDoSplaty;
        }
        skladkaCalkowita = (suma / liczbaLat) * element.ubezpZycieStawkaMiesieczna * liczbaLat;
        /**Oblicz ubezpieczenie na zycie TOTAL przec cały okres kredytu */
        element.ubezpZycieTOTAL = skladkaCalkowita;
      }

      /** KOSZTY CAŁKOWITE */
      element.kosztyCalkowite = +element.prowizjaSuma + +element.wycenaMieszkanie + +element.ubezpZycieTOTAL + +element.ubezpNieruchTOTAL + +element.odsetkiSuma + +element.ubezZycieNaStartSuma + element.upezpPracaNaStartSuma + +element.pomostoweTOTAL;



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

      //FILTR: minLTV
      if (element.LTVobliczone > element.minLTV) {
        element.minLTVsave = "minLTVok";
        this.filteredValues['minLTVsave'] = "minLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        element.minLTVsave = "abc";
        this.filteredValues['minLTVsave'] = "minLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }


      //FILTR: maxLTV
      if (element.LTVobliczone <= element.maxLTV) {
        element.maxLTVsave = "maxLTVok";
        this.filteredValues['maxLTVsave'] = "maxLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);

      } else {
        element.maxLTVsave = "abc";
        this.filteredValues['maxLTVsave'] = "maxLTVok";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }


      //FILTR minimalnej kwoty kredytu
      if (element.kwotaKredytuOferty >= element.minKwotaKredytu) {
        element.minKwotaKredytuFILTR = "minKwotaKredytuOK";
        this.filteredValues['minKwotaKredytuFILTR'] = "minKwotaKredytuOK";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        element.minKwotaKredytuFILTR = "abc";
      }

      //FILTR maxymalnej kwoty kredytu
      if (element.kwotaKredytuOferty <= element.maxKwotaKredytu) {
        element.maxKwotaKredytuFILTR = "maxKWotaKredytuOK";
        this.filteredValues['maxKwotaKredytuFILTR'] = "maxKWotaKredytuOK";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        element.maxKwotaKredytuFILTR = "abc";
      }


      /** USTAL KWOTĘ WYMAGANYCH MINIMALNYCH WPŁYWÓW DLA OFERT, KTÓRE WYMAGAJĄ WPŁYWÓW MIN 2 X RATA
       * I OD RAZU USTAW DLA NICH FILTR NA PODSTAWIE MINIMALNYCH WPŁYWÓW, ŻEBY POTEM, JAK KTOŚ PRZELICZY ZNÓW
      * OFERTY, TO ŻEBY ZASTOSOWAĆ NOWY FILTR Z NOWYMI WARTOŚCIAMI
       */

      //Ustal kwotę wymaganych minimalnych wpływów dla ofert, które wymagają wpływów min 2 x rata
      if (element.minimalneWpływy2xRata === "tak") {
        element.minimalneWpływy = +element.rata * 2;
        //zastosuj filtr ten sam co dla wpływów
        if (+this.wDeklarowaneWplywy.value >= element.minimalneWpływy || this.wDeklarowaneWplywy === null) {
          element.minimalneWplywyStatus = "wplywyOK"
          this.filteredValues['minimalneWplywyStatus'] = "wplywyOK";
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        } else {
          element.minimalneWplywyStatus = "wplywyMalo"
        }
      }
    });


    //**pokaż snack bar */
    this._snackBar.open("Oferty zostały przeliczone", "zamknij", {
      duration: 2000,
    });

    //zamknij akordeon po obliczeniach
    this.xpandStatus = false;
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
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.bank + 1}`;
  }


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // konstruktor dla ERROR dla  formWartoscNieruchomosci
  get errorMessageformWartoscNieruchomosci(): string {
    const form: FormControl = (this.myGroup.get('formWartoscNieruchomosci') as FormControl);
    return form.hasError('required') ?
      'Pole wymagane' :
      form.hasError('min') ?
        'Minimum 60 000' :
        form.hasError('max') ?
          'Maksymalnie 2 000 000' : '';
  }


  // konstruktor dla ERROR dla  formKwotaKredytu
  get errorMessageformKwotaKredytu(): string {
    const form: FormControl = (this.myGroup.get('formKwotaKredytu') as FormControl);
    return form.hasError('required') ?
      'Pole wymagane' :
      form.hasError('min') ?
        'Minimum 50 000' :
        form.hasError('max') ?
          'Maksymalnie 2 000 000' : '';
  }


  // konstruktor dla ERROR dla  formKwotaKredytu
  get errorMessageformLiczbaLat(): string {
    const form: FormControl = (this.myGroup.get('formLiczbaLat') as FormControl);
    return form.hasError('required') ?
      'Pole wymagane' :
      form.hasError('min') ?
        'Minimum 5' :
        form.hasError('max') ?
          'Maksymalnie 35' : '';
  }


  ngOnInit() {


    // Działa ale wyłączone bo powoduje błąd w wersji testowej

    // pobierz oferty z Service: http-oferty-service
    //  this._http.pobierzOferty().subscribe(data => {
    //    this.ofertyPobrane = data;
    //    console.log(this.ofertyPobrane);
    //  })

    this.xpandStatus = true;

    //DO VALIDACJI DANCH FORMULARZA
    this.myGroup = new FormGroup({
      formWartoscNieruchomosci: new FormControl("", [Validators.max(2000000), Validators.min(60000)]),
      formKwotaKredytu: new FormControl("", [Validators.max(2000000), Validators.min(50000)]),
      formLiczbaLat: new FormControl("", [Validators.max(35), Validators.min(5)]),
      formPomostoweIleMiesiecy: new FormControl("", [Validators.max(48), Validators.min(0)]),
      formWIBOR3M: new FormControl("", [Validators.max(10), Validators.min(-10)]),
      formWIBOR6M: new FormControl("", [Validators.max(10), Validators.min(-10)]),

    });


    ELEMENT_DATA.forEach((element) => {
      //Pokaż ładnie datę dostępu dd.mm.rrrr zamiast rrrr, mm, dd
      element.dataDostepu = this.zamienNaDate(element.odKiedyObowiazuje);
      //Pokaż ładnie datę obowiązawania dd.mm.rrrr zamiast rrrr, mm, dd
      if (element.doKiedyObowiazuje === "do odwołania") {
        element.doKiedyObowiazujeWyswietl = "do odwołania"
      } else {
        element.doKiedyObowiazujeWyswietl = this.zamienNaDate(element.doKiedyObowiazuje);
      }
    });


    // Domyslnie sortuj po kosztach całkowitych podczas uruchomienia 
    this.sort.sort(({ id: 'kosztyCalkowite', start: 'asc' }) as MatSortable);
    this.dataSource.sort = this.sort;

    //CUSTOMOWY FILTR
    this.dataSource.filterPredicate = this.customFilterPredicate();

  }

  customFilterPredicate() {
    const myFilterPredicate = (data: PeriodicElement, filter: string): boolean => {
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

        ;
    }
    return myFilterPredicate;
  }


  ngAfterViewInit() {

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
      ELEMENT_DATA.forEach((element) => {
        if (wDeklarowaneWplywyFilterValue >= element.minimalneWpływy || wDeklarowaneWplywyFilterValue === null) {
          element.minimalneWplywyStatus = "wplywyOK"
          this.filteredValues['minimalneWplywyStatus'] = "wplywyOK";
          this.dataSource.filter = JSON.stringify(this.filteredValues);
        } else {
          element.minimalneWplywyStatus = "wplywyMalo"
        }
      })
    });

    //Dzisiajsza data dla OD-kiedyobowiazuje
    var todayDate = new Date();

    ELEMENT_DATA.forEach((element) => {
      var mElementOdKiedyObowiazuje = new Date(element.odKiedyObowiazuje)
      if (mElementOdKiedyObowiazuje < todayDate) {
        element.odKiedyObowiazuje = "już"
      }


      //Dzisiajsza data dla DO-kiedyobowiazuje
      var mElementDoKiedyObowiazuje = new Date(element.doKiedyObowiazuje)
      if (element.doKiedyObowiazuje === "do odwołania")
        element.doKiedyObowiazujeStatus = "aktualne"
      if (mElementDoKiedyObowiazuje >= todayDate) {
        element.doKiedyObowiazujeStatus = "aktualne"
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

  }


  /** Tutaj logika zaznacz jaki rodzaj rat  */
  RodzajeRat: RodzajRat[] = [
    { value: '0', viewValue: 'Równe' },
    { value: '1', viewValue: 'Malejące' },
  ];

  /** Tutaj logika zaznacz jaki rodzaj nieruchomosci */
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






}



