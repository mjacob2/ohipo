import { Injectable } from '@angular/core';
import { Offer } from 'src/app/offer';

@Injectable({
  providedIn: 'root'
})
export class calculationFormulas {

  static calculateCreditAmount(propertyValue, ownContribution) {
    var creditAmount = propertyValue - ownContribution;
    return creditAmount;
  }

  static calculateCreditAmountWithAddictionalCosts(creditAmount, costsAlwaysInCredit) {
    var creditAmountWithAdditionalCosts = +creditAmount + (+creditAmount * (costsAlwaysInCredit / 100));
    return creditAmountWithAdditionalCosts;
  }

  static calculateGeneralLTV(creditAmount: number, propertyValue: number) {
    var generalLTV = +creditAmount / +propertyValue;
    return generalLTV;
  }

  static calculateOfferLTV(creditAmountofOffer, propertyValue) {
    var offerLTV = creditAmountofOffer / +propertyValue;
    return offerLTV;
  }

  static assignCurrentWIBORtoOffers(offerWibor: string, currentWibor3M: number, currentWibor6M: number) {
    if (offerWibor === "3M") {
      return currentWibor3M;
    }
    if (offerWibor === "6M") {
      return currentWibor6M;
    }
  }

  static calculateFirstEqualInstallment(isOfferFixedRate, creditAmountOfOffer, offerWibor, offerMargin, creditLengthInYears) {
    if (isOfferFixedRate === "nie") {
      return calculationFormulas.rata(creditAmountOfOffer, offerWibor + offerMargin, creditLengthInYears);
    } else {
      return calculationFormulas.rata(creditAmountOfOffer, offerMargin, creditLengthInYears);
    }
  }

  static CalculateApartmentInsuranceMonthly(appartmentInsuranceCalculatedFrom, appartmentInsuranceRatePerYear: number, propertyValue, creditAmount) {
    if (appartmentInsuranceCalculatedFrom === "wartNieruchomosci") {
      return (appartmentInsuranceRatePerYear / 100 / 12) * +propertyValue;
    }
    else {
      return (+appartmentInsuranceRatePerYear / 100 / 12) * creditAmount;
    }
  }

  static calculateTotalAppartmentInsurance(appartmentInsuranceCalculatedFrom: string, apartmentInsuranceMonthly: number, creditLengthInYears: number) {
    if (appartmentInsuranceCalculatedFrom === "wartNieruchomosci") {
      return apartmentInsuranceMonthly * +creditLengthInYears * 12;
    }
    else {
      return +apartmentInsuranceMonthly * +creditLengthInYears * 12;
    }
  }

  static calculateLifeInsuranceMonthly(lifeInsuranceMonthlyRate, creditAmountOfOffer) {
    return (lifeInsuranceMonthlyRate / 100) * creditAmountOfOffer;
  }
  /**Tutaj jest formuła do liczenia raty MALEJĄCEJ PIERWSZEJ 
  element.rata = "" + ((element.kwotaKredytuOferty / (+this.mLiczbaLat*12)) + (element.kwotaKredytuOferty * (((+element.WIBOR + +element.marza)/100)/12))) 
  */
  static costsMonthly(offer: Offer): number {
    return offer.ubezpNieruchSuma + offer.ubezpZycieSuma;
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

  static rata(kwotaKredytu: number, r: number, liczbaLat: number) {
    r = r / 1200
    return (r / (1 - (1 + r) ** (-1 * (liczbaLat * 12)))) * kwotaKredytu
  }



  constructor() { }


  //Weź dzisiejszą datę dla DO-kiedyobowiazuje
  //   var d = new Date();
  //   var curr_date = d.getDate();
  //    var curr_month = d.getMonth();
  //    var curr_year = d.getFullYear()
  //    var months = new Array("01", "02", "03",
  //     "04", "05", "06", "07", "08", "09",
  //     "10", "11", "12");




  // Pokaż element data od kiedy obowiązuje w polu Data Dostepu
  //   var d = mElementOdKiedyObowiazuje;
  //   var curr_date = d.getDate();
  //   var curr_month = d.getMonth();
  //   var curr_year = d.getFullYear()
  //   var months = new Array("01", "02", "03",
  //     "04", "05", "06", "07", "08", "09",
  //     "10", "11", "12");
  //   var mDataDostepu = curr_date + "." + months[curr_month] + "." + curr_year


  /** To jest filtr wyszukiwania - narazie z niego REZYGNACJA 
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      
    }   
      
    applyFilter2(column: string, filterValue: string) {
      this.filterValues[column] = filterValue;
      this.dataSource.filter = JSON.stringify(this.filterValues);
    }    
    */











}





