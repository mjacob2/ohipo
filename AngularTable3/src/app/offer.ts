import { Calculate } from "./services/wzory/wzory.service";
import { UserInput } from "./user-input";

export class Offer {
  id: number;
  bank: string;
  ofertaNazwa: string;
  ofertaNazwaDopisek: string;
  marza: number;
  pomostoweStawkaMiesieczna: number;
  ubezpNieruchStawkaRok: number;
  ubezpZycieStawkaMiesieczna: number;
  ubezpZycieSuma: number;
  wTrakcieBudowy: string;
  WIBOR: string;
  WIBORstawka: number;
  prowizjaStawka: number;
  warunkiOferty: string;
  wycenaMieszkanie: number;
  ubezpZycieTOTAL: number;
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
  //maxLTVsave: string;
  //minLTVsave: string;
  ubezZycieNaStart: number;
  ubezZycieNaStartSuma: number;
  ubezpZycieOdKtoregoMiesiaca: number;
  upezpPracaNaStart: number;
  upezpPracaNaStartSuma: number;
  minKwotaKredytu: number;
  //minKwotaKredytuFILTR: string;
  maxKwotaKredytu: number;
  //maxKwotaKredytuFILTR: string;
  //doKiedyObowiazujeStatus: string;
  minimalneWpływy: number;
  minimalneWplywyStatus: string;
  minimalneWpływy2xRata: string;
  oplatyZawszeKredytowane: number;
  maxLiczbaLat: number;
  maxWiek: number;
  maxWiekStatus: string;
  alternatywnyOpisOferty: string;
  kosztyPoczatkowe: number;
  kwotaKredytuOferty: number;
  LTVobliczone: number;
  pomostoweTOTAL: number;
  kosztyCalkowite: number;
  oplatyMiesieczne: number;
  odsetkiSuma: number;
  ubezpNieruchSuma: number;
  ubezpNieruchTOTAL: number;
  prowizjaSuma: number;
  pomostoweSuma: number;
  rata: number;
  links = new Map([
    ["Millennium", "https://middlers.pl/ohipo/zdjecia/millennium_logo.png"],
    ["ING", "https://middlers.pl/ohipo/zdjecia/ING_logo.png"],
    ["BNP Paribas", "https://middlers.pl/ohipo/zdjecia/BNP_Paribas_logo.png"],
    ["Alior bank", "https://middlers.pl/ohipo/zdjecia/Alior_logo.png"],
    ["Citi", "https://middlers.pl/ohipo/zdjecia/City_logo.png"],
    ["PKO BP", "https://middlers.pl/ohipo/zdjecia/PKO_logo.png"],
    ["Pekao", "https://middlers.pl/ohipo/zdjecia/Pekao_logo.png"],
    ["Santander", "https://middlers.pl/ohipo/zdjecia/Santander_logo.png"],
    ["mBank", "https://middlers.pl/ohipo/zdjecia/mBank_logo.png"],
    ["BPS", "https://middlers.pl/ohipo/zdjecia/bps_logo.png"],
  ]);

  /**
   * Calculates all offer properties based on the user input.
   *
   * @param loanValue - Total amount of credit
   * @param propertyValue - value of property
   * @param wibor3m - 3 months WIBOR rate
   * @param wibor6m - 6 months WIBOR rate
   * @param creditLengthInYears - for how long credit is going to be
   * @returns all properties calculated accordingly to the inputs
   */
  calculateOffer(userInput: UserInput): void {
    this.kwotaKredytuOferty = Calculate.CreditAmountWithAddictionalCosts(
      userInput.loanValue,
      this.oplatyZawszeKredytowane
    );
    this.LTVobliczone = Calculate.OfferLTV(
      this.kwotaKredytuOferty,
      userInput.propertyValue
    );
    this.WIBORstawka = Calculate.AssignCurrentWIBORtoOffers(
      this.WIBOR,
      userInput.mWIBOR3M,
      userInput.mWIBOR6M
    );
    this.rata = Calculate.FirstEqualInstallment(
      this.oprocStale,
      this.kwotaKredytuOferty,
      this.WIBORstawka,
      this.marza,
      userInput.creditLengthInYears
    );
    this.ubezpNieruchSuma = Calculate.ApartmentInsuranceMonthly(
      this.ubezpNieruchOdCzegoLicz,
      this.ubezpNieruchStawkaRok,
      userInput.propertyValue,
      userInput.loanValue
    );
    this.ubezpNieruchTOTAL = Calculate.TotalAppartmentInsurance(
      this.ubezpNieruchOdCzegoLicz,
      this.ubezpNieruchSuma,
      userInput.creditLengthInYears
    );
    this.ubezpZycieSuma = Calculate.LifeInsuranceMonthly(
      this.ubezpZycieStawkaMiesieczna,
      this.kwotaKredytuOferty
    );
    this.oplatyMiesieczne = Calculate.CostsMonthly(
      this.ubezpNieruchSuma,
      this.ubezpZycieSuma
    );
    this.prowizjaSuma = Calculate.CostUpFront(
      userInput.loanValue,
      this.prowizjaStawka
    );
    this.ubezZycieNaStartSuma = Calculate.CostUpFront(
      this.kwotaKredytuOferty,
      this.ubezZycieNaStart
    );
    this.upezpPracaNaStartSuma = Calculate.CostUpFront(
      this.kwotaKredytuOferty,
      this.upezpPracaNaStart
    );
    this.kosztyPoczatkowe = Calculate.Sum([
      this.prowizjaSuma,
      this.wycenaMieszkanie,
      this.ubezZycieNaStartSuma,
      this.upezpPracaNaStartSuma,
    ]);
    this.odsetkiSuma = Calculate.sumOfInterest(
      this.oprocStale,
      this.rata,
      userInput.creditLengthInYears,
      this.kwotaKredytuOferty,
      this.marza,
      userInput.propertyValue,
      this.WIBORstawka,
      this.oprocStaleMarzaPotem,
      this.oprocStaleIleLat
    );
    this.ubezpZycieTOTAL = Calculate.totalCostOfLifeInsurance(
      this.ubezpZycieIleLat,
      userInput.creditLengthInYears,
      this.kwotaKredytuOferty,
      this.ubezpZycieOdKtoregoMiesiaca,
      this.rata,
      this.marza,
      this.WIBORstawka,
      this.ubezpZycieStawkaMiesieczna
    );
    this.kosztyCalkowite = Calculate.Sum([
      this.prowizjaSuma,
      this.wycenaMieszkanie,
      this.ubezpZycieTOTAL,
      this.ubezpNieruchTOTAL,
      this.odsetkiSuma,
      this.ubezZycieNaStartSuma,
      this.upezpPracaNaStartSuma,
    ]);
  }
}
