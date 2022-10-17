import { Injectable } from '@angular/core';
import { Offer } from 'src/app/offer';

@Injectable({
  providedIn: 'root'
})
export class Calculate {

  static CreditAmount(propertyValue, ownContribution) {
    return propertyValue - ownContribution;
  }

  static CreditAmountWithAddictionalCosts(creditAmount, costsAlwaysInCredit) {
    return +creditAmount + (creditAmount * (costsAlwaysInCredit / 100));
  }

  static GeneralLTV(creditAmount: number, propertyValue: number) {
    return creditAmount / propertyValue;
  }

  static OfferLTV(creditAmountofOffer, propertyValue) {
    return creditAmountofOffer / propertyValue;
  }

  static AssignCurrentWIBORtoOffers(offerWibor: string, currentWibor3M: number, currentWibor6M: number) {
    if (offerWibor === "3M") {
      return currentWibor3M;
    }
    if (offerWibor === "6M") {
      return currentWibor6M;
    }
  }

  static FirstEqualInstallment(isOfferFixedRate, creditAmountOfOffer, offerWibor, offerMargin, creditLengthInYears) {
    if (isOfferFixedRate === "nie") {
      return Calculate.rata(creditAmountOfOffer, offerWibor + offerMargin, creditLengthInYears);
    } else {
      return Calculate.rata(creditAmountOfOffer, offerMargin, creditLengthInYears);
    }
  }

  static ApartmentInsuranceMonthly(apartmentInsuranceCalculatedFrom, apartmentInsuranceRatePerYear: number, propertyValue, creditAmount) {
    if (apartmentInsuranceCalculatedFrom === "wartNieruchomosci") {
      return (apartmentInsuranceRatePerYear / 100 / 12) * +propertyValue;
    }
    else {
      return (+apartmentInsuranceRatePerYear / 100 / 12) * creditAmount;
    }
  }

  static TotalAppartmentInsurance(apartmentInsuranceCalculatedFrom: string, apartmentInsuranceMonthly: number, creditLengthInYears: number) {
    if (apartmentInsuranceCalculatedFrom === "wartNieruchomosci") {
      return apartmentInsuranceMonthly * +creditLengthInYears * 12;
    }
    else {
      return +apartmentInsuranceMonthly * +creditLengthInYears * 12;
    }
  }

  static LifeInsuranceMonthly(lifeInsuranceMonthlyRate, creditAmountOfOffer) {
    return (lifeInsuranceMonthlyRate / 100) * creditAmountOfOffer;
  }
  /**Tutaj jest formuła do liczenia raty MALEJĄCEJ PIERWSZEJ 
  element.rata = "" + ((element.kwotaKredytuOferty / (+this.mLiczbaLat*12)) + (element.kwotaKredytuOferty * (((+element.WIBOR + +element.marza)/100)/12))) 
  */
  static CostsMonthly(apartmentInsuranceMonthly, lifeInsuranceMonthly): number {
    return apartmentInsuranceMonthly + lifeInsuranceMonthly;
  }

  static CostUpFront(loanValue, costUpFrontRate): number {
    return loanValue * (costUpFrontRate / 100);
  }

  static Sum(argumentsToAdd: string | any[]) {
    var sum = 0;
    for (var i = 0; i < argumentsToAdd.length; i++) {
      sum += argumentsToAdd[i];
    }
    return sum;
  }


  /** odsetki zapłacone w całym okresie
 * 
 * I = cN - P 
 * 
 * I = suma odsetek
 * c = rata
 * N = liczba rat
 * P = kwota kredytu
 */
  static odsetkiZaplaconeWcalymOkresie(rata: number, liczbaLat: number, kwotaKredytu: number) {
    return (rata * (liczbaLat * 12)) - kwotaKredytu
  }




  /** odsetki płatne na koniec N okresu
   * 
   *          ((1 + r)^N - 1)
   * (Pr - c) _____________  + cN
   *                r
   * 
   * P = kwota kredytu
   * r = oprocentowanie
   * c = rata
   * N = liczba rat
   * 
   * */

