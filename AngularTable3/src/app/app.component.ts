import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortable } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import oferty from '../assets/oferty.json';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';


import { CurrencyPipe } from '@angular/common';

//Importuj Services
//import { HttpOfertyService } from './services/http/http-oferty.service';
import { WzoryService } from './services/wzory/wzory.service';
//import { InputErrorsService } from './services/inputErrors/input-errors.service'
import { MatSliderChange } from '@angular/material/slider';
import { MatSelectChange } from '@angular/material/select';


//import { SnackBarService } from './services/snack-bar.service';

//import oferty2 from '../assets/oferty2.json';

//Kolumny w pliku Excel


/** Tutaj logika zaznacz jaki rodzaj rat Cię interesuje */
interface RodzajRat {
  value: string;
  viewValue: string;
}

/** Tutaj logika zaznacz w któym banku konto */
interface KontoJakiBank {
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
  kosztyPoczatkowe: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  marza: number;
  rata: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  pomostoweStawkaMiesieczna: number;
  pomostoweSuma: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  ubezpNieruchStawkaRok: number;
  ubezpNieruchSuma: number;//w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  ubezpNieruchTOTAL: number;//w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  ubezpZycieStawkaMiesieczna: number;
  ubezpZycieSuma: number;
  wTrakcieBudowy: string;
  WIBOR: string;
  WIBORstawka: number;
  prowizjaStawka: number;
  prowizjaSuma: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  warunkiOferty: string;
  wycenaMieszkanie: number;
  oplatyMiesieczne: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  odsetkiSuma: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  ubezpZycieTOTAL: number;
  kosztyCalkowite: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  maxLTV: number;
  minLTV: number;
  ubezpZycieIleLat: number;
  ubezpNieruchOdCzegoLicz: string;
  pomostoweJakLiczone: string;
  oprocStale: string;
  oprocStaleIleLat: number;
  oprocStaleMarzaPotem: number;
  doKiedyObowiazuje: any;
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
  pomostoweTOTAL: number; //w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  doKiedyObowiazujeStatus: string;
  minimalneWpływy: number;
  minimalneWplywyStatus: string;
  minimalneWpływy2xRata: string;
  logoURL: string;
  oplatyZawszeKredytowane: number;
  kwotaKredytuOferty: number;//w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  LTVobliczone: number;//w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
  maxLiczbaLat: number;
  maxWiek: number;
  maxWiekStatus: string;
  alternatywnyOpisOferty: string;//w pliku Excel nie ma tej kolumny, jest tworzona podczas przelicz()
}

