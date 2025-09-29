import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Renderer2,
  ViewChild,
  ViewChildren,
  QueryList,
  HostListener,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { ModalService } from 'src/app/Service/modal.service';
import { CookieService } from 'ngx-cookie-service';
import { CartService } from 'src/app/Service/cart.service';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { registerdata } from '../login/login/login.component';
import { NgForm } from '@angular/forms';
import { LoaderService } from 'src/app/Service/loader.service';
import { DatePipe, Location } from '@angular/common';
// import { parsePhoneNumberFromString } from 'libphonenumber-js';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  isCartVisible = false;
  IMAGEuRL: any;

  constructor(
    private router: Router,
    private modalservice: ModalService,
    private api: ApiServiceService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private cartService: CartService,
    private loaderService: LoaderService,
    private location: Location,
    private modalService1: ModalService,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {}
  user = {
    NAME: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    locality: '',
    landmark: '',
    addressId: '',
    pincode: '',
    ID: '',
    password: '', // Add password for display
    PROFILE_URL: '',
  };
  goToLogin() {
    // this.router.navigate(['/login']);
    this.isMobileMenuOpen = false; // Close mobile menu when login is clicked
    this.showLoginModal();
    this.modalservice.openModal();
    console.log('vbnm');
    this.IMAGEuRL = this.api.retriveimgUrl2();
  }

  favouriteCount: any = 0;
  updateFavouritesCount() {
    this.favouriteCount = localStorage.getItem('totalFavourites') || 0;
  }

  // isLogged :boolean (){
  //   return
  //   sessionStorage.getItem('userId') == null ||sessionStorage.getItem('userId') ==''
  // }
  //   isLogged(): boolean {
  //   return !(sessionStorage.getItem('userId') == null || sessionStorage.getItem('userId') === '');
  // }
  get isLogged(): boolean {
    return (
      sessionStorage.getItem('userId') !== null &&
      sessionStorage.getItem('userId') !== ''
    );
  }

  public commonFunction = new CommonFunctionService();

  // logout(){
  //     this.api
  //       .logout()
  //       .subscribe({
  //         next: (successCode: any) => {
  //           if (successCode.code == '200') {
  //             // console.log(this.data, 'iotrriuuiyoio');
  //               sessionStorage.clear();
  //             // this.isloginSendOTP = false;
  //             // this.modalService1.closeModal();
  //             // this.otpSent = true;
  //             // this.showOtpModal = true;
  //             // this.USER_ID = successCode.USER_ID;
  //             // this.USER_NAME = successCode.USER_NAME;

  //             // this.remainingTime = 60;
  //             // this.startTimer();
  //             // this.toastr.success('OTP Sent Successfully...', '');
  //             // this.modalVisible = false;
  //             // this.openRegister = false;
  //             // sessionStorage.setItem('USER_ID', successCode.data[0]['UserData'][0].ID)
  //             //             sessionStorage.setItem('userId', this.commonFunction.encryptdata(successCode.data[0]['UserData'][0].ID));
  //             // sessionStorage.setItem('token', successCode.data[0].token);
  //             // this.cookie.set(
  //             //   'token',
  //             //   successCode.token,
  //             //   365,
  //             //   '',
  //             //   '',
  //             //   false,
  //             //   'Strict'
  //             // );
  //             this.router.navigate(['/home'])
  //             // this.openVerify = true;
  //             // this.stopLoader();

  //             this.toastr.success('You have login Successfully!', 'success')
  //           } else if (successCode.code == '400') {
  //             // this.statusCode =
  //             //   'The user is either not registered or has been deactivated.';
  //             // this.stopLoader();
  //           } else {
  //             // this.isloginSendOTP = false;
  //             this.toastr.error('OTP Validation Failed...', '');
  //             // this.stopLoader();
  //           }
  //         },
  //         error: (error) => {
  //           // console.log('error', error);
  //           // this.stopLoader();
  //           // // Handle error if login fails
  //           if (error.status === 400) {
  //             // this.statusCode =
  //             //   'The user is either not registered or has been deactivated.';
  //             // this.toastr.info(
  //             //   'The user is either not registered or has been deactivated.',
  //             //   ''
  //             // );
  //           } else {
  //             // this.toastr.error('Error sending OTP', '');
  //           }
  //           // this.isloginSendOTP = false;

  //           // this.stopLoader();
  //         },
  //       });
  // }

  logout() {
    const customerId = this.commonFunction.decryptdata(
      sessionStorage.getItem('userId') || ''
    );

    this.api.logout(customerId).subscribe({
      next: (successCode: any) => {
        if (successCode.code == '200') {
          // ✅ Clear session storage
          sessionStorage.removeItem('userId');
          sessionStorage.removeItem('token');
          this.cookie.delete('token');

          this.toastr.success('You have logged out successfully!', 'Success');
          this.router.navigate(['/home']);
        } else {
          this.toastr.error('Logout failed!', '');
        }
      },
      error: (error) => {
        this.toastr.error('Logout error!', '');
      },
    });
  }

  confirmLogout() {
    // Your logout logic here
    this.logout(); // or any logout function you already have
  }
  isMenuOpen: boolean = false;
  isMobileMenuOpen = false;
  cartCount: number = 0;
  isGuest: any = false;
  goBack(): void {
    // // const loginModalEl = document.getElementById('loginmodal');

    // document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    const loginModalEl: any = document.getElementById('loginmodal');
    this.renderer.removeClass(document.body, 'modal-open');
    document.body.classList.remove('modal-open');
    // console.log(loginModalEl);
    loginModalEl.addEventListener('hidden.bs.modal', () => {
      document.body.style.overflow = ''; // reset to default
      document.body.style.overflowX = 'hidden';

      document.body.style.paddingRight = ''; // reset scrollbar padding
    });
    const modalInstance =
      bootstrap.Modal.getInstance(loginModalEl) ||
      new bootstrap.Modal(loginModalEl);
    modalInstance.hide();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.style.overflow = '';
    document.body.style.overflowX = 'hidden';
    // console.log(modalInstance, 'modalInstance');

    // modalInstance._backdrop._config.rootElement.attributes[1].value='overflow:auto'
    let isGuest: any = false;
    if (sessionStorage.getItem('IS_GUEST')) {
      isGuest = sessionStorage.getItem('IS_GUEST');
      this.isGuest = isGuest;
    } else {
      sessionStorage.setItem('IS_GUEST', 'true');
      this.isGuest = isGuest;
    }
    this.router.navigate(['/home']); // fallback
  }
  ngOnInit() {
    this.isGuest = false;
    let euserID = sessionStorage.getItem('userId') || '';
    let etoken = sessionStorage.getItem('token') || '';
    if (euserID && etoken) {
      let userID = this.commonFunction.decryptdata(euserID);
      let token = etoken;
      this.cartService.fetchCartFromServer(userID, token);
      this.getUserData();
    }
    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });
    this.favouriteCount = localStorage.getItem('totalFavourites') || 0;
    window.addEventListener(
      'favouritesUpdated',
      this.updateFavouritesCount.bind(this)
    );
    // if(this.)
    // const userId = sessionStorage.getItem('userId');
  }
  //code by sanjana

  isSearchModalOpen = false;
  searchText: string = '';
  pageIndex = 1;
  pageSize = 10;
  sortKey: string = 'id';
  sortValue: string = 'desc';
  loadingRecords = false;
  totalRecords = 1;
  selectedOption: string = 'A';
  selectedValue: any;
  productList: any = [];
  categoryList: any = [];

  keyup(keys: any) {
    const element = window.document.getElementById('button');
    if (element != null) element.focus();
    if (this.searchText.length >= 3 && keys.key === 'Enter') {
      this.search();
    } else if (this.searchText.length === 0 && keys.key == 'Backspace') {
      this.search();
    }
  }

  onEnterKey(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();
  }

  search() {
    if (this.searchText.length < 3 && this.searchText.length !== 0) {
      return;
    }

    let filter = '';
    let TYPE = this.selectedValue || 'A';

    if (TYPE === 'A') {
      filter += '';
    } else if (TYPE === 'C') {
      filter += `'%${this.searchText}%'`;
    } else if (TYPE === 'P') {
      filter += `'%${this.searchText}%'`;
    }

    var sort: string;
    try {
      sort = this.sortValue.startsWith('a') ? 'asc' : 'desc';
    } catch (error) {
      sort = '';
    }

    this.api
      .getGlobalSearchData(
        this.pageIndex,
        this.pageSize,
        this.sortKey,
        sort,
        this.searchText,
        TYPE
      )
      .subscribe(
        (data) => {
          if (data['code'] == 200) {
            this.loadingRecords = false;
            this.totalRecords = data['count'];
            this.productList = data['data'][1];
            this.categoryList = data['data'][0];
          } else if (data['code'] == 400) {
            this.loadingRecords = false;

            this.toastr.error('Invalid filter parameter', '');
          } else {
            this.loadingRecords = false;
            this.toastr.error('Something Went Wrong ...', '');
          }
        },
        (err: HttpErrorResponse) => {
          this.loadingRecords = false;
          if (err.status === 0) {
            this.toastr.error('Unable to connect. try again .', '');
          }
        }
      );
  }

  onCategoryChange(event: Event) {
    this.selectedValue = (event.target as HTMLSelectElement).value;
  }

  //   dataList = {
  //   "categories": [
  //     {
  //       "categoryName": "Skincare",
  //       "categoryImage": "assets/img/cream.jpg"
  //     },
  //     {
  //       "categoryName": "Haircare",
  //       "categoryImage": "assets/img/cream.jpg"
  //     },
  //     {
  //       "categoryName": "Wellness",
  //       "categoryImage": "assets/img/cream.jpg"
  //     },
  //     {
  //       "categoryName": "Nutrition",
  //       "categoryImage": "assets/img/cream.jpg"
  //     },
  //     {
  //       "categoryName": "Makeup",
  //       "categoryImage": "assets/img/cream.jpg"
  //     },
  //     {
  //       "categoryName": "Personal Hygiene",
  //       "categoryImage": "https://example.com/images/categories/hygiene.jpg"
  //     }
  //   ],
  //   "products": [
  //     {
  //       "productName": "Aloe Vera Face Gel",
  //       "productImage": "https://example.com/images/products/aloe-vera-gel.jpg"
  //     },
  //     {
  //       "productName": "Herbal Shampoo",
  //       "productImage": "https://example.com/images/products/herbal-shampoo.jpg"
  //     },
  //     {
  //       "productName": "Vitamin C Serum",
  //       "productImage": "https://example.com/images/products/vitamin-c-serum.jpg"
  //     },
  //     {
  //       "productName": "Organic Protein Powder",
  //       "productImage": "https://example.com/images/products/protein-powder.jpg"
  //     },
  //     {
  //       "productName": "Lip Balm",
  //       "productImage": "https://example.com/images/products/lip-balm.jpg"
  //     },
  //     {
  //       "productName": "Neem Face Wash",
  //       "productImage": "https://example.com/images/products/neem-face-wash.jpg"
  //     },
  //     {
  //       "productName": "Natural Deodorant",
  //       "productImage": "https://example.com/images/products/deodorant.jpg"
  //     }
  //   ]
  // }

  mobileNumberorEmail: string = '';
  selectedCountryCode: string = '+1';
  inputType: 'initial' | 'mobile' | 'email' = 'initial';
  data: registerdata = new registerdata();
  searchQuery: string = '';
  filteredCountryCodes: any[] = [];
  showCountryDropdown: boolean = false;
  registrationSubmitted = false;
  isloginSendOTP: boolean = false;

  loginSubmitted: boolean = false;

  forgotpass1: boolean = false;
  modalVisible: boolean = false;
  openRegister: boolean = false;
  issignUpLoading: boolean = false;
  whichOTP = '';
  isLoggedIn: boolean = false;
  dataLoaded: boolean = false;

  type: any;
  USER_ID: any;
  USER_NAME: any;
  emailPattern: RegExp =
    /^(?!.*\.\..*)(?!.*--.*)(?!.*-\.|-\@|\.-|\@-)[a-zA-Z0-9]([a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;

  // forgotpassModal() {
  //   this.forgotpass1 = true;
  //   this.modalVisible = false;
  //   this.openRegister = false;
  //   this.forgotpass1 = false;
  //   // console.log(this.forgotpass1, ' this.forgotpass ');
  //   this.api.changeForgotPasswordBehaviorSubject(true);
  //   this.router.navigate(['/forgot-password']);

  // }

  forgotpassModal() {
    // Get a reference to the login modal element
    const loginModalEl = document.getElementById('loginmodal');

    // Check if the modal element exists and hide it using Bootstrap's modal function
    if (loginModalEl) {
      // This is the correct way to hide a Bootstrap modal programmatically
      (window as any).bootstrap.Modal.getInstance(loginModalEl)?.hide();
    }
    this.router.navigate(['/forgot-password']);
  }

  selectCountry(country: any) {
    this.selectedCountryCode = country.value;
    this.data.COUNTRY_CODE = this.selectedCountryCode;
    this.showCountryDropdown = false;
    this.searchQuery = '';
  }

  onIdentifierInput(event: any) {
    const value = event.target.value;
    // console.log(this.mobileNumberorEmail, 'mobileoremail');
    // console.log(event, 'event');
    if (!value || value.length < 3) {
      this.inputType = 'initial';
      return;
    }

    // Check if input contains letters
    if (/[a-zA-Z]/.test(value)) {
      this.inputType = 'email';
    } else {
      this.inputType = 'mobile';
    }
  }
  // onIdentifierInput(event: any) {
  //   let value: string = event.target.value;
  //   console.log(this.mobileNumberorEmail, 'mobileoremail');
  //   console.log(event, 'event');

  //   if (!value || value.length < 3) {
  //     this.inputType = 'initial';
  //     return;
  //   }

  //   // Check if input contains letters → email
  //   if (/[a-zA-Z]/.test(value)) {
  //     this.inputType = 'email';
  //     return;
  //   }

  //   // Otherwise → mobile
  //   this.inputType = 'mobile';

  //   try {
  //     // ✅ Detect country code from the first few digits
  //     if (value.startsWith('00')) {
  //       value = '+' + value.substring(2); // normalize 00 → +
  //     }

  //     const firstFour = value.substring(0, 4);
  //     const match = this.countryCodes.find((c) =>
  //       firstFour.startsWith(c.value)
  //     );

  //     if (match) {
  //       this.selectedCountryCode = match.value;
  //     }
  //   } catch (err) {
  //     console.warn('Error detecting country code:', err);
  //   }
  // }

  // onIdentifierInput(event: any) {
  //   let value: string = event.target.value;

  //   if (!value || value.length < 3) {
  //     this.inputType = 'initial';
  //     return;
  //   }

  //   // Check if input contains letters → email
  //   if (/[a-zA-Z]/.test(value)) {
  //     this.inputType = 'email';
  //     return;
  //   }

  //   // Otherwise → mobile
  //   this.inputType = 'mobile';

  //   try {
  //     // Normalize numbers starting with 00 → +
  //     if (value.startsWith('00')) {
  //       value = '+' + value.substring(2);
  //     }

  //     // Parse number with libphonenumber-js
  //     const phoneNumber = parsePhoneNumberFromString(value);
  //     if (phoneNumber) {
  //       const dialCode = '+' + phoneNumber.countryCallingCode;

  //       // update selectedCountryCode if found in your list
  //       const match = this.countryCodes.find((c) => c.value === dialCode);
  //       if (match) {
  //         this.selectedCountryCode = match.value;
  //       }
  //     }
  //   } catch (err) {
  //     console.warn('Error detecting country code:', err);
  //   }
  // }
  handleKeyPress(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    } else if (this.inputType === 'mobile') {
      this.commonFunction.onlynum(event);
    }
  }

  getPlaceholder() {
    return this.inputType === 'email'
      ? 'Enter email address'
      : this.inputType === 'mobile'
      ? 'Enter mobile number'
      : 'Enter email or mobile number';
  }

  showRegisterModal() {
    this.registrationSubmitted = false;
    this.isloginSendOTP = false;
    this.issignUpLoading = false;
    this.selectedCountryCode = '+1';
    this.statusCode = '';
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    // document.body.style.overflow = 'auto';
    document.body.style.overflow = '';
    document.body.style.overflowX = 'hidden';
    this.router.navigate(['/login']);
    sessionStorage.setItem('IS_REGISTER', 'true');
    this.modalVisible = false;
    this.openRegister = true;
  }

  countryCodes = [
    { label: '+91 (India)', value: '+91' },
    { label: '+92 (Pakistan)', value: '+92' },
    { label: '+93 (Afghanistan)', value: '+93' },
    { label: '+94 (Sri Lanka)', value: '+94' },
    { label: '+95 (Myanmar)', value: '+95' },
    { label: '+1 (United States)', value: '+1' },
    { label: '+1-242 (Bahamas)', value: '+1-242' },
    { label: '+1-246 (Barbados)', value: '+1-246' },
    { label: '+1-264 (Anguilla)', value: '+1-264' },
    { label: '+1-268 (Antigua and Barbuda)', value: '+1-268' },
    { label: '+1-284 (British Virgin Islands)', value: '+1-284' },
    { label: '+1-340 (U.S. Virgin Islands)', value: '+1-340' },
    { label: '+1-345 (Cayman Islands)', value: '+1-345' },
    { label: '+1-441 (Bermuda)', value: '+1-441' },
    { label: '+1-473 (Grenada)', value: '+1-473' },
    { label: '+1-649 (Turks and Caicos Islands)', value: '+1-649' },
    { label: '+1-664 (Montserrat)', value: '+1-664' },
    { label: '+1-670 (Northern Mariana Islands)', value: '+1-670' },
    { label: '+1-671 (Guam)', value: '+1-671' },
    { label: '+1-684 (American Samoa)', value: '+1-684' },
    { label: '+1-721 (Sint Maarten)', value: '+1-721' },
    { label: '+1-758 (Saint Lucia)', value: '+1-758' },
    { label: '+1-767 (Dominica)', value: '+1-767' },
    { label: '+1-784 (Saint Vincent and the Grenadines)', value: '+1-784' },
    { label: '+1-787 (Puerto Rico)', value: '+1-787' },
    { label: '+1-809 (Dominican Republic)', value: '+1-809' },
    { label: '+1-829 (Dominican Republic)', value: '+1-829' },
    { label: '+1-849 (Dominican Republic)', value: '+1-849' },
    { label: '+1-868 (Trinidad and Tobago)', value: '+1-868' },
    { label: '+1-869 (Saint Kitts and Nevis)', value: '+1-869' },
    { label: '+1-876 (Jamaica)', value: '+1-876' },
    { label: '+1-939 (Puerto Rico)', value: '+1-939' },
    { label: '+20 (Egypt)', value: '+20' },
    { label: '+211 (South Sudan)', value: '+211' },
    { label: '+212 (Morocco)', value: '+212' },
    { label: '+213 (Algeria)', value: '+213' },
    { label: '+216 (Tunisia)', value: '+216' },
    { label: '+218 (Libya)', value: '+218' },
    { label: '+220 (Gambia)', value: '+220' },
    { label: '+221 (Senegal)', value: '+221' },
    { label: '+222 (Mauritania)', value: '+222' },
    { label: '+223 (Mali)', value: '+223' },
    { label: '+224 (Guinea)', value: '+224' },
    { label: '+225 (Ivory Coast)', value: '+225' },
    { label: '+226 (Burkina Faso)', value: '+226' },
    { label: '+227 (Niger)', value: '+227' },
    { label: '+228 (Togo)', value: '+228' },
    { label: '+229 (Benin)', value: '+229' },
    { label: '+230 (Mauritius)', value: '+230' },
    { label: '+231 (Liberia)', value: '+231' },
    { label: '+232 (Sierra Leone)', value: '+232' },
    { label: '+233 (Ghana)', value: '+233' },
    { label: '+234 (Nigeria)', value: '+234' },
    { label: '+235 (Chad)', value: '+235' },
    { label: '+236 (Central African Republic)', value: '+236' },
    { label: '+237 (Cameroon)', value: '+237' },
    { label: '+238 (Cape Verde)', value: '+238' },
    { label: '+239 (Sao Tome and Principe)', value: '+239' },
    { label: '+240 (Equatorial Guinea)', value: '+240' },
    { label: '+241 (Gabon)', value: '+241' },
    { label: '+242 (Republic of the Congo)', value: '+242' },
    { label: '+243 (Democratic Republic of the Congo)', value: '+243' },
    { label: '+244 (Angola)', value: '+244' },
    { label: '+245 (Guinea-Bissau)', value: '+245' },
    { label: '+246 (British Indian Ocean Territory)', value: '+246' },
    { label: '+248 (Seychelles)', value: '+248' },
    { label: '+249 (Sudan)', value: '+249' },
    { label: '+250 (Rwanda)', value: '+250' },
    { label: '+251 (Ethiopia)', value: '+251' },
    { label: '+252 (Somalia)', value: '+252' },
    { label: '+253 (Djibouti)', value: '+253' },
    { label: '+254 (Kenya)', value: '+254' },
    { label: '+255 (Tanzania)', value: '+255' },
    { label: '+256 (Uganda)', value: '+256' },
    { label: '+257 (Burundi)', value: '+257' },
    { label: '+258 (Mozambique)', value: '+258' },
    { label: '+260 (Zambia)', value: '+260' },
    { label: '+261 (Madagascar)', value: '+261' },
    { label: '+262 (Reunion)', value: '+262' },
    { label: '+263 (Zimbabwe)', value: '+263' },
    { label: '+264 (Namibia)', value: '+264' },
    { label: '+265 (Malawi)', value: '+265' },
    { label: '+266 (Lesotho)', value: '+266' },
    { label: '+267 (Botswana)', value: '+267' },
    { label: '+268 (Eswatini)', value: '+268' },
    { label: '+269 (Comoros)', value: '+269' },
    { label: '+27 (South Africa)', value: '+27' },
    { label: '+290 (Saint Helena)', value: '+290' },
    { label: '+291 (Eritrea)', value: '+291' },
    { label: '+297 (Aruba)', value: '+297' },
    { label: '+298 (Faroe Islands)', value: '+298' },
    { label: '+299 (Greenland)', value: '+299' },
    { label: '+30 (Greece)', value: '+30' },
    { label: '+31 (Netherlands)', value: '+31' },
    { label: '+32 (Belgium)', value: '+32' },
    { label: '+33 (France)', value: '+33' },
    { label: '+34 (Spain)', value: '+34' },
    { label: '+350 (Gibraltar)', value: '+350' },
    { label: '+351 (Portugal)', value: '+351' },
    { label: '+352 (Luxembourg)', value: '+352' },
    { label: '+353 (Ireland)', value: '+353' },
    { label: '+354 (Iceland)', value: '+354' },
    { label: '+355 (Albania)', value: '+355' },
    { label: '+356 (Malta)', value: '+356' },
    { label: '+357 (Cyprus)', value: '+357' },
    { label: '+358 (Finland)', value: '+358' },
    { label: '+359 (Bulgaria)', value: '+359' },
    { label: '+36 (Hungary)', value: '+36' },
    { label: '+370 (Lithuania)', value: '+370' },
    { label: '+371 (Latvia)', value: '+371' },
    { label: '+372 (Estonia)', value: '+372' },
    { label: '+373 (Moldova)', value: '+373' },
    { label: '+374 (Armenia)', value: '+374' },
    { label: '+375 (Belarus)', value: '+375' },
    { label: '+376 (Andorra)', value: '+376' },
    { label: '+377 (Monaco)', value: '+377' },
    { label: '+378 (San Marino)', value: '+378' },
    { label: '+379 (Vatican City)', value: '+379' },
    { label: '+380 (Ukraine)', value: '+380' },
    { label: '+381 (Serbia)', value: '+381' },
    { label: '+382 (Montenegro)', value: '+382' },
    { label: '+383 (Kosovo)', value: '+383' },
    { label: '+385 (Croatia)', value: '+385' },
    { label: '+386 (Slovenia)', value: '+386' },
    { label: '+387 (Bosnia and Herzegovina)', value: '+387' },
    { label: '+389 (North Macedonia)', value: '+389' },
    { label: '+39 (Italy)', value: '+39' },
    { label: '+40 (Romania)', value: '+40' },
    { label: '+41 (Switzerland)', value: '+41' },
    { label: '+420 (Czech Republic)', value: '+420' },
    { label: '+421 (Slovakia)', value: '+421' },
    { label: '+423 (Liechtenstein)', value: '+423' },
    { label: '+43 (Austria)', value: '+43' },
    { label: '+44 (United Kingdom)', value: '+44' },
    { label: '+44-1481 (Guernsey)', value: '+44-1481' },
    { label: '+44-1534 (Jersey)', value: '+44-1534' },
    { label: '+44-1624 (Isle of Man)', value: '+44-1624' },
    { label: '+45 (Denmark)', value: '+45' },
    { label: '+46 (Sweden)', value: '+46' },
    { label: '+47 (Norway)', value: '+47' },
    { label: '+48 (Poland)', value: '+48' },
    { label: '+49 (Germany)', value: '+49' },
    { label: '+500 (Falkland Islands)', value: '+500' },
    { label: '+501 (Belize)', value: '+501' },
    { label: '+502 (Guatemala)', value: '+502' },
    { label: '+503 (El Salvador)', value: '+503' },
    { label: '+504 (Honduras)', value: '+504' },
    { label: '+505 (Nicaragua)', value: '+505' },
    { label: '+506 (Costa Rica)', value: '+506' },
    { label: '+507 (Panama)', value: '+507' },
    { label: '+508 (Saint Pierre and Miquelon)', value: '+508' },
    { label: '+509 (Haiti)', value: '+509' },
    { label: '+51 (Peru)', value: '+51' },
    { label: '+52 (Mexico)', value: '+52' },
    { label: '+53 (Cuba)', value: '+53' },
    { label: '+54 (Argentina)', value: '+54' },
    { label: '+55 (Brazil)', value: '+55' },
    { label: '+56 (Chile)', value: '+56' },
    { label: '+57 (Colombia)', value: '+57' },
    { label: '+58 (Venezuela)', value: '+58' },
    { label: '+590 (Guadeloupe)', value: '+590' },
    { label: '+591 (Bolivia)', value: '+591' },
    { label: '+592 (Guyana)', value: '+592' },
    { label: '+593 (Ecuador)', value: '+593' },
    { label: '+594 (French Guiana)', value: '+594' },
    { label: '+595 (Paraguay)', value: '+595' },
    { label: '+596 (Martinique)', value: '+596' },
    { label: '+597 (Suriname)', value: '+597' },
    { label: '+598 (Uruguay)', value: '+598' },
    { label: '+599 (Netherlands Antilles)', value: '+599' },
    { label: '+60 (Malaysia)', value: '+60' },
    { label: '+61 (Australia)', value: '+61' },
    { label: '+62 (Indonesia)', value: '+62' },
    { label: '+63 (Philippines)', value: '+63' },
    { label: '+64 (New Zealand)', value: '+64' },
    { label: '+65 (Singapore)', value: '+65' },
    { label: 'Thailand (+66)', value: '+66' },
    { label: 'Timor-Leste (+670)', value: '+670' },
    { label: 'Australian External Territories (+672)', value: '+672' },
    { label: 'Brunei (+673)', value: '+673' },
    { label: 'Nauru (+674)', value: '+674' },
    { label: 'Papua New Guinea (+675)', value: '+675' },
    { label: 'Tonga (+676)', value: '+676' },
    { label: 'Solomon Islands (+677)', value: '+677' },
    { label: 'Vanuatu (+678)', value: '+678' },
    { label: 'Fiji (+679)', value: '+679' },
    { label: 'Palau (+680)', value: '+680' },
    { label: 'Wallis and Futuna (+681)', value: '+681' },
    { label: 'Cook Islands (+682)', value: '+682' },
    { label: 'Niue (+683)', value: '+683' },
    { label: 'Samoa (+685)', value: '+685' },
    { label: 'Kiribati (+686)', value: '+686' },
    { label: 'New Caledonia (+687)', value: '+687' },
    { label: 'Tuvalu (+688)', value: '+688' },
    { label: 'French Polynesia (+689)', value: '+689' },
    { label: 'Tokelau (+690)', value: '+690' },
    { label: 'Micronesia (+691)', value: '+691' },
    { label: 'Marshall Islands (+692)', value: '+692' },
    { label: 'Russia (+7)', value: '+7' },
    { label: 'Kazakhstan (+7)', value: '+7' },
    { label: 'Japan (+81)', value: '+81' },
    { label: 'South Korea (+82)', value: '+82' },
    { label: 'Vietnam (+84)', value: '+84' },
    { label: 'North Korea (+850)', value: '+850' },
    { label: 'Hong Kong (+852)', value: '+852' },
    { label: 'Macau (+853)', value: '+853' },
    { label: 'Cambodia (+855)', value: '+855' },
    { label: 'Laos (+856)', value: '+856' },
    { label: 'China (+86)', value: '+86' },
    { label: 'Bangladesh (+880)', value: '+880' },
    { label: 'Taiwan (+886)', value: '+886' },
    { label: 'Turkey (+90)', value: '+90' },
    { label: 'Maldives (+960)', value: '+960' },
    { label: 'Lebanon (+961)', value: '+961' },
    { label: 'Jordan (+962)', value: '+962' },
    { label: 'Syria (+963)', value: '+963' },
    { label: 'Iraq (+964)', value: '+964' },
    { label: 'Kuwait (+965)', value: '+965' },
    { label: 'Saudi Arabia (+966)', value: '+966' },
    { label: 'Yemen (+967)', value: '+967' },
    { label: 'Oman (+968)', value: '+968' },
    { label: 'Palestine (+970)', value: '+970' },
    { label: 'United Arab Emirates (+971)', value: '+971' },
    { label: 'Israel (+972)', value: '+972' },
    { label: 'Bahrain (+973)', value: '+973' },
    { label: 'Qatar (+974)', value: '+974' },
    { label: 'Bhutan (+975)', value: '+975' },
    { label: 'Mongolia (+976)', value: '+976' },
    { label: 'Nepal (+977)', value: '+977' },
    { label: 'Iran (+98)', value: '+98' },
    { label: 'Tajikistan (+992)', value: '+992' },
    { label: 'Turkmenistan (+993)', value: '+993' },
    { label: 'Azerbaijan (+994)', value: '+994' },
    { label: 'Georgia (+995)', value: '+995' },
    { label: 'Kyrgyzstan (+996)', value: '+996' },
    { label: 'Uzbekistan (+998)', value: '+998' },
  ];

  filterCountries(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.searchQuery = query;
    this.filteredCountryCodes = this.countryCodes.filter(
      (country) =>
        country.label.toLowerCase().includes(query) ||
        country.value.toLowerCase().includes(query)
    );
  }

  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
    console.log('showCountryDropdown: ', this.showCountryDropdown);

    if (this.showCountryDropdown) {
      console.log('showCountryDropdown: ', this.showCountryDropdown);
      this.filteredCountryCodes = [...this.countryCodes]; // Create a new array copy
      this.searchQuery = '';
    }
  }

  // Close-on-outside-click support for any country dropdown instance in this component
  @ViewChildren('dropdownWrapper') dropdownWrappers!: QueryList<ElementRef>;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.showCountryDropdown) return;
    const target = event.target as Node;
    const wrappers = this.dropdownWrappers
      ? this.dropdownWrappers.toArray()
      : [];
    const clickedInside = wrappers.some((ref) =>
      ref.nativeElement.contains(target)
    );
    if (!clickedInside) {
      this.showCountryDropdown = false;
      this.searchQuery = '';
    }
  }

  private isEmail(value: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(value);
  }
  statusCode: any = '';
  loadData() {
    this.loaderService.showLoader();
  }

  stopLoader() {
    this.dataLoaded = true;
    this.loaderService.hideLoader();
  }

  loginotpverification(form?: NgForm): void {
    this.loginSubmitted = true;
    // sessionStorage.clear()
    // console.log(document.body.cla);

    // if (form && form.invalid) {
    //   if (form && form.invalid) {
    //     Object.values(form.controls).forEach((control) => {
    //       control.markAsTouched(); // This triggers error messages to show
    //     });
    //     this.loginSubmitted = false;

    //     return;
    //   }
    //   return;
    // }

    if (!this.data.PASSWORD && !this.mobileNumberorEmail) {
      this.toastr.error('Please Fill All The Required Fields ', '');
      return;
    } else if (
      !this.mobileNumberorEmail ||
      this.mobileNumberorEmail === '' ||
      this.mobileNumberorEmail == null ||
      this.mobileNumberorEmail == undefined
    ) {
      const fieldName =
        this.inputType === 'email'
          ? 'your email address'
          : this.inputType === 'mobile'
          ? 'your mobile number'
          : 'email or mobile number';

      this.toastr.error(`Please enter ${fieldName}.`, '');
    } else if (
      this.inputType === 'email' &&
      !this.commonFunction.emailpattern.test(this.mobileNumberorEmail)
    ) {
      this.toastr.error(`Please enter valid email address.`, '');
    }
    // else if (
    //   this.inputType === 'mobile' &&
    //   !this.commonFunction.mobpattern.test(this.mobileNumberorEmail)
    // ) {
    //   this.toastr.error(`Please enter valid Mobile No.`, '');
    // }
    else if (
      !this.data.PASSWORD ||
      this.data.PASSWORD == 0 ||
      this.data.PASSWORD == null ||
      this.data.PASSWORD == undefined
    ) {
      this.toastr.error('Please enter password.', '');
    } else {
      // Determine type based on input value
      this.type = this.isEmail(this.mobileNumberorEmail) ? 'E' : 'M';
      this.isloginSendOTP = true;
      this.statusCode = '';
      // this.whichOTP = 'login';
      // this.loadData();

      this.api
        .login(
          (this.USER_NAME = this.mobileNumberorEmail),
          (this.type = this.type),
          this.data.PASSWORD
        )
        .subscribe({
          next: (successCode: any) => {
            if (successCode.code == '200') {
              // console.log(successCode, 'successCode');
              this.stopLoader();
              // form?.resetForm();
              // console.log(this.data, 'iotrriuuiyoio');

              this.isloginSendOTP = false;
              // this.modalService1.closeModal();
              // document.body.classList.remove('modal-open');
              // document
              //   .querySelectorAll('.modal-backdrop')
              //   .forEach((el) => el.remove());
              const loginModalEl: any = document.getElementById('loginmodal');
              loginModalEl.addEventListener('hidden.bs.modal', () => {
                document.body.style.overflow = ''; // reset to default
                document.body.style.overflowX = 'hidden';
                document.body.style.paddingRight = ''; // reset scrollbar padding
              });
              document.body.style.overflow = '';
              document.body.style.overflowX = 'hidden';
              const modalInstance =
                bootstrap.Modal.getInstance(loginModalEl) ||
                new bootstrap.Modal(loginModalEl);
              modalInstance.hide();
              this.renderer.removeClass(document.body, 'modal-open');
              document.body.classList.remove('modal-open');
              // const loginModalEl = document.getElementById('loginmodal');

              document
                .querySelectorAll('.modal-backdrop')
                .forEach((el) => el.remove());
              // this.otpSent = true;
              // this.showOtpModal = true;
              // this.USER_ID = successCode.USER_ID;
              this.USER_NAME = successCode.USER_NAME;

              // this.remainingTime = 60;
              // this.startTimer();
              // this.toastr.success('OTP Sent Successfully...', '');
              // this.modalVisible = false;
              // this.openRegister = false;
              // sessionStorage.setItem('USER_ID', successCode.data[0]['UserData'][0].ID)
              sessionStorage.setItem(
                'userId',
                this.commonFunction.encryptdata(
                  successCode.data[0]['UserData'][0].ID
                )
              );
              sessionStorage.setItem('token', successCode.data[0].token);
              this.cookie.set(
                'token',
                successCode.data[0].token,
                365,
                '',
                '',
                false,
                'Strict'
              );

              // this.modalservice.closeModal();

              this.inputType = 'initial';

              // console.log(this.isLoggedIn, 'this.isLoggedIn');
              this.toastr.success('You have login Successfully!', 'success');
            } else if (successCode.code == '404') {
              // form?.resetForm();
              this.toastr.error(
                'Account not found. Please register to continue.',
                ''
              );
              this.isloginSendOTP = false;
              // this.stopLoader();
            } else if (successCode.code == '401') {
              // form?.resetForm();
              this.toastr.error('Incorrect username or password', '');
              this.isloginSendOTP = false;
              // this.stopLoader();
            } else {
              this.isloginSendOTP = false;
              this.toastr.error('OTP Validation Failed...', '');
              this.stopLoader();
            }
          },
          error: (error) => {
            if (error.status === 400) {
            } else {
              // this.toastr.error('Error sending OTP', '');
            }
            // this.isloginSendOTP = false;

            // this.stopLoader();
          },
        });
    }
  }

  //by sanjana
  goToProductDetails(id: number) {
    this.router.navigateByUrl(`/product_details/${id}`);
    this.isSearchModalOpen = false;
    this.isMobileMenuOpen = false; // Close mobile menu when navigating to product details
  }

  goToProductList(categoryid: number) {
    this.router.navigateByUrl(`/product-list/${categoryid}`);
    this.isSearchModalOpen = false;
    this.isMobileMenuOpen = false; // Close mobile menu when navigating to product list
  }

  searchModalOpen() {
    this.router.navigateByUrl(`/home`);
    this.isSearchModalOpen = false;

    this.categoryList = [];
    this.productList = [];
  }

  onSearchChange(value: string) {
    if (!value || value.trim().length === 0) {
      this.categoryList = [];
      this.productList = [];
    }
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }
  imagePreview: string | null = null;

  setDefaultImage(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/user.jpg';
  }
  currentSection: string = 'dashboard-section';
  showLogoutModal = false;
  openprofileModal() {
    console.log('Opening profile modal...');
    this.showModal = true;
    this.renderer.addClass(document.body, 'modal-open');
    this.cdRef.detectChanges();
  }
  showModal: boolean = false;
  goToProfileSection(section: string) {
    // Close mobile menu when profile section is clicked
    this.isMobileMenuOpen = false;

    // Navigate to profile route with query param
    this.router.navigate(['/profile'], {
      queryParams: { section },
    });
  }

  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }
  activeSection: string = 'dashboard-section';
  sidebarOpen = false;
  isMobile = false;
  openModal(): void {
    // Close sidebar on mobile when opening logout modal
    if (this.isMobile) {
      this.sidebarOpen = false;
      document.body.style.overflow = 'auto';
    }
    this.showLogoutModal = true;
  }

  proceedLogout(): void {
    const customerId = this.commonFunction.decryptdata(
      sessionStorage.getItem('userId') || ''
    );

    this.api.logout(customerId).subscribe({
      next: (successCode: any) => {
        if (successCode.code == '200') {
          // ✅ Clear session storage
          sessionStorage.removeItem('userId');
          sessionStorage.removeItem('token');
          this.cookie.delete('token');

          this.toastr.success('You have logged out successfully!', 'Success');
          this.router.navigate(['/home']);
          this.showLogoutModal = false;
          this.isMobileMenuOpen = false;
        } else {
          this.toastr.error('Failed to logout!', '');
        }
      },
      error: (error) => {
        this.toastr.error('Failed to logout !', '');
      },
    });
  }
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
  showLoginModal() {
    this.mobileNumberorEmail = '';
    this.data.PASSWORD = '';
    this.renderer.removeClass(document.body, 'modal-open');
    document.body.classList.remove('modal-open');
    // const loginModalEl = document.getElementById('loginmodal');

    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    var d: any = document.getElementById('loginmodaltrack') as HTMLElement;
    d.click();
  }

  closeModal() {
    console.log('Closing profile modal...');
    this.showModal = false;
    this.renderer.removeClass(document.body, 'modal-open');
    this.cdRef.detectChanges();
  }

  openCamera() {
    console.log('Opening camera...');

    // Close the photo selection modal first
    this.closeModal();

    // Wait a bit for the modal to close, then open camera modal
    setTimeout(() => {
      // Use Bootstrap modal system for camera modal
      const modal = document.getElementById('CapturePhotoModal');
      if (!modal) {
        console.error('Capture photo modal not found');
        this.toastr.error('Unable to open camera modal.', 'Error');
        return;
      }

      modal.classList.add('fade');
      modal.style.display = 'block';

      setTimeout(() => {
        modal.classList.add('show');
        this.renderer.addClass(document.body, 'modal-open');

        // Initialize camera after modal is shown with longer delay
        setTimeout(() => {
          console.log('Modal should be visible now, initializing camera...');
          this.initializeCameraWithRetry();
        }, 300); // Increased delay for better DOM rendering
      }, 10);
    }, 150); // Wait for photo modal to close
  }

  private initializeCameraWithRetry(attempts: number = 0) {
    const maxAttempts = 10;

    if (attempts >= maxAttempts) {
      console.error('Failed to initialize camera after multiple attempts');
      this.toastr.error(
        'Unable to initialize camera. Please try again.',
        'Camera Error'
      );
      this.closeCapturePhotoModal();
      return;
    }

    // Check if the modal is actually visible
    const modal = document.getElementById('CapturePhotoModal');
    if (!modal) {
      console.log('Modal not found in DOM');
      setTimeout(() => {
        this.initializeCameraWithRetry(attempts + 1);
      }, 200);
      return;
    }

    console.log('Modal found:', modal);
    console.log('Modal display:', modal.style.display);
    console.log('Modal classes:', modal.className);

    // Try ViewChild first, then fall back to direct DOM query
    let video = this.videoElement?.nativeElement;
    console.log('ViewChild video element:', video);

    if (!video) {
      // Fallback: try to find video element directly in the modal
      video = modal.querySelector('video');
      console.log('Video element found via querySelector:', video);
    }

    if (!video) {
      console.log(
        `Video element not ready yet, attempt ${attempts + 1}/${maxAttempts}`
      );
      console.log('Video element ref:', this.videoElement);
      console.log('Modal visible:', modal.style.display !== 'none');
      console.log('Modal classes:', modal.className);
      console.log('Modal HTML:', modal.innerHTML);
      setTimeout(() => {
        this.initializeCameraWithRetry(attempts + 1);
      }, 200);
      return;
    }

    console.log('Video element found, initializing camera...');
    console.log('Video element:', video);
    this.initializeCamera();
  }

  private initializeCamera() {
    // Try ViewChild first, then fall back to direct DOM query
    let video = this.videoElement?.nativeElement;
    if (!video) {
      const modal = document.getElementById('CapturePhotoModal');
      if (modal) {
        video = modal.querySelector('video') as HTMLVideoElement;
      }
    }

    if (!video) {
      console.error('Video element not found');
      this.toastr.error('Video element not found in modal.', 'Camera Error');
      this.closeCapturePhotoModal();
      return;
    }

    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.toastr.error(
        'Camera access is not supported in this browser.',
        'Camera Error'
      );
      this.closeCapturePhotoModal();
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      .then((stream) => {
        console.log('Camera stream obtained successfully');
        this.stream = stream;
        video.srcObject = stream;

        // Wait for video to be ready
        video.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          video.play().catch((err: any) => {
            console.error('Error playing video:', err);
            this.toastr.error('Error starting video stream.', 'Camera Error');
            this.closeCapturePhotoModal();
          });
        };

        video.onerror = (err: any) => {
          console.error('Video error:', err);
          this.toastr.error('Error with video stream.', 'Camera Error');
          this.closeCapturePhotoModal();
        };
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        let errorMessage = 'Unable to access camera.';

        if (err.name === 'NotAllowedError') {
          errorMessage =
            'Camera access denied. Please allow camera permissions and try again.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'Camera is not supported in this browser.';
        }

        this.toastr.error(errorMessage, 'Camera Error');
        this.closeCapturePhotoModal();
      });
  }

  captureImage() {
    // Try ViewChild first, then fall back to direct DOM query
    let video = this.videoElement?.nativeElement;
    let canvas = this.canvasElement?.nativeElement;

    if (!video || !canvas) {
      const modal = document.getElementById('CapturePhotoModal');
      if (modal) {
        if (!video) video = modal.querySelector('video') as HTMLVideoElement;
        if (!canvas)
          canvas = modal.querySelector('canvas') as HTMLCanvasElement;
      }
    }

    if (!video || !canvas) {
      console.error('Video or canvas element not found');
      this.toastr.error('Camera elements not found.', 'Capture Error');
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Canvas context not available');
      this.toastr.error('Canvas context not available.', 'Capture Error');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert Base64 to Blobngoninit
    const base64Data = canvas.toDataURL('image/png');
    this.capturedImage = base64Data;
    // Convert to Blob
    canvas.toBlob((blob: any) => {
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);

        // Extract UUID from Blob URL
        const uuid = blobUrl.split('/').pop();
        const filename = `${uuid}.png`;
        this.user.PROFILE_URL = filename;

        this.uploadImage(blob, filename);
      }
    }, 'image/png');

    // Stop the camera stream
    this.stream.getTracks().forEach((track) => track.stop());

    // Close modal using Bootstrap system
    this.closeCapturePhotoModal();
  }
  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64.split(',')[1]); // Decode Base64
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }

  capturedImage: string | null = null;
  private stream!: MediaStream;
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef;

  closeCapturePhotoModal() {
    const modal = document.getElementById('CapturePhotoModal');
    if (!modal) {
      console.error('Capture photo modal not found for closing');
      return;
    }

    modal.classList.remove('show');

    setTimeout(() => {
      modal.classList.remove('fade');
      modal.style.display = 'none';
    }, 300);

    this.renderer.removeClass(document.body, 'modal-open');

    // Stop the camera stream if it's active
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.capturedImage = null;
    this.clearCanvasAndVideo();
  }

  updateUserProfile(form?: NgForm) {
    if (form && form.invalid) {
      return;
    }
    // if (this.isOk) {
    this.loadData();

    this.user.ID = this.USER_ID;
    this.user.NAME = this.user.NAME;

    this.api.updateUserData(this.user).subscribe(
      (successCode: any) => {
        if (successCode.body.code === 200) {
          this.stopLoader();
          this.toastr.success('Profile Updated Successfully', '');

          sessionStorage.setItem(
            'userName',
            this.commonFunction.encryptdata(this.user.NAME)
          );
          this.getUserData();
        }
        // else if (
        //   successCode.body.code === 300 &&
        //   successCode.body.toastr === 'mobile number already exists.'
        // ) {
        //   this.stopLoader();
        //   this.statusCode = 'mobile number already exists.';
        // } else if (
        //   successCode.body.code === 300 &&
        //   successCode.body.toastr === 'email ID already exists.'
        // ) {
        //   this.stopLoader();
        //   this.statusCode = 'email ID already exists.';
        // }
      },
      (error) => {
        this.stopLoader();
        // Handle error if login fails
        if (error.status === 300) {
          this.stopLoader();
          // Handle specific HTTP error (e.g., invalid credentials)
          this.toastr.error('Email-ID is already exists', '');
        } else if (error.status === 500) {
          // Handle server-side error
          this.toastr.error(
            'An unexpected error occurred. Please try again later.',
            ''
          );
        } else {
          this.stopLoader();
          // Generic error handling
          this.toastr.error(
            'An unknown error occurred. Please try again later.',
            ''
          );
        }
      }
    );
    // }
  }
  fileChangeEvent(event: any) {
    const file = event.target.files[0];
    const maxFileSize = 5 * 1024 * 1024; // 5MB limit
    // this.toastr.success('File size should not exceed 5MB.','');

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.toastr.error(
        'Please select a valid image file (JPG, JPEG, PNG).',
        ''
      );
      return;
    }

    if (file.size > maxFileSize) {
      this.toastr.error('File size should not exceed 5MB.', '');
      return;
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const dateStr = this.datePipe.transform(new Date(), 'yyyyMMdd');
    const filename = `${dateStr}${randomNum}.${fileExt}`;

    // Show preview
    // const reader = new FileReader();
    // reader.onload = (e: any) => {
    //   this.imagePreview = e.target.result;
    // };
    // reader.readAsDataURL(file);

    this.user.PROFILE_URL = filename; // Store the generated filename
    this.uploadImage(file, filename);
  }
  uploadImage(file: File, filename: string) {
    this.isUploading = true;
    this.progressPercent = 0;

    this.api.onUpload('CustomerProfile', file, filename).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressPercent = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.isUploading = false;
          if (event.body?.code === 200) {
            this.toastr.success('Profile photo uploaded successfully.', '');
            // this.data.PROFILE_URL = event.body.fileUrl; // Store uploaded image URL

            this.imagePreview =
              this.IMAGEuRL + 'CustomerProfile/' + this.user.PROFILE_URL;
            this.showModal = true;

            // if (this.showContent == 'normal') {
            this.updateUserProfile();
            // }
            this.closeModal();
            this.clearCanvasAndVideo();
            console.log('this.imagePreview', this.imagePreview);
          } else {
            this.toastr.error('Image upload failed.', '');
            this.imagePreview = null;
            this.user.PROFILE_URL = '';
            this.showModal = false;
          }
        }
      },
      error: () => {
        this.isUploading = false;
        this.toastr.error('Failed to upload image.', '');
        this.imagePreview = null;
        this.user.PROFILE_URL = '';
        this.showModal = false;
      },
    });
  }
  isUploading: boolean = false;
  progressPercent: number = 0;
  clearCanvasAndVideo() {
    // Try ViewChild first, then fall back to direct DOM query
    let canvas = this.canvasElement?.nativeElement;
    let video = this.videoElement?.nativeElement;

    if (!canvas || !video) {
      const modal = document.getElementById('CapturePhotoModal');
      if (modal) {
        if (!canvas)
          canvas = modal.querySelector('canvas') as HTMLCanvasElement;
        if (!video) video = modal.querySelector('video') as HTMLVideoElement;
      }
    }

    // Clear the canvas if it exists
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Stop the camera stream if video element exists
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }

    this.capturedImage = '';
    // Modal is handled by Bootstrap system
  }
  getUserData() {
    this.IMAGEuRL = this.api.retriveimgUrl2();
    // this.loadData();
    this.USER_ID = this.userId
      ? this.commonFunction.decryptdata(this.userId)
      : '0';
    this.api.getUserDetails(Number(this.USER_ID)).subscribe(
      (data) => {
        if (data['code'] == 200) {
          this.stopLoader();
          this.dataList = data['data'];

          // Bind user data dynamically
          if (this.dataList && this.dataList.length > 0) {
            const userData = this.dataList[0];
            this.user = {
              NAME: userData.NAME || '',
              email: userData.EMAIL_ID || '',
              mobile: userData.MOBILE_NO || '',
              address: userData.ADDRESS || '',
              city: userData.CITY || '',
              addressId: '',
              locality: userData.LOCALITY || '',
              landmark: userData.LANDMARK || '',
              pincode: userData.PINCODE || '',
              PROFILE_URL: userData.PROFILE_URL || '',
              ID: this.USER_ID,

              password: userData.PASSWORD || '', // Set password for display
            };
            this.imagePreview =
              this.IMAGEuRL + 'CustomerProfile/' + this.user.PROFILE_URL;
            console.log('this.imagePreview kkkk', this.imagePreview);
          }

          this.cdRef.detectChanges();
        } else {
          this.stopLoader();
          this.cdRef.detectChanges();
          this.dataList = [];
          this.toastr.error('Something Went Wrong ...', '');
        }
      },
      (err: HttpErrorResponse) => {
        this.stopLoader();
        if (err.status === 0) {
          this.toastr.error(
            'Network error: Please check your internet connection.',
            ''
          );
        } else if (err['status'] == 400) {
          this.stopLoader();
          this.toastr.error('Invalid filter parameter', '');
        } else {
          this.toastr.error('Something Went Wrong.', '');
          this.stopLoader();
        }
        this.cdRef.detectChanges();
      }
    );
  }
  dataList: any = [];
  userId = sessionStorage.getItem('userId');
  showPassword: boolean = false;

  PasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