  static odsetkiZaplaconeNaKoniecNokresu(rata: number, liczbaLat: number, kwotaKredytu: number, r: number) {
    r = r / 1200
    return (((kwotaKredytu * r - rata) * ((((1 + r) ** (liczbaLat * 12)) - 1) / r)) + (rata * liczbaLat * 12))

  }


  // let rataPotem = (element.kwotaKredytuOferty * ((1 + (((+element.WIBORstawka + +element.oprocStaleMarzaPotem) / 100) / 12)) ** (+this.mLiczbaLat * 12)) * ((1 + (((+element.WIBORstawka + +element.oprocStaleMarzaPotem) / 100) / 12)) - 1) / ((1 + (((+element.WIBORstawka + +element.oprocStaleMarzaPotem) / 100) / 12)) ** (+this.mLiczbaLat * 12) - 1));


  /** RATA STAŁA
   * 
   * c = (r / (1 - (1 + r) ^-N)) P
   * 
   * P = kwota kredytu
   * r = oprocentowanie
   * N - liczba rat
   */

  public static rata(kwotaKredytu: number, r: number, liczbaLat: number) {
    r = r / 1200
    return (r / (1 - (1 + r) ** (-1 * (liczbaLat * 12)))) * kwotaKredytu
  }

  static sumOfInterest(oprocStale, rata, creditLengthInYears, kwotaKredytuOferty, marza, propertyValue, wiborStawka, oprocStaleMarzaPotem, oprocStaleIleLat) {
    //**Oblicz sumę ODSETEK RATY RÓWNE */
    if (oprocStale === "nie")
      return Calculate.odsetkiZaplaconeWcalymOkresie(rata, creditLengthInYears, kwotaKredytuOferty)

    //Jeśli Pekao z ofertą z % wyższym do czasu jak LTV jest > 0.8 bez CPI
    if (oprocStale === "jakPEKAO") {
      var ileRazy = 0;
      var i = 0;
      for (i = 0; i <= creditLengthInYears * 12; i++) {
        var kwotaKredytu = kwotaKredytuOferty;
        ileRazy++;
        var r = (marza + wiborStawka) / 1200;
        var cz1 = (1 + r) ** i;
        var gora = ((1 + r) ** i) - 1;
        var goradol = gora / r;
        var zostaloDoSplaty = cz1 * +kwotaKredytu - goradol * +rata;
        var suma = suma + zostaloDoSplaty;
        if (zostaloDoSplaty < (propertyValue * 0.8)) { break }

      }
      ileRazy = i;
      //policz sumę odsetek w okresie kiedy LTV jest > 80%
      let odsetkiZaplaconeAA = Calculate.odsetkiZaplaconeNaKoniecNokresu(rata, ileRazy / 12, kwotaKredytuOferty, marza + wiborStawka)
      //Oblicz ratę potem, czyli wg oprocentowania obowiązującego od momentu, kiedy LTV spadnie poniżej 80%
      let rataPotem2 = Calculate.rata(kwotaKredytuOferty, wiborStawka + oprocStaleMarzaPotem, creditLengthInYears)

      //Oblicz odsetki zapłacone w całym okresie wg raty potem
      let odsetkiZaplaconeBB = Calculate.odsetkiZaplaconeWcalymOkresie(rataPotem2, creditLengthInYears, kwotaKredytuOferty)

      //Oblicz sumę odsetek płatnych na koniec okresu z początkowym oprocentowaniem, gdy LTV > 80%. ileRazy / 12 bo we wzorze jest mnożone * 12
      let odsetkiZaplaconeCC = Calculate.odsetkiZaplaconeNaKoniecNokresu(rataPotem2, ileRazy / 12, kwotaKredytuOferty, oprocStaleMarzaPotem + wiborStawka)

      //policz sumę odsetek: do odsetek płatnych w orkesie LTV >80% (odsetkiZaplaconeA) dodaj odsetki płątne w całym okresie (odsetkiZaplaconeB) pomniejszone o odsetki (odsetkiZaplaconeC), czyli, które nie będą przecież zapłacone, bo już sa zapłącone te w okresie LTV >80%.
      return odsetkiZaplaconeAA + (odsetkiZaplaconeBB - odsetkiZaplaconeCC);
    }

    if (oprocStale === "tak") { //jesli oprocentowanie stałe TAK

      //policz sumę odsetek w okresie ze stałą stopą
      let odsetkiZaplaconeA = Calculate.odsetkiZaplaconeNaKoniecNokresu(rata, oprocStaleIleLat, kwotaKredytuOferty, marza)

      //Oblicz ratę potem, czyli wg oprocentowania w kolejnym okresie po oprocentowaniu zmiennym
      let rataPotem = Calculate.rata(kwotaKredytuOferty, wiborStawka + oprocStaleMarzaPotem, creditLengthInYears)

      //Oblicz odsetki zapłacone w całym okresie wg raty potem
      // @@@@@@@@@@@@@@@@@@@@@ czy tu nie powinna byćponiżej element.kwotaKredytuOferty zamiast this.mKwotaKRedytu???????????????????????????????????
      let odsetkiZaplaconeB = Calculate.odsetkiZaplaconeWcalymOkresie(rataPotem, creditLengthInYears, kwotaKredytuOferty)

      //Oblicz sumę odsetek płatnych na koniec okresu ze stałą stopą
      let odsetkiZaplaconeC = Calculate.odsetkiZaplaconeNaKoniecNokresu(rataPotem, oprocStaleIleLat, kwotaKredytuOferty, oprocStaleMarzaPotem + wiborStawka)

      //policz sumę odsetek: do odsetek płatnych w orkesie ze stałąstopą (odsetkiZaplaconeA) dodaj odsetki płątne w całym okresie (odsetkiZaplaconeB) pomniejszone o odsetki (odsetkiZaplaconeC), czyli, które nie będą przecież zapłacone, bo już sa zapłącone te w okresie ze stałą stopą.
      return odsetkiZaplaconeA + (odsetkiZaplaconeB - odsetkiZaplaconeC);
    }


  }