//co się składa na ELEMENT DATA
const ELEMENT_DATA: PeriodicElement[] = oferty




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

  //to jest odniesienie do przykrywki, która przykrywa całątabelę na starcie.
  @ViewChild('przykrywkaPoczatkowa') private przykrywkaPoczatkowaElement: ElementRef;

  // array dla listy wybranych po kolei banków, niech tam ma już 2 x 0, żeby jak będę patrzył na przedostatnio wybrany, żeby już było na co patrzeć
  numbers = new Array(0, 0);


  //dodaj do slidera % na końcu łezki (label) do
  formatLabel(value: number) {
    return value + '%';
  }

  //dla responsywnego sideNMavigacji
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  ofertyPobrane: Object; //varable dla pobieranych ofert z sieci

  constructor(
    changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
    private _snackBar: MatSnackBar,
    //kontruktor dla Service pobierania ofert './services/http-oferty.service'
    //private _http: HttpOfertyService,

    //konstruktor żeby wyświetlić error dla min. wkład włąsny w postaci 50 000 zł zamiast 50000
    //private currencyPipe: CurrencyPipe,

    //kontruktor dla dialogu kontaktowego
    public dialogBlad: MatDialog,
    public dialogKontakt: MatDialog,



  ) { // tu rzeczy dla side Barów
    this.mobileQuery = media.matchMedia('(max-width: 1700px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
  }
  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }


  dataSource = new MatTableDataSource(ELEMENT_DATA);

  selection = new SelectionModel<PeriodicElement>(true, []);
  expandedElement: PeriodicElement | null;

  //Grupa dla Formularza sprawdzania walidacji danych
  myGroup: FormGroup;







  //ustal wartość nieruchomosći zmienianą za każdym razem, gdy zmienia się input wartość nieruchomości
  ngWartoscNieruchomosci = 300000

  // Utwórz zmienną dla kwoty deklarowanych wpływów
  mWartoscNieruchomosci = +this.ngWartoscNieruchomosci;

  //wpisz w formularzu od razu liczbę lat
  ngLiczbaLat = 25
  // ustal początkowy wkłąd własny procentowo

  sliderValue = 10
  wkladWlasnyNowy = (this.sliderValue / 100) * this.ngWartoscNieruchomosci


  //weź aktualną wartość nieruchomości za każdym razem, gdy zmieni się input wartość nieruchomości
  ngWartoscNieruchomosciZmiana(wartosc: number) {
    this.ngWartoscNieruchomosci = wartosc;
    this.wkladWlasnyNowy = (this.sliderValue / 100) * this.ngWartoscNieruchomosci
  }

  //weż value ze slidera
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
  mWybranyBank: number = 0

  mpokazOpcjeZaawansowane: boolean;

  //Ustal domyślne wartości dla stawek WIBOR i czasu pomostowego
  mWIBOR3M: number = 0.27;
  mWIBOR6M: number = 0.29;
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




  //wyświetlane kolumny   narazie ukrywamy 'select', po szczegółach
  displayedColumns: string[] = ['szczegoly', 'bank', 'ofertaNazwa', 'kosztyCalkowite', 'kosztyPoczatkowe', 'rata', 'oplatyMiesieczne', 'marza', 'pomostoweSuma'];

  //po tych kolumnach mogą być filtrowane oferty
  filteredValues = {
    minimalneWplywyStatus: '', bank: '', maxLiczbaLat: '', maxWiekStatus: '', ofertaNazwa: '', minKwotaKredytuFILTR: '', maxKwotaKredytuFILTR: '', wTrakcieBudowy: '', maxLTVsave: '', minLTVsave: '', doKiedyObowiazujeStatus: '', odKiedyObowiazuje: '', wWielkimMiescieFilterKolumna: ''
  };





  //**konstruktor dla SnackBar */
  //constructor(private _snackBar: MatSnackBar) { }



  /** to funkcja zaszyta w przycisku PRZELICZ */
  przelicz() {


    console.log(this.mWybranyBank);
    this.numbers.push(this.mWybranyBank);//stwórz Array dla kolejno wybranych banków z listy wyboru: jaki bank masz od 6 miesiect
    console.log("lista banków: " + this.numbers);
    var przedostatniWybrany = this.numbers[this.numbers.length - 2]//zwróć przedostatnio wybrany bank
    console.log("teraz wybrany: " + this.mWybranyBank);
    console.log("przedostani wybrany: " + przedostatniWybrany);



    this.mKwotaKredytu = this.mWartoscNieruchomosci - this.wkladWlasnyNowy;


    //Licz wszystko to co jest potrzebne dla każdej z ofert z osobna
    ELEMENT_DATA.forEach((element) => {

      /* ZNIŻKA MARŻY DLA PKO BP Z TYTUŁU POSIADANIA KONTA OD 6 MIESIECY**/

      if (this.mWybranyBank == 1 && przedostatniWybrany != 1) {//jesli teraz wybrany PKO BP a wczesniej inny
        // obniż marżę
        if (element.bank == "PKO BP" && element.oprocStale == "tak") {//jeśli PKO BP z oprocentowaniem stałym
          element.oprocStaleMarzaPotem = element.oprocStaleMarzaPotem - 0.05 //obniż marżę po oprocentowaniu stałym o 0.05%
          element.alternatywnyOpisOferty = " + konto od 6 mcy" // i dodaj alternatywny opis oferty
        }
      }
      if (this.mWybranyBank != 1 && przedostatniWybrany == 1) {// jeśli teraz inny a wcześniej PKO BP
        //podwyż marżę
        if (element.bank == "PKO BP" && element.oprocStale == "tak") { //jeśli PKO BP z oprocentowaniem stałym
          element.oprocStaleMarzaPotem = element.oprocStaleMarzaPotem + 0.05 //podwyższ marżę po oprocentowaniu stałym o 0.05%
          element.alternatywnyOpisOferty = "" // i usuń alternatywny opis oferty

        }
      }


      /* zniżka prowizji dla SANTADERA **/

      //ustal prowizję dla Santandera, w oparciu o to, czy zaznaczono, że posiada się w nim konto od 6 miesiecy w opcjach zaawansowanych
      if (+this.mWybranyBank == 2 && element.bank == "Santander" && element.oprocStale == "nie") {
        element.prowizjaStawka = 1 //obniż prowizje o 2 pp dla ofert ze zmiennym oprocentowanie, czyli 1%
        element.alternatywnyOpisOferty = " + konto od 6 mcy" // i dodaj alternatywny opis oferty
      }
      if (+this.mWybranyBank == 2 && element.bank == "Santander" && element.oprocStale == "tak") {
        element.prowizjaStawka = 2 // dla oferty ze stałym oprocentowaniem obniż prowizję o 0.5 pp, czyli 2%
        element.alternatywnyOpisOferty = " + konto od 6 mcy" // i dodaj alternatywny opis oferty
      }
      // Jeśli ktoś potem zmieni, ze jednak nie ma konta w Santander, to podwyższ z powrotem prowziję
      if (+this.mWybranyBank != 2 && element.bank == "Santander" && element.oprocStale == "nie") {
        element.prowizjaStawka = 3 //zastosuj prowizję standardową
        element.alternatywnyOpisOferty = "" // i usuń alternatywny opis oferty
      }
      if (+this.mWybranyBank != 2 && element.bank == "Santander" && element.oprocStale == "tak") {
        element.prowizjaStawka = 2.5 //zastosuj prowizję standardową
        element.alternatywnyOpisOferty = "" // i usuń alternatywny opis oferty
      }







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

      //FILTR: maxLiczbaLat
      if (this.mLiczbaLat > 30) {
        this.filteredValues['maxLiczbaLat'] = "35";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      } else {
        element.minLTVsave = "abc";
        this.filteredValues['maxLiczbaLat'] = "";
        this.dataSource.filter = JSON.stringify(this.filteredValues);
      }






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


      /**Tutaj jak klikniesz przelicz sprawdź, ile jest wpisanych lat dla filtra WiekNajstarszegoKredytobiorcy i dodaj zmienioną liczbę lat kredytu (okres trwania).
      Musi to tu byc, bo inaczej, jak wpiszesz filtr wieknajstarszego i potem zminisz liczbę lat kredytu, to się filtr nie zaktualizuje */

      ELEMENT_DATA.forEach((element) => {
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
  checkboxLabel(row?: PeriodicElement): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.bank + 1}`;
  }


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @ViewChild('wiekNajstarszegoInput') wiekNajstarszegoInput: ElementRef;

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


  ngOnInit() {



    //stwórz form Bilder
    this.zbudujFormularz();

    //sprawdć, czy nie zmieniła się wartość nieruchomoci i jeśli tak, to wymagaj minimum 10% wartości nieruchomości w polu wkład własny
    //  this.zaktualizujValidary();


    // Działa ale wyłączone bo powoduje błąd w wersji testowej

    // pobierz oferty z Service: http-oferty-service
    //  this._http.pobierzOferty().subscribe(data => {
    //    this.ofertyPobrane = data;
    //    console.log(this.ofertyPobrane);
    //  })


    // Domyslnie sortuj po kosztach całkowitych podczas uruchomienia 
    this.sort.sort(({ id: 'kosztyCalkowite', start: 'asc' }) as MatSortable);
    this.dataSource.sort = this.sort;

    //CUSTOMOWY FILTR
    this.dataSource.filterPredicate = this.customFilterPredicate();

  }

  zbudujFormularz() {
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


  // zaktualizujValidary() {
  //   const formWkladWlasnyControl = this.myGroup.get('formWkladWlasny');

  //   this.myGroup.get('formWartoscNieruchomosci').valueChanges
  //     .subscribe(formWartoscNieruchomosci => {
  //      formWkladWlasnyControl.setValidators([Validators.required, Validators.min(this.mWartoscNieruchomosci * 0.1)]);
  //      formWkladWlasnyControl.updateValueAndValidity();

  //    });
  //  }




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
        &&
        data.maxLiczbaLat.toString().trim().toLowerCase().indexOf(searchString.maxLiczbaLat.toLowerCase()) !== -1
        &&
        data.maxWiekStatus.toString().trim().toLowerCase().indexOf(searchString.maxWiekStatus.toLowerCase()) !== -1

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

    //FILTR: Wiek najstarszego kredytobiorcy
    this.wWiekNajstarszego.valueChanges.subscribe((wWiekNajstarszegoFilterValue) => {
      ELEMENT_DATA.forEach((element) => {
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



    ELEMENT_DATA.forEach((element) => {
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
        //element.doKiedyObowiazuje = mElementDoKiedyObowiazuje
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

  /** Tutaj logika zaznacz wjakim banku konto od 6 miesięcy */
  KontoJakieBanki: KontoJakiBank[] = [
    { value: '0', viewValue: 'Inny' },
    { value: '1', viewValue: 'PKO BP' },
    { value: '2', viewValue: 'Santander' },
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





  openDialogKontakt() {
    const dialogRef = this.dialogKontakt.open(DialogKontakt, {
      backdropClass: 'backdropBackground' // ta klasa będzie przypisana do zaciemnienia tła kiedy Dialog jest otwarty
    });

    //funkcja odpalana kiedy zamykam dialog
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Rezultat dialogu: ${result}`);
    });
  }

  openDialogBlad() {
    const dialogRef = this.dialogBlad.open(DialogBlad, {
      backdropClass: 'backdropBackground' // ta klasa będzie przypisana do zaciemnienia tła kiedy Dialog jest otwarty
    });

    //funkcja odpalana kiedy zamykam dialog
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Rezultat dialogu błąd: ${result}`);
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
