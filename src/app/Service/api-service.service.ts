import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { CommonFunctionService } from './CommonFunctionService';
import { CookieService } from 'ngx-cookie-service';
// import { Ticketfaqmapping } from '../components/models/TicketingSystem';

// import { appkeys } from "../app.constant";
interface Coordinates {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  clientId: number = 1;
  cloudID: any;
  httpHeaders = new HttpHeaders();
  options = {
    headers: this.httpHeaders,
  };

  httpHeaders1 = new HttpHeaders();
  options1 = {
    headers: this.httpHeaders1,
  };

  // commoncode = 'https://ojasviadmin.uvtechsoft.com:9090';
  // commonimgUrl = 'https://ojasviadmin.uvtechsoft.com:9090/api/upload/';

  // ojasvi live
  commoncode = 'https://admin.ojasvidermacare.com:9092';
  commonimgUrl = 'https://admin.ojasvidermacare.com:9092/api/upload/';

  // commoncode = 'https://h10rqczh-9878.inc1.devtunnels.ms';
  // commonimgUrl = 'https://h10rqczh-9878.inc1.devtunnels.ms/api/upload/';

  // pooja
  // commoncode = 'https://h10rqczh-9090.inc1.devtunnels.ms';
  // commonimgUrl = 'https://h10rqczh-9090.inc1.devtunnels.ms/api/upload/';

  // commoncode = 'https://p8rhkmb7-9878.inc1.devtunnels.ms';
  // commonimgUrl = 'https://p8rhkmb7-9878.inc1.devtunnels.ms/api/upload/';

  //  commoncode = 'http://192.168.29.212:9878';
  // commonimgUrl = 'http://192.168.29.212:9878/api/upload/';

  // local
  // commonapikey = 'BEZhBltbyzL11SPV9YFdH4YgYUKZ6Fla';
  // commonapplicationkey = '26lLNSmaKlcFziHH';

  //Testing
  // commonapikey = 'VnEgKy9sBEXscwr4zs7J18aSjW0YA4fY';
  // commonapplicationkey = 'awlcQRwoZxAJQm7b';

  //Live
  commonapikey = 'BEZhBltbyzL11SPV9YFdH4YgYUKZ6Fla';
    commonapplicationkey = '26lLNSmaKlcFziHH';
  
  // live ojasvi
  //   APPLICATION_KEY = '26lLNSmaKlcFziHH'
  // commonapikey = 'BEZhBltbyzL11SPV9YFdH4YgYUKZ6Fla'

  url = `${this.commoncode}/`;
  baseUrl = `${this.commoncode}/`; // Base URL for your API
  token = this.cookie.get('token');
  retriveimgUrl = `${this.commoncode}/static/`;
  retriveimgUrl2(): string {
    return `${this.commoncode}/static/`;
  }
  Retrive(): any {
    return `${this.commoncode}/static/`;
  }

  dateforlog =
    new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();
  emailId = sessionStorage.getItem('emailId');
  userId = Number(sessionStorage.getItem('userId'));
  userName = sessionStorage.getItem('userName');
  roleId = sessionStorage.getItem('roleId');

  public commonFunction = new CommonFunctionService();

  // Start Decrept all the data

  private getDecryptedItem(key: string): string {
    const storedValue = sessionStorage.getItem(key);
    return storedValue ? this.commonFunction.decryptdata(storedValue) : '';
  }
  // getUserId(): any {
  //   const decryptedString = this.getDecryptedItem('userId');
  //

  //   return decryptedString ? parseInt(decryptedString, 10) : null;
  // }

  getUserId(): any {
    const decryptedString = this.getDecryptedItem('userId');

    if (
      decryptedString === null ||
      decryptedString === undefined ||
      decryptedString === ''
    ) {
      return; // returns undefined if no valid value exists
    }

    return parseInt(decryptedString, 10); // if it's "0", this will return 0 correctly
  }

  getUserName(): string {
    return this.getDecryptedItem('userName');
  }
  getEmail(): string {
    return this.getDecryptedItem('emailId');
  }

  getPlanFor(): string {
    return this.getDecryptedItem('planFor');
  }
  getUserAddress(): string {
    return this.getDecryptedItem('userAddress');
  }
  getSessionAddress(): any {
    return this.getDecryptedItem('defaultTeriotoryAddress');
  }
  getUsermobileNumber(): string {
    return this.getDecryptedItem('mobileNumber');
  }
  // End Decrept all the data

  private cartItems: any[] = []; // Store cart items
  private cartCount = new BehaviorSubject<number>(0); // Observable for count

  cartCount$ = this.cartCount.asObservable(); // Expose as observable

  // constructor() {}

  addToCart(item: any) {
    this.cartItems.push(item);
    this.cartCount.next(this.cartItems.length); // Update count
  }

  getCartItems() {
    return this.cartItems;
  }

  private updateCartCount() {
    this.cartCount.next(this.cartItems.length); // Emit new count
  }
  clearCart() {
    this.cartItems = []; // Clear the array
    this.updateCartCount(); // Update count
  }

  addItemToCart(item: any) {
    this.addToCart(item);
  }

  getLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position.coords);
          },
          (error) => {
            reject(error);
          }
        );
      } else {
        reject(new Error('Geolocation is not supported by this browser.'));
      }
    });
  }
  randomstring(L: any) {
    var s = '';
    var randomchar = function () {
      var n = Math.floor(Math.random() * 62);
      if (n < 10) return n; //1-10
      if (n < 36) return String.fromCharCode(n + 55); //A-Z
      return String.fromCharCode(n + 61); //a-z
    };
    while (s.length < L) s += randomchar();
    return s;
  }
  constructor(private httpClient: HttpClient, private cookie: CookieService) {
    if (
      this.cookie.get('deviceId') === '' ||
      this.cookie.get('deviceId') === null
    ) {
      var deviceId = this.randomstring(16);
      this.cookie.set(
        'deviceId',
        deviceId.toString(),
        365,
        '/',
        '',
        true,
        'None'
      );
    }
  }

  getSubscriptionList(ID: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.token,
    });

    return this.httpClient.get<any>(
      `${this.baseUrl}api/appUser/getSubscriptionDetails/${ID}`,

      {
        headers,
      }
    );
  }

  // <----------------------------------------------------------- Home Page Calls -------------------------------------------->

  getBannerData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'banner/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getAddresses1data(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customerAddress/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  updateAddressToUpdateCart(data: any): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/address/update',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }
  DeleteAddress(ADDRESS_ID: any, CUSTOMER_ID: any): Observable<any> {
    var data = {
      CUSTOMER_ID: CUSTOMER_ID,
      ADDRESS_ID: ADDRESS_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/address/archeiveAddress',
      JSON.stringify(data),
      { headers }
    );
  }

  getterritoryPincodeData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'territory/pincode/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  updateAddressDefault(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/customerAddress/updateAddressDefault',
      JSON.stringify(data),
      { headers }
    );
  }

  AddToCart(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/cart/add',
      JSON.stringify(data),
      { headers }
    );
  }

  getCustomerServiceFeedback(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customerServiceFeedback/getCustomerServiceFeedback',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getPoppulerServices(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    TERRITORY_ID: number
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
    });

    return this.httpClient
      .get<any>(`${this.baseUrl}app/getPoppulerServices/${TERRITORY_ID}`, {
        headers,
      })
      .pipe();
  }

  getPoppulerServicesForWeb(
    TERRITORY_ID: any,
    CUSTOMER_ID: any
  ): Observable<any> {
    const requestData = {
      TERRITORY_ID: TERRITORY_ID,
      CUSTOMER_ID: CUSTOMER_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      // Token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}app/getPoppulerServicesForWeb
 `,
      requestData,
      { headers }
    );
  }

  getServicesForWeb(
    TERRITORY_ID: any,
    CUSTOMER_ID: any,
    SUB_CATEGORY_ID: any,
    SEARCHKEY: any,
    PARENT_ID: any,
    CUSTOMER_TYPE: any
  ): Observable<any> {
    const requestData = {
      TERRITORY_ID: TERRITORY_ID,
      CUSTOMER_ID: CUSTOMER_ID,
      SUB_CATEGORY_ID: SUB_CATEGORY_ID,
      SEARCHKEY: SEARCHKEY,
      PARENT_ID: PARENT_ID,
      CUSTOMER_TYPE: CUSTOMER_TYPE,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      // Token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}order/getServicesForWeb`,
      requestData,
      { headers }
    );
  }

  getCategorieservices(TERRITORY_ID: any): Observable<any> {
    const requestData = {
      TERRITORY_ID: TERRITORY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      // Token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}app/ServiceCategory`,
      requestData,
      { headers }
    );
  }

  getCategoriesServices(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    TERRITORY_ID: number,
    CUSTOMER_ID: number
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      TERRITORY_ID,
      CUSTOMER_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
    });

    return this.httpClient
      .post<any>(
        `${this.baseUrl}order/getCategories/`,
        JSON.stringify(requestData),
        { headers }
      )
      .pipe();
  }

  getCategories(
    CUSTOMER_TYPE: string = '',
    PARENT_ID: number,
    SEARCHKEY: string = '',
    SUB_CATEGORY_ID: number,
    CUSTOMER_ID: number,
    TERRITORY_ID: number
  ): Observable<any> {
    const requestData = {
      CUSTOMER_TYPE,
      PARENT_ID,
      SEARCHKEY,
      SUB_CATEGORY_ID,
      CUSTOMER_ID,
      TERRITORY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}order/getServices/`,
      requestData,
      { headers }
    );
  }

  // imgUrl = appkeys.imgUrl;

  onUpload(folderName: any, selectedFile: any, filename: any): Observable<any> {
    this.onuploadheader();
    let params = new HttpParams();

    const options1 = {
      headers: this.httpHeaders1,
      params: params,
      reportProgress: true,
    };

    const fd = new FormData();
    fd.append('Image', selectedFile, filename);
    const req = new HttpRequest(
      'POST',
      this.commonimgUrl + folderName,
      fd,
      options1
    );
    return this.httpClient.request(req);
  }

  // For Testing server
  onuploadheader() {
    this.httpHeaders1 = new HttpHeaders({
      Accept: 'application/json',
      apikey: this.commonapikey,
      applicationkey: this.commonapplicationkey,
      supportkey: this.cookie.get('supportKey'),
      Token: this.cookie.get('token'),
    });

    this.options1 = {
      headers: this.httpHeaders,
    };
  }

  // Shop Services

  // Shop home page call

  // getBrands(
  //   pageIndex: number,
  //   pageSize: number,
  //   sortKey: string,
  //   sortValue: string,
  //   filter: string
  // ): Observable<any> {
  //   var data = {
  //     pageIndex: pageIndex,
  //     pageSize: pageSize,
  //     sortKey: sortKey,
  //     sortValue: sortValue,
  //     filter: filter,
  //   };
  //   return this.httpClient.post<any>(
  //     this.url + 'brand/get',
  //     JSON.stringify(data),
  //     { observe: 'response' }
  //   );
  // }

  // inventory

  getinventoryData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'inventory/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // login

  sendOTP(COUNTRY_CODE: any, TYPE_VALUE: any, TYPE: any): Observable<any> {
    const requestData: any = {
      COUNTRY_CODE,
      TYPE_VALUE,
      TYPE,
    };
    if (TYPE === 'M') {
      requestData.MOBILE_NO = TYPE_VALUE;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.token,
      // 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7IlVTRVJfSUQiOjF9LCJpYXQiOjE3MzcxMTY1MTB9.sWF2eNA8Q8Le-EypyPSjGW0CMRbI3N0YwpXRVvrDwJs',
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}web/customer/websiteLogin`,
      requestData,
      {
        headers,
      }
    );
  }

  // verifyOTP(
  //   TYPE: any,
  //   TYPE_VALUE: any,
  //   OTP: any,
  //   USER_ID: any,
  //   CUSTOMER_NAME: any,
  //   CUSTOMER_CATEGORY_ID: any,
  //   CLOUD_ID: any
  // ): Observable<any> {
  //   // Uncomment if needed
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonapplicationkey,
  //     apikey: this.commonapikey,
  //   });
  //   var data: any = {
  //     TYPE: TYPE,
  //     TYPE_VALUE: TYPE_VALUE,
  //     VERIFY_OTP: OTP,
  //     USER_ID: USER_ID,
  //     CUSTOMER_NAME: CUSTOMER_NAME,
  //     CUSTOMER_CATEGORY_ID: CUSTOMER_CATEGORY_ID,
  //     CLOUD_ID: CLOUD_ID,
  //   };

  //   if (TYPE === 'M') {
  //     data.MOBILE_NO = TYPE_VALUE;
  //   }

  //   return this.httpClient.post<any[]>(
  //     this.baseUrl + 'web/verifyOtp',
  //     JSON.stringify(data),
  //     {
  //       headers: headers,
  //       observe: 'response',
  //     }
  //   );
  // }
  userRegistration(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'verifyOTP',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  userRegistrationOTP(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'registerOtp',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  RegistrationCustomerAddress(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'api/customerAddress/create',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  getPincodeData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}web/pincode/get`,
      requestData,
      {
        headers,
      }
    );
  }

  getTerretoryData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}territory/pincode/get`,
      requestData,
      {
        headers,
      }
    );
  }

  getStateData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}web/state/get`,
      requestData,
      {
        headers,
      }
    );
  }

  getAppLanguageData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}api/appLanguage/get`,
      requestData,
      {
        headers,
      }
    );
  }
  getfaqData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(`${this.baseUrl}faq/get`, requestData, {
      headers,
    });
  }

  getUserData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}api/customer/get`,
      requestData,
      {
        headers,
      }
    );
  }

  updateUserData(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });
    return this.httpClient.put<any>(
      this.baseUrl + 'api/customer/update',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  updateCustomerAddress(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });
    return this.httpClient.put<any>(
      this.baseUrl + 'api/customerAddress/updateAddress',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  updateticket(ticket: any): Observable<any> {
    ticket['ORG_ID'] = Number(this.cookie.get('orgId'));
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.put<any>(
      this.url + 'api/ticket/update/',
      JSON.stringify(ticket),
      { headers: headers, observe: 'response' }
    );
  }

  // updateCustomerAddress(data: any): Observable<any> {
  //   data.CLIENT_ID = this.clientId; // Uncomment if needed
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonapplicationkey,
  //     apikey: this.commonapikey,

  //     token: this.cookie.get('token'),
  //   });
  //   return this.httpClient.put<any>(
  //     this.baseUrl + 'api/customerAddress/update',
  //     JSON.stringify(data),
  //     {
  //       headers: headers,
  //       observe: 'response',
  //     }
  //   );
  // }

  // Shop Services
  CartGetforaddtocart1(
    customer_id: any,
    inventoryId: any,
    quantity: any,
    IS_TEMP_CART: any,
    STATE_ID: any,
    teritory_id: any,
    ADDRESS_ID: any,
    TYPE: any,
    SERVICE_ID: any,
    unit_id: any,
    quentity_per_unit: any,
    unit_name: any
  ): Observable<any> {
    var data = {
      CUSTOMER_ID: customer_id,
      INVENTORY_ID: inventoryId,
      QUANTITY: quantity,
      IS_TEMP_CART: IS_TEMP_CART,
      STATE_ID: STATE_ID,
      TERITORY_ID: teritory_id,
      ADDRESS_ID: ADDRESS_ID,
      TYPE: TYPE,
      SERVICE_ID: SERVICE_ID,
      UNIT_ID: unit_id,
      QUANTITY_PER_UNIT: quentity_per_unit,
      UNIT_NAME: unit_name,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/add',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // Shop home page call

  getBrands(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'brand/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }

  // inventory

  // getinventoryData(
  //   pageIndex: number,
  //   pageSize: number,
  //   sortKey: string,
  //   sortValue: string,
  //   filter: string): Observable<any> {
  //   var data = {
  //     pageIndex: pageIndex,
  //     pageSize: pageSize,
  //     sortKey: sortKey,
  //     sortValue: sortValue,
  //     filter: filter,
  //   };
  //   const headers = new HttpHeaders({
  //     "Content-Type": "application/json",
  //     applicationkey: this.commonapplicationkey,
  //     apikey: this.commonapikey,
  //     token: this.cookie.get("token"),
  //   });
  //   return this.httpClient.post<any>(
  //     this.baseUrl + "inventory/get",
  //     JSON.stringify(data),
  //     {
  //       headers,
  //     }
  //   );
  // }

  // inventory Mapping get

  getinventoryunitMapping(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'inventoryUnitMapping/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // inventory image Mapping

  inventoryImageMapping(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'inventoryImageMapping/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // cart get

  // CartGet(
  //   customer_id: any,
  //   inventoryId: any,
  //   quantity: any,
  //   IS_TEMP_CART: any,
  //   STATE_ID: any,
  //   teritory_id: any,
  //   ADDRESS_ID: any,
  //   TYPE: any,
  //   unit_id: any,
  //   quentity_per_unit: any,
  //   unit_name: any,
  // ): Observable<any> {
  //   var data = {
  //     CUSTOMER_ID: customer_id,
  //     INVENTORY_ID: inventoryId,
  //     QUANTITY: quantity,
  //     IS_TEMP_CART: IS_TEMP_CART,
  //     STATE_ID: STATE_ID,
  //     TERITORY_ID: teritory_id,
  //     ADDRESS_ID: ADDRESS_ID,
  //     TYPE: TYPE,
  //     UNIT_ID: unit_id,
  //     QUANTITY_PER_UNIT: quentity_per_unit,
  //     UNIT_NAME: unit_name,
  //   };
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     applicationkey: this.commonapplicationkey,
  //     apikey: this.commonapikey,
  //     token: this.cookie.get('token'),
  //   });
  //   return this.httpClient.post<any>(
  //     this.baseUrl + 'api/cart/add',
  //     JSON.stringify(data),
  //     {
  //       headers,
  //     }
  //   );
  // }

  CartGet(
    customer_id: any,
    inventoryId: any,
    quantity: any,
    IS_TEMP_CART: any,
    STATE_ID: any,
    teritory_id: any,
    ADDRESS_ID: any,
    TYPE: any,
    unit_id: any,
    quentity_per_unit: any,
    unit_name: any
  ): Observable<any> {
    var data = {
      CUSTOMER_ID: customer_id,
      INVENTORY_ID: inventoryId,
      QUANTITY: quantity,
      IS_TEMP_CART: IS_TEMP_CART,
      STATE_ID: STATE_ID,
      TERITORY_ID: teritory_id,
      ADDRESS_ID: ADDRESS_ID,
      TYPE: TYPE,
      UNIT_ID: unit_id,
      QUANTITY_PER_UNIT: quentity_per_unit,
      UNIT_NAME: unit_name,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/add',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
  // Address

  // Address

  getAddress(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customerAddress/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // get address Details

  getAddressDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    CART_ID: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      CART_ID: CART_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/getDetails',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  Getterritory(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/territory/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // get address Details

  // customer Details

  // customer Details

  getAllServiceData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}api/service/get`,
      requestData,
      {
        headers,
      }
    );
  }

  getCoupanDetails(
    CUSTOMER_ID: number,
    CART_ID: number,
    COUNTRY_ID: any,
    TYPE: any
  ): Observable<any> {
    var data = {
      CUSTOMER_ID: CUSTOMER_ID,
      CART_ID: CART_ID,
      COUNTRY_ID: COUNTRY_ID,
      TYPE: TYPE,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/coupons/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getcustomer(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customer/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  ApplyCoupan(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/cart/coupon/apply',
      JSON.stringify(data),
      { headers }
    );
  }
  RemoveCoupan(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/cart/coupon/remove',
      JSON.stringify(data),
      { headers }
    );
  }

  BookOrder(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/cart/updateDetails',
      JSON.stringify(data),
      { headers }
    );
  }
  orderUpdateStatus(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.patch<any>(
      this.url + 'api/order/orderUpdateStatus',
      data,
      { headers }
    );
  }

  RemoveFromCart(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/cart/service/delete',
      JSON.stringify(data),
      { headers }
    );
  }

  CreateOrder(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/cart/order/create',
      JSON.stringify(data),
      { headers }
    );
  }

  addPaymentTransactions(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/invoicepaymentdetails/addPaymentTransactions',
      JSON.stringify(data),
      { headers }
    );
  }

  getorderData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/order/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
  getOrderDetails(CUSTOMER_ID: any, ORDER_ID: any): Observable<any> {
    var data = {
      CUSTOMER_ID: CUSTOMER_ID,
      ORDER_ID: ORDER_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/orderDetails/getOrderDetails',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
  getorderLogs(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: object, // Change from string to object
    ORDER_ID: number,
    IS_ORDER_OR_JOB: string
  ): Observable<any> {
    const data = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter, // Ensure this is an object, NOT a string
      ORDER_ID: Number(ORDER_ID), // Ensure it's a number
      IS_ORDER_OR_JOB,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'api/technicianActionLogs/getorderLogsforCustomer',
      data, // No need to JSON.stringify(data), Angular handles it automatically
      { headers }
    );
  }

  getjoborderLogs(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: object, // Change from string to object
    ORDER_ID: number,

    JOB_CARD_ID: number,
    IS_ORDER_OR_JOB: string
  ): Observable<any> {
    const data = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter, // Ensure this is an object, NOT a string
      ORDER_ID: Number(ORDER_ID), // Ensure it's a number

      JOB_CARD_ID: Number(JOB_CARD_ID), // Ensure it's a number
      IS_ORDER_OR_JOB,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'api/technicianActionLogs/getorderLogsforCustomer',
      data, // No need to JSON.stringify(data), Angular handles it automatically
      { headers }
    );
  }

  getCartDetails(CUSTOMER_ID: number): Observable<any> {
    var data = {
      CUSTOMER_ID: CUSTOMER_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/getDetails',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getCartGetDetails(CART_ID: number): Observable<any> {
    var data = {
      CART_ID: CART_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/getDetails',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  RateUS(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url +
        'api/customertechnicianfeedback/technicianServiceFeedbackByCustomer',
      JSON.stringify(data),
      { headers }
    );
  }
  getcustomerDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter + ' ',
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customerAddress/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // get coupan for the shop

  getCoupanDetailsforshop(
    CUSTOMER_ID: number,
    CART_ID: number,
    COUNTRY_ID: any,
    TYPE: any
  ): Observable<any> {
    var data = {
      CUSTOMER_ID: CUSTOMER_ID,
      CART_ID: CART_ID,
      COUNTRY_ID: COUNTRY_ID,
      TYPE: TYPE,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/coupons/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // For the Add to cart

  CartGetforaddtocart(
    customer_id: any,
    inventoryId: any,
    quantity: any,
    IS_TEMP_CART: any,
    UNIT_ID: any,
    UNIT_NAME: any,
    QUANTITY_PER_UNIT: any,
    STATE_ID: any,
    teritory_id: any,
    ADDRESS_ID: any,
    TYPE: any
  ): Observable<any> {
    var data = {
      CUSTOMER_ID: customer_id,
      INVENTORY_ID: inventoryId,
      QUANTITY: quantity,
      IS_TEMP_CART: IS_TEMP_CART,
      UNIT_ID: UNIT_ID,
      UNIT_NAME: UNIT_NAME,
      QUANTITY_PER_UNIT: QUANTITY_PER_UNIT,
      STATE_ID: STATE_ID,
      TERITORY_ID: teritory_id,
      ADDRESS_ID: ADDRESS_ID,
      TYPE: TYPE,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/add',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
  CartCountUpdate(
    TYPE: any,
    customer_id: any,
    CART_id: any,
    CART_ITEM_ID: any,
    QUANTITY: any,
    INVENTORY_ID: any
  ): Observable<any> {
    var data = {
      TYPE: TYPE,
      CUSTOMER_ID: customer_id,
      CART_ID: CART_id,
      CART_ITEM_ID: CART_ITEM_ID,
      QUANTITY: QUANTITY,
      INVENTORY_ID: INVENTORY_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/product/update',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
  // add to cart delete call

  Deletecart(
    TYPE: any,
    customer_id: any,
    CART_id: any,
    CART_ITEM_ID: any,
    INVENTORY_ID: any
  ): Observable<any> {
    var data = {
      TYPE: TYPE,
      CUSTOMER_ID: customer_id,
      CART_ID: CART_id,
      CART_ITEM_ID: CART_ITEM_ID,
      INVENTORY_ID: INVENTORY_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/product/delete',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getfetchJobDetailsWithFeedback(
    CUSTOMER_ID: any,
    ORDER_ID: any,
    JOB_CARD_ID: any,
    sortKey: any,
    sortValue: any
  ): Observable<any> {
    const data = {
      CUSTOMER_ID: Number(CUSTOMER_ID),
      ORDER_ID: Number(ORDER_ID),
      JOB_CARD_ID: Number(JOB_CARD_ID),

      sortKey,
      sortValue,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'api/jobcard/getjobDetailsWithFeedback',
      JSON.stringify(data),
      { headers }
    );
  }

  getchat(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    this.options = {
      headers: headers,
    };
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'api/orderChat/get',
      JSON.stringify(data),
      this.options
    );
  }

  createchat(role: any): Observable<any> {
    role.CLIENT_ID = this.clientId;
    // this.getHeader();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    this.options = {
      headers: headers,
    };
    return this.httpClient.post<any>(
      this.url + 'api/orderChat/create',
      JSON.stringify(role),
      this.options
    );
  }

  getShoporderData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/shopOrder/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }

  getAllTicketGroups(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/ticketGroup/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }
  // shopordercard data

  getshopeOrderData(filter: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.get<any>(
      `${this.url}api/shopOrder/${filter}/orderDetails`,
      {
        observe: 'response',
        headers,
      }
    );
  }
  createRating(
    ShopserviceId: any,
    UserID: any,
    INVENTORY_ID: any,
    RATING: any,
    COMMENTS: any,
    FEEDBACK_DATE_TIME: any
  ): Observable<any> {
    var data = {
      ORDER_ID: ShopserviceId,
      CUSTOMER_ID: UserID,
      INVENTORY_ID: INVENTORY_ID,
      RATING: RATING,
      COMMENTS: COMMENTS,
      FEEDBACK_DATE_TIME: FEEDBACK_DATE_TIME,
      CLIENT_ID: 1,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/customerProductFeedback/addFeedback',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }

  getFeedbackData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/customerProductFeedback/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }

  getShoporderStatusData(filter: any): Observable<any> {
    var data = {
      filter: { ORDER_ID: filter },
    };
    filter: {
      ORDER_ID: filter;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/shopOrderActionLog/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }

  getAllTickets(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/ticket/get',
      JSON.stringify(data),
      { headers: headers, observe: 'response' } // Correct placement of this.options
    );
  }

  createTicket(ticket: any): Observable<any> {
    ticket['ORG_ID'] = Number(this.cookie.get('orgId'));
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/ticket/create/',
      JSON.stringify(ticket),
      { headers: headers, observe: 'response' }
    );
  }
  getAllTicketGroupsprevious(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    ID: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      ID: ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/ticketGroup/getTicketGroups',
      JSON.stringify(data),
      { headers: headers, observe: 'response' } // Correct placement of this.options
    );
  }
  onUpload2(folderName: any, selectedFile: any, filename: any) {
    this.httpHeaders1 = new HttpHeaders({
      Accept: 'application/json',
      apikey: 'BEZhBltbyzL11SPV9YFdH4YgYUKZ6Fla',
      applicationkey: '26lLNSmaKlcFziHH',
      deviceid: this.cookie.get('deviceId'),
      supportkey: this.cookie.get('supportKey'),
      Token: this.cookie.get('token'),
    });

    this.options1 = {
      headers: this.httpHeaders1,
    };

    const fd = new FormData();
    fd.append('Image', selectedFile, filename);

    return this.httpClient.post(
      this.commonimgUrl + folderName,
      fd,
      this.options1
    );
  }

  getKnowledgeBaseCategory(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    this.options = {
      headers: headers,
    };
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'knowledgeBaseCategory/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }
  getKnowledgeBaseSubCategory(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    this.options = {
      headers: headers,
    };
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'knowledgebaseSubCategory/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }
  getKnowledgeBase(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    this.options = {
      headers: headers,
    };
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'knowledgeBase/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }

  // shop order

  CreateshopOrder(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/cart/order/create',
      JSON.stringify(data),
      { headers }
    );
  }

  addPaymentTransactionsshop(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/invoicepaymentdetails/addPaymentTransactions',
      JSON.stringify(data),
      { headers }
    );
  }

  AddUpdatePartRequest(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/inventoryRequest/updateRequestStatus',
      JSON.stringify(data),
      { headers }
    );
  }
  getPartInfoForOrder(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/inventoryRequestDetails/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getPaymentSummary(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/inventoryRequestDetails/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  CartslotGet(customer_id: any, teritory_id: any): Observable<any> {
    var data = {
      CUSTOMER_ID: customer_id,
      TERRITORY_ID: teritory_id,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/slots/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  userLogout(USER_ID: any): Observable<any> {
    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    var data = {
      USER_ID: USER_ID,
    };

    return this.httpClient.post<any[]>(
      this.baseUrl + 'api/logout',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  getAllticketDetails(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    const data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/ticketDetails/get',
      JSON.stringify(data),
      { headers: headers, observe: 'response' } // Correct placement of this.options
    );
  }

  AddChat(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/ticketDetails/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getAddressDetailsForshopcart(CART_ID: any): Observable<any> {
    var data = {
      CUSTOMER_ID: CART_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/getDetails',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getDefaultAddress(filter: string): Observable<any> {
    var data = {
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customerAddress/updateAddressDefault',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getglobalServiceData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = '',
    TERRITORY_ID: any
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
      TYPE: 'M',
      TERRITORY_ID: TERRITORY_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}app/global/search`,
      requestData,
      {
        headers,
      }
    );
  }

  getnotifications(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    this.options = {
      headers: headers,
    };
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'api/notification/get',
      JSON.stringify(data),
      { observe: 'response', headers }
    );
  }

  getAppLanguageDataFilterwise(
    movementRequestMasterId: number
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.get<any[]>(
      `${this.url}api/appLanguage/${movementRequestMasterId}/getAppLanguageMaster`,
      { headers: headers, observe: 'response' }
    );
  }
  CartCountUpdateService(
    TYPE: any,
    customer_id: any,
    CART_id: any,
    CART_ITEM_ID: any,
    QUANTITY: any,
    SERVICE_ID: any
  ): Observable<any> {
    var data = {
      TYPE: TYPE,
      CUSTOMER_ID: customer_id,
      CART_ID: CART_id,
      CART_ITEM_ID: CART_ITEM_ID,
      QUANTITY: QUANTITY,
      // INVENTORY_ID: INVENTORY_ID,
      SERVICE_ID: SERVICE_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/product/update',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getcartinfo(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: any,
    USER_ID: any
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    this.options = {
      headers: headers,
    };
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      CUSTOMER_ID: USER_ID,
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cart/getDetails',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  // INVANTORY FOR CARD BUTTON

  getinventoryDatacart(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    userId: any,
    id: any,
    qUANTITY_PER_UNIT: any,
    uNIT_ID: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      CUSTOMER_ID: userId,
      INVENTORY_ID: id,
      QUANTITY_PER_UNIT: qUANTITY_PER_UNIT,
      UNIT_ID: uNIT_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/inventory/getForCart',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getchnageUnitcount(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    unit_id: any,
    item_id: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      UNIT_ID: unit_id,
      ITEM_ID: item_id,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      // this.baseUrl + 'api/inventoryReports/getStocksForUnit',
      this.baseUrl + 'api/inventoryReports/getStocksforWeb',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
  // simple inventory get
  getsimpleinventoryforcart(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    userId: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      CUSTOMER_ID: userId,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/inventory/getForCart',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getCancellationReason(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/cancleOrderReason/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  addOrderCancellationTransaction(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/ordercancellationtransactions/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getinventoryData1(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    userId: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      CUSTOMER_ID: userId,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/inventory/getForCart',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  sendOTP1(USER_NAME: any, TYPE: any): Observable<any> {
    const requestData: any = {
      USER_NAME,
      // TYPE_VALUE,
      TYPE,
    };
    // if (TYPE === 'M') {
    //   // requestData.MOBILE_NO = TYPE_VALUE;
    // }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.token,
      // 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7IlVTRVJfSUQiOjF9LCJpYXQiOjE3MzcxMTY1MTB9.sWF2eNA8Q8Le-EypyPSjGW0CMRbI3N0YwpXRVvrDwJs',
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}web/customer/sendRegisterOtp`,
      requestData,
      {
        headers,
      }
    );
  }
  login(USER_NAME: any, TYPE: any, PASSWORD: any): Observable<any> {
    const requestData: any = {
      USER_NAME,
      // TYPE_VALUE,
      TYPE,
      PASSWORD,
    };
    if (TYPE === 'M') {
      // requestData.MOBILE_NO = TYPE_VALUE;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.token,
      // 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7IlVTRVJfSUQiOjF9LCJpYXQiOjE3MzcxMTY1MTB9.sWF2eNA8Q8Le-EypyPSjGW0CMRbI3N0YwpXRVvrDwJs',
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}web/customer/webLogin`,
      requestData,
      {
        headers,
      }
    );
  }

  // NAME,MOBILE_NO,EMAIL_ID,PASSWORD,CLIENT_ID,STATUS
  createCustomer(
    USER_NAME: any,
    MOBILE_NO: any,
    EMAIL_ID: any,
    PASSWORD: any,
    CLIENT_ID: 1,
    STATUS: any,
    COUNTRY_CODE :any
  ): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const requestData: any = {
      USER_NAME,
      NAME: USER_NAME,
      MOBILE_NO,
      EMAIL_ID,
      PASSWORD,
      CLIENT_ID,
      STATUS,
      COUNTRY_CODE

      // TYPE_VALUE,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'web/customerCreate',
      // JSON.stringify(data),
      requestData,
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  verifyOTP(
    TYPE: any,
    // TYPE_VALUE: any,
    OTP: any,
    // USER_ID: any,
    USER_NAME: any
    // CUSTOMER_CATEGORY_ID: any,
    // CLOUD_ID: any
  ): Observable<any> {
    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
    });
    var data: any = {
      TYPE,
      // TYPE_VALUE: TYPE_VALUE,
      OTP,
      // USER_ID: USER_ID,
      USER_NAME,
      // CUSTOMER_CATEGORY_ID: CUSTOMER_CATEGORY_ID,
      // CLOUD_ID: CLOUD_ID,
    };

    // if (TYPE === 'M') {
    //   data.MOBILE_NO = TYPE_VALUE;
    // }

    return this.httpClient.post<any[]>(
      this.baseUrl + 'web/customer/verifyRegisterOtp',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  //sanjana
  SendMessage(data: any): Observable<any> {
    data.CLIENT_ID = this.clientId;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/userContact/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getAllProductsData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'web/products/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getWebBannerData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'web/websiteBanner/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getAllVarient(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    // this.getheader();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    // this.httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',
    //   'applicationkey': 'B71DIrzfXKPF97Ci',
    //   'deviceid':this.cookie.get('deviceId'),
    //   'supportkey':this.cookie.get('supportKey'),
    //   'Token': this.cookie.get('token'),
    //     });
    //     this.options = {
    //   headers: this.httpHeaders
    // };
    return this.httpClient.post<any>(
      this.url + 'web/productVarientMapping/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getAllIngrdeint(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    // this.getheader();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    // this.httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',
    //   'applicationkey': 'B71DIrzfXKPF97Ci',
    //   'deviceid':this.cookie.get('deviceId'),
    //   'supportkey':this.cookie.get('supportKey'),
    //   'Token': this.cookie.get('token'),
    //     });
    //     this.options = {
    //   headers: this.httpHeaders
    // };
    return this.httpClient.post<any>(
      this.url + 'web/productIngredientMapping/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getAllProductMaster(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string,
    INGREDIENT_ID: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      INGREDIENT_ID: INGREDIENT_ID,
    };
    // this.getheader();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    // this.httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',
    //   'applicationkey': 'B71DIrzfXKPF97Ci',
    //   'deviceid':this.cookie.get('deviceId'),
    //   'supportkey':this.cookie.get('supportKey'),
    //   'Token': this.cookie.get('token'),
    //     });
    //     this.options = {
    //   headers: this.httpHeaders
    // };
    return this.httpClient.post<any>(
      this.url + 'web/products/getDetails',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getAllIngredientMaster(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    // this.getheader();

    // this.httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',
    //   'applicationkey': 'B71DIrzfXKPF97Ci',
    //   'deviceid':this.cookie.get('deviceId'),
    //   'supportkey':this.cookie.get('supportKey'),
    //   'Token': this.cookie.get('token'),
    //     });
    //     this.options = {
    //   headers: this.httpHeaders
    // };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/ingredients/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getAllCategoryMaster(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    // this.getheader();

    // this.httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',
    //   'applicationkey': 'B71DIrzfXKPF97Ci',
    //   'deviceid':this.cookie.get('deviceId'),
    //   'supportkey':this.cookie.get('supportKey'),
    //   'Token': this.cookie.get('token'),
    //     });
    //     this.options = {
    //   headers: this.httpHeaders
    // };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/categoryCount/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  logout(customerId: any): Observable<any> {
    const requestData = {
      CUSTOMER_ID: customerId,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.token, // still send token in header
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}web/customer/websiteLogout`,
      requestData,
      { headers }
    );
  }

  SubsribeToNewsLetterCreate(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/newsSubscribers/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getCustomeraddressweb(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'web/address/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getAllStateMaster(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/state/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
  proceedToCheckout(
    paymentMode: any,
    addressId: any,
    cartId: any,
    customerId: any,
    paymentKey: any,
    paymentStatus: any,
    paymentDatetime: any, // Consider using Date type and formatting it before sending
    clientId: any
  ): Observable<any> {
    // Prepare the data payload for the POST request
    const data = {
      PAYMENT_MODE: paymentMode,
      ADDRESS_ID: addressId,
      CART_ID: cartId,
      CUSTOMER_ID: customerId,
      PAYMENT_KEY: paymentKey,
      PAYMENT_STATUS: paymentStatus,
      PAYMENT_DATETIME: paymentDatetime,
      CLIENT_ID: clientId,
    };

    // Set up HTTP headers, including content type and authentication keys
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'), // Retrieve token from cookies
    });

    // Make the POST request to the checkout endpoint
    return this.httpClient.post<any>(
      this.baseUrl + 'web/proceedToCheckout',
      JSON.stringify(data), // Convert the data object to a JSON string
      {
        headers, // Include the prepared headers
      }
    );
  }

  getPincodeMaster(
    pageIndex: number,

    pageSize: number,

    sortKey: string,

    sortValue: string,

    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,

      pageSize: pageSize,

      sortKey: sortKey,

      sortValue: sortValue,

      filter: filter,
    };

    // this.getheader();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/ShippingCharges/get',

      JSON.stringify(data),

      {
        headers,
      }
    );
  }

  getAllCountryMaster(
    pageIndex: number,

    pageSize: number,

    sortKey: string,

    sortValue: string,

    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,

      pageSize: pageSize,

      sortKey: sortKey,

      sortValue: sortValue,

      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'web/country',

      JSON.stringify(data),

      {
        headers,
      }
    );
  }

  getAddressMaster(
    pageIndex: number,

    pageSize: number,

    sortKey: string,

    sortValue: string,

    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,

      pageSize: pageSize,

      sortKey: sortKey,

      sortValue: sortValue,

      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });

    // this.httpHeaders = new HttpHeaders({

    //   'Content-Type': 'application/json',

    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',

    //   'applicationkey': 'B71DIrzfXKPF97Ci',

    //   'deviceid':this.cookie.get('deviceId'),

    //   'supportkey':this.cookie.get('supportKey'),

    //   'Token': this.cookie.get('token'),

    //     });

    //     this.options = {

    //   headers: this.httpHeaders

    // };

    return this.httpClient.post<any>(
      this.url + 'web/address/get',

      JSON.stringify(data),

      {
        headers,
      }
    );
  }

  createAddressMaster(role: any): Observable<any> {
    role.CLIENT_ID = this.clientId;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'web/address/create/',

      JSON.stringify(role),

      {
        headers,
      }
    );
  }

  updateAddressMaster(role: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });

    return this.httpClient.put<any>(
      this.url + 'web/address/update/',

      JSON.stringify(role),

      {
        headers,
      }
    );
  }

  getUserDetails(CUSTOMER_ID: number): Observable<any> {
    var data = {
      CUSTOMER_ID: CUSTOMER_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token') ?? sessionStorage.getItem('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/order/getData',

      JSON.stringify(data),

      {
        headers,
      }
    );
  }

  Ordermaster(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/order/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  //code by sanjana

  getGlobalSearchData(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    likestring: string,
    TYPE: any
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      likestring: likestring,
      TYPE: TYPE,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/products/productSearch',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  sessionKeyGet(): Observable<any> {
    this.httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      apikey: this.commonapikey,
      applicationkey: this.commonapplicationkey,
      deviceid: this.cookie.get('deviceId'),
      supportkey: this.cookie.get('supportKey'),
      Token: this.cookie.get('token'),
      sessionkey: this.cookie.get('sessionKey'),
    });
    this.options = {
      headers: this.httpHeaders,
    };
    var data = {};
    return this.httpClient.post<any>(
      this.url + 'web/cart/getSessionKey',
      JSON.stringify(data),
      this.options
    );
  }

  addFavoriteProduct(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/customer/addFavoriteProduct',
      JSON.stringify(data),
      { headers }
    );
  }

  removeFavoriteProduct(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/customer/removeFavoriteProduct',
      JSON.stringify(data),
      { headers }
    );
  }

  getFavoriteProducts(filter: string): Observable<any> {
    var data = {
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/customer/getFavoriteProducts',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  addreview(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/customerWebsiteReviews/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getcustomerWebsiteReviews(filter: string): Observable<any> {
    var data = {
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/customerWebsiteReviews/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  addProductreview(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'api/customerProductReviews/create',
      JSON.stringify(data),
      { headers }
    );
  }

  getcustomerProductReviews(filter: string): Observable<any> {
    var data = {
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.url + 'web/customerProductReviews/get ',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  changeForgotPasswordBehaviorSubject(data: any) {
    this.getforgotPasswordBehaviorSubjet().next(data);
  }
  forgotPassword: any;
  resetPassword: any;
  setPassword: any;

  getforgotPasswordBehaviorSubjet() {
    if (!this.forgotPassword) {
      this.forgotPassword = new BehaviorSubject<any>(false);
    }

    return this.forgotPassword;
  }

  //  sendLink(email: string): Observable<any> {
  //   const params = new HttpParams().set('email', email);
  //   return this.httpClient.post(`${this.baseUrl}/auth/send-otp`, null, { params });
  // }

  sendLink(
    // pageIndex: number,
    // pageSize: number,
    // sortKey: string,
    // sortValue: string,
    // filter: string
    mobileNo: string,
    email: string
  ): Observable<any> {
    var data = {
      // pageIndex: pageIndex,
      // pageSize: pageSize,
      // sortKey: sortKey,
      // sortValue: sortValue,
      // filter: filter,
      MOBILE_NO: mobileNo, // Added Mobile_No
      EMAIL_ID: email, // Added Email
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'customer/forgotPassword',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  getFAQDetails(filter: any): Observable<any> {
    var data = {
      filter: filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'web/productFaqMapping/get',

      JSON.stringify(data),

      {
        headers,
      }
    );
  }

  getViewDetails(PRODUCT_ID: number, CUSTOMER_ID: any): Observable<any> {
    var data = {
      PRODUCT_ID: PRODUCT_ID,
      CUSTOMER_ID: CUSTOMER_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.url + 'api/customer/recentProductsViews',

      JSON.stringify(data),

      {
        headers,
      }
    );
  }
  getAllCharges(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    // this.getheader();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',

      applicationkey: this.commonapplicationkey,

      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });
    // this.httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',
    //   'applicationkey': 'B71DIrzfXKPF97Ci',
    //   'deviceid':this.cookie.get('deviceId'),
    //   'supportkey':this.cookie.get('supportKey'),
    //   'Token': this.cookie.get('token'),
    //     });
    //     this.options = {
    //   headers: this.httpHeaders
    // };/api/country/get
    return this.httpClient.post<any>(
      this.url + 'web/configurationDetails/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  createCountry(payload: any): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const requestData: any = payload;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'web/country/create',
      // JSON.stringify(data),
      requestData,
      {
        headers: headers,
        // observe: 'response',
      }
    );
  }
  createState(payload: any): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const requestData: any = payload;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'web/state/create',
      // JSON.stringify(data),
      requestData,
      {
        headers: headers,
        // observe: 'response',
      }
    );
  }
  createCity(payload: any): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const requestData: any = payload;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'web/city/create',
      // JSON.stringify(data),
      requestData,
      {
        headers: headers,
        // observe: 'response',
      }
    );
  }

  getCityData(
    pageIndex: number,
    pageSize: number,
    sortKey: string = '',
    sortValue: string = '',
    filter: string = ''
  ): Observable<any> {
    const requestData = {
      pageIndex,
      pageSize,
      sortKey,
      sortValue,
      filter,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      `${this.baseUrl}web/city/get`,
      requestData,
      {
        headers,
      }
    );
  }
  getState(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'web/state/get',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  verifyEmail(EMAIL_ID: any): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const requestData: any = {
      EMAIL_ID: EMAIL_ID,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });

    return this.httpClient.post<any>(
      this.baseUrl + 'web/guestUserEmailSendOtp',
      // JSON.stringify(data),
      requestData,
      {
        headers: headers,
        // observe: 'response',
      }
    );
  }
  verifyEmailOTP(
    // TYPE: any,
    // TYPE_VALUE: any,
    VERIFY_OTP: any,
    // USER_ID: any,
    EMAIL_ID: any
    // CUSTOMER_CATEGORY_ID: any,
    // CLOUD_ID: any
  ): Observable<any> {
    // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
    });
    var data: any = {
      // TYPE_VALUE: TYPE_VALUE,
      VERIFY_OTP,
      // USER_ID: USER_ID,
      EMAIL_ID,
      // CUSTOMER_CATEGORY_ID: CUSTOMER_CATEGORY_ID,
      // CLOUD_ID: CLOUD_ID,
    };

    // if (TYPE === 'M') {
    //   data.MOBILE_NO = TYPE_VALUE;
    // }

    return this.httpClient.post<any[]>(
      this.baseUrl + 'web/guestUserVerifyOtp',
      JSON.stringify(data),
      {
        headers: headers,
        observe: 'response',
      }
    );
  }

  getOpenOrders(id: any): Observable<any> {
    // var data = {
    //   pageIndex: pageIndex,
    //   pageSize: pageSize,
    //   sortKey: sortKey,
    //   sortValue: sortValue,
    //   filter: filter,
    // };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    // const params = new HttpParams().set('id', id);
    return this.httpClient.post<any>(
      `${this.baseUrl}web/getOrderData`,
      {
        ORDER_ID: id,
      }, // empty body
      {
        headers,
      } // ✅ attach headers and params
    );
  }




    sendotpp(CEMAIL_ID: string): Observable<any> {
    const data = {
      username: CEMAIL_ID,
    };

    return this.httpClient.post<any>(
      this.baseUrl + 'customer/sendotpforchangepassword',
      JSON.stringify(data),
      { headers: this.httpHeaders, observe: 'response' }
    );
  }

  sendotp(
    MOBILE_NO: string,
    EMAIL_ID: string,
    CUSTOMER_ID: any
  ): Observable<any> {
    var data = {
      MOBILE_NO: MOBILE_NO,
      EMAIL_ID: EMAIL_ID,
      CUSTOMER_ID: CUSTOMER_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customer/sendOtpForRegisterUser',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }

  verifyotpp(
    MOBILE_NO: string,
  COUNTRY_CODE:string,
    EMAIL_ID: string,
    OTP: string,
    CUSTOMER_ID: any
  ): Observable<any> {
    var data = {
      MOBILE_NO: MOBILE_NO,
      COUNTRY_CODE:COUNTRY_CODE,
      EMAIL_ID: EMAIL_ID,
      OTP: OTP,
      CUSTOMER_ID: CUSTOMER_ID,
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customer/verifyOtpForRegisterUser',
      JSON.stringify(data),
      {
        headers,
      }
    );
  }
   getChangePasswordOtp(data: any): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customer/otpForChangePassword',
      JSON.stringify(data),
      {
        headers: headers,
      }
    );
  }
   verifyChangePasswordOtp(data: any): Observable<any> {
    // data.CLIENT_ID = this.clientId; // Uncomment if needed
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,

      token: this.cookie.get('token'),
    });
    return this.httpClient.post<any>(
      this.baseUrl + 'api/customer/verifyChangePassOtp',
      JSON.stringify(data),
      {
        headers: headers,
      }
    );
  }
  getAllpickupLocation(
    pageIndex: number,
    pageSize: number,
    sortKey: string,
    sortValue: string,
    filter: string
  ): Observable<any> {
    var data = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      sortKey: sortKey,
      sortValue: sortValue,
      filter: filter,
      CLIENT_ID:this.clientId
    };
      const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,

      token: this.cookie.get('token') ?? sessionStorage.getItem('token'),
    });
    // this.getheader();

    // this.httpHeaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'apikey': 'yxPlx4hTu5xzEXRiqB3dgKbFDDYNDl82',
    //   'applicationkey': 'B71DIrzfXKPF97Ci',
    //   'deviceid':this.cookie.get('deviceId'),
    //   'supportkey':this.cookie.get('supportKey'),
    //   'Token': this.cookie.get('token'),
    //     });
    //     this.options = {
    //   headers: this.httpHeaders
    // };

    // data.CLIENT_ID=this.clientId
    return this.httpClient.post<any>(
      this.baseUrl + 'web/pickupLocation/get/',
      JSON.stringify(data),
      {
        headers: headers,
      }
    );
  }
}