  static totalCostOfLifeInsurance(ubezpZycieIleLat, creditLengthInYears, kwotaKredytuOferty, ubezpZycieOdKtoregoMiesiaca, rata, marza, WIBORstawka, ubezpZycieStawkaMiesieczna) {
    /** CAŁKOWITY KOSZT UBEZPIECZENIA OD SALDA KREDYTU MALEJACEGO CO ROKU */

    if (ubezpZycieIleLat === 999) { // jesi ubezpieczenie jest pobierane przez cały okres kredytu
      var liczbaLat = creditLengthInYears;
    } else {
      liczbaLat = ubezpZycieIleLat - 1;
    }

    var suma = kwotaKredytuOferty;
    var skladkaCalkowita = 0;

    if (ubezpZycieIleLat > 1) { //licz tylko jeśli oferta zawiera ubezpieczenie na życie
      for (i = ubezpZycieOdKtoregoMiesiaca; i <= liczbaLat * 12; i = i + 12) {
        var kwotaKredytu = kwotaKredytuOferty;
        var rata2 = rata;
        var i: number;
        var r = (marza + WIBORstawka) / 1200;
        var cz1 = (1 + r) ** i;
        var gora = ((1 + r) ** i) - 1;
        var goradol = gora / r;
        var zostaloDoSplaty = cz1 * +kwotaKredytu - goradol * +rata2;
        suma = suma + zostaloDoSplaty;
      }
      skladkaCalkowita = (suma / liczbaLat) * (ubezpZycieStawkaMiesieczna / 100 * 12) * liczbaLat;
    }
    return skladkaCalkowita;
  }









}





