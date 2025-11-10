import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  Renderer2,
  ViewEncapsulation,
  inject,
  HostListener,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CartService } from 'src/app/Service/cart.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { interval, takeWhile } from 'rxjs';
import { registerdata } from '../login/login/login.component';
// import { interval, takeWhile } from 'rxjs';
import { LoaderService } from 'src/app/Service/loader.service';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { ModalService } from 'src/app/Service/modal.service';
import { CookieService } from 'ngx-cookie-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var bootstrap: any;
@Component({
  selector: 'app-cart-drawer',
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CartDrawerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  isCheckoutVisible = false;
  senddatatoCheckout: any = {};
  loader = true;
  constructor(
    private api: ApiServiceService,
    private cartService: CartService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef,
    private loaderService: LoaderService,
    private modalService1: ModalService,
    private http: HttpClient,
    private router: Router,
    private renderer: Renderer2,
    private cookie: CookieService,
    private elementRef: ElementRef
  ) {} // Replace 'any' with the actual type of your API service
  euserID: string = sessionStorage.getItem('userId') || '';
  etoken: string = sessionStorage.getItem('token') || '';
  userID: string = '';
  // private commonFunction = new CommonFunctionService(); // Assuming this is a service for common functions
  loadingProducts: boolean = true; // Flag to show loader
  SESSION_KEYS: string = sessionStorage.getItem('SESSION_KEYS') || '';
  private modalService: any = inject(NgbModal);
  getLinkLoading: boolean = false;
  linkSent: boolean = false;
  verifyLoading: boolean = false;
  showOtp: boolean = false;

  otp: string[] = ['', '', '', ''];
  otpSent: boolean = false;
  otpVerified: boolean = false;
  resendOTP: boolean = false;
  commonFunctions: CommonFunctionService = new CommonFunctionService();
  countdownTime: number = 60; // Countdown time in seconds
  remainingTime: number = this.countdownTime;
  intervalId: any;

  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  Loading: boolean = false;
  showConfirmPassword: boolean = false;
  showNewPassword: boolean = false;
vareintImageUrl: string = this.api.retriveimgUrl + 'VarientImages/';

  ngOnInit() {
    this.loader = true;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    document.body.classList.add('no-scroll');

    if (this.euserID) {
      this.userID = this.commonFunction.decryptdata(this.euserID);
      this.cartItems = this.cartService.getCartItems();

      this.cartService.cartUpdated$.subscribe((cartItems) => {
        this.cartItems = cartItems;

        this.loadingProducts = false;
        // this.loader = false;
        this.cd.detectChanges();
        this.updateTotals(); // No need to apply selections
      });

      setTimeout(() => {
        this.loader = false;
      }, 200);
    } else {
      this.cartService.fetchCartFromServer(0, this.SESSION_KEYS);
      this.loader = true;

      this.cartService.cartUpdated$.subscribe((cartItems) => {
        this.cartItems = cartItems;
        // this.loader = false;
        if (!this.euserID) {
          sessionStorage.setItem(
            'sessionCart',
            JSON.stringify(this.cartService.getCartItems())
          );
        }
        this.loadingProducts = false;
        this.cd.detectChanges();
        this.updateTotals(); // No need to apply selections
        // this.updateTotals(); // No need to apply selections
      });

      setTimeout(() => {
        this.loader = false;
        this.updateTotals(); // No need to apply selections
      }, 200);
    }

    setTimeout(() => {
      this.loadingProducts = false;
      this.updateTotals(); // No need to apply selections
    }, 500);
  }
  //   @HostListener('document:click', ['$event'])
  // onClickOutside(event: MouseEvent) {
  //   const clickedInside = this.elementRef.nativeElement.contains(event.target);
  //   if (!clickedInside) {
  //     this.close(); // Call your close() method
  //   }
  // }
  onOverlayClick(event: MouseEvent) {
    this.close(); // Call your close() method
  }
  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.router.navigate(['./product-list']);
    // window.location.reload();
  }

  closeLoginModal() {
    this.activeTab = 'login';
    const modalEl = document.getElementById('loginmodal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);

    if (modalInstance) {
      modalInstance.hide();

      // cleanup backdrop
      setTimeout(() => {
        document
          .querySelectorAll('.modal-backdrop')
          .forEach((el) => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }, 300); // fade out duration
    }
  }
  // showLoginModal: boolean = false;
  // onLogin() {
  //   const userId = sessionStorage.getItem('userId');
  //   console.log(userId);

  //   if (!userId) {
  //     this.showLoginModal = true;
  //     this.router.navigateByUrl('login');
  //   } else {
  //     this.showLoginModal = false;
  //     this.proceedToCheckout();
  //   }
  // }

  // onNotNow() {
  //   this.showLoginModal = false;
  // }
  onCheckoutDrawerClose(isVisible: boolean) {
    // console.log('Cart drawer closed:', isVisible);

    this.close();
    this.isCheckoutVisible = isVisible;
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
  getPlaceholder() {
    return this.inputType === 'email'
      ? 'Enter email address'
      : this.inputType === 'mobile'
      ? 'Enter mobile number'
      : 'Enter email or mobile number';
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
  // commonFunctions: CommonFunctionService = new CommonFunctionService();
  public commonFunction = new CommonFunctionService();
  isGuest: any = false;
  goBack(): void {
    // // const loginModalEl = document.getElementById('loginmodal');
    // const modalElement = document.getElementById('loginmodal');
    // const modalInstance =
    //   bootstrap.Modal.getInstance(modalElement!) ||
    //   new bootstrap.Modal(modalElement!);
    // modalInstance.hide();
    // // console.log(loginModalEl);
    // loginModalEl.addEventListener('hidden.bs.modal', () => {
    //   document.body.style.overflow = ''; // reset to default
    //   document.body.style.overflowX = 'hidden';

    //   document.body.style.paddingRight = ''; // reset scrollbar padding
    // });
    // const modalInstance =
    //   bootstrap.Modal.getInstance(loginModalEl) ||
    //   new bootstrap.Modal(loginModalEl);
    // modalInstance.hide();
    // setTimeout(() => {
    //   // Remove all backdrops if stuck
    //   document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());

    //   // Restore scroll
    //   document.body.classList.remove('modal-open');
    //   document.body.style.overflow = '';
    //   document.body.style.paddingRight = '';
    // }, 100);
    // document.addEventListener('hidden.bs.modal', () => {
    //   document.body.classList.remove('modal-open');
    //   document.body.style.overflow = '';
    //   document.body.style.paddingRight = '';
    // });
    // document.body.style.overflow = '';
    // document.body.style.overflowX = 'hidden';
    // console.log(modalInstance, 'modalInstance');

    // modalInstance._backdrop._config.rootElement.attributes[1].value='overflow:auto'
    // let isGuest: any = false;
    if (!sessionStorage.getItem('IS_GUEST')) {
      sessionStorage.setItem('IS_GUEST', this.isGuest);
      // isGuest =sessionStorage.getItem('IS_GUEST');
      // this.isGuest = isGuest;
      // this.isGuest = sessionStorage.getItem('IS_GUEST');
    } else {
      sessionStorage.setItem('IS_GUEST', 'true');
      this.isGuest = sessionStorage.getItem('IS_GUEST');
    }
    this.closeLoginModal();
    // this.router.navigate(['/home']); // fallback
  }
  filterCountries(event: any) {
    const query = event.target.value.toLowerCase().trim();
    this.searchQuery = query;
    this.filteredCountryCodes = this.countryCodes.filter(
      (country) =>
        country.label.toLowerCase().includes(query) ||
        country.value.toLowerCase().includes(query)
    );
  }
  toggleCountryDropdown(event: Event) {
    event.stopPropagation();
    this.showCountryDropdown = !this.showCountryDropdown;
    // console.log('showCountryDropdown: ', this.showCountryDropdown);

    if (this.showCountryDropdown) {
      // console.log('showCountryDropdown: ', this.showCountryDropdown);
      this.filteredCountryCodes = [...this.countryCodes]; // Create a new array copy
      this.searchQuery = '';
    }
  }
  // Sample cart items — you can replace with real data
  @Input() cartItems: any = [];
  // cartItems = [
  //   {
  //     id: 1,
  //     name: 'Ayurvedic Fusion Body Butter',
  //     price: 2100,
  //     quantity: 1,
  //     image:
  //       'https://readdy.ai/api/search-image?query=Ayurvedic%20body%20butter%20cream%20in%20elegant%20glass%20jar%2C%20natural%20ingredients%20visible%2C%20professional%20product%20photography%2C%20soft%20lighting%2C%20minimalist%20style%2C%20clean%20background%2C%20high-end%20cosmetic%20product%20presentation&width=400&height=400&seq=product1&orientation=squarish',
  //   },
  //   {
  //     id: 2,
  //     name: 'Ayurvedic Fusion Face Cream',
  //     price: 2770,
  //     quantity: 1,
  //     image:
  //       'https://readdy.ai/api/search-image?query=Ayurvedic%20face%20cream%20in%20elegant%20glass%20jar%2C%20natural%20ingredients%20visible%2C%20professional%20product%20photography%2C%20soft%20lighting%2C%20minimalist%20style%2C%20clean%20background%2C%20high-end%20cosmetic%20product%20presentation&width=400&height=400&seq=product2&orientation=squarish',
  //   },
  // ];
  producctImageurl: string = this.api.retriveimgUrl + 'productImages/';
  getImageArray(product: any): string {
    try {
      const images = product.Images
        ? JSON.parse(product.Images)
        : JSON.parse(product.PHOTO_URL);
      // console.log(images);
      return images[0].PHOTO_URL ? images[0].PHOTO_URL : images[0];
      // this.producctImageurl+= images[0].PHOTO_URL;
      // return images.map((img: any) => img.PHOTO_URL);
    } catch (e) {
      console.error('Invalid image format', e);
      return '';
    }
  }
  // proceedToCheckout() {
  //   // this.close()
  //   if (this.quantity > this.varientStock) {
  //     this.toastr.error('Maximum quantity reached', 'Error');
  //     return;
  //   } else {
  //     this.isCheckoutVisible = true;
  //     // this.visible=false
  //     this.senddatatoCheckout = {
  //       cartDetails: this.cartItems,
  //       subtotal: this.subtotal,
  //     };
  //   }
  //   // console.log('Proceeding to checkout with data:', this.senddatatoCheckout);
  //   // Emit the data to the parent component or handle it as needed
  // }
  varientStock = 0;
  quantity = 0;
  maxQuantity = 0;

  // Helper function to map selections (assuming 'ID' is the unique identifier)
  // Assuming this is part of your component class

  mapCurrentSelections(): Map<any, boolean> {
    const selectionMap = new Map<any, boolean>();
    this.cartItems.forEach((item: any) => {
      // Use the product's unique ID as the key
      const uniqueId = item.ID || item.PRODUCT_ID; // Adjust this based on your actual unique key
      if (uniqueId) {
        selectionMap.set(uniqueId, item.selected);
      }
    });
    return selectionMap;
  }

  // Function to apply selections to the new cart items
  applySelections(newCartItems: any[], selectionMap: Map<any, boolean>): any[] {
    return newCartItems.map((newItem) => {
      const uniqueId = newItem.ID || newItem.PRODUCT_ID;
      const isSelected = selectionMap.get(uniqueId);

      // -------------------------------------------------------------------
      // KEY CHANGE: Default to TRUE if the item is new (isSelected is undefined)
      // -------------------------------------------------------------------
      const defaultSelection = true;

      // Create a new object that includes the preserved 'selected' state
      return {
        ...newItem,
        selected: isSelected === undefined ? defaultSelection : isSelected,
      };
    });
  }

  // increaseQty(item: any) {
  //   // const nextQuantity = item.quantity + 1; // simulate the next step
  //   // const nextTotalSize = item.VERIENT_SIZE * nextQuantity;
  //   // this.varientStock=item.VERIENT_CURRENT_STOCK
  //   // if (nextQuantity <= this.varientStock && nextTotalSize <= this.varientStock) {
  //   item.quantity++;
  //   item.QUANTITY++;
  //   this.cartService.quantityChange$.next(item);
  //   this.loader = true;
  //   this.cartService.cartUpdated$.subscribe((cartItems) => {
  //     this.loader = false;
  //     this.cartItems = cartItems;
  //     this.cd.detectChanges();
  //   });
  //   setTimeout(() => {
  //     this.loader = false;
  //   }, 200);
  //   // } else {
  //   //   this.toastr.info('Maximum quantity reached', 'Info');
  //   // }
  // }
  nextTotalSize = 1;
  increaseQty(item: any) {
    // console.log(item);
    const nextQuantity = this.quantity ? this.quantity + 1 : item.QUANTITY + 1; // simulate the next step
    const nextTotalSize =
      item.VERIENT_CURRENT_STOCK / (item.VERIENT_SIZE * nextQuantity);
    this.nextTotalSize = nextTotalSize;
    // console.log(nextTotalSize,nextQuantity)
    // 1. Store the current selections before the server updates the array
    // const currentSelections = this.mapCurrentSelections();
    if (nextTotalSize >= 1) {
      item.quantity++;
      item.QUANTITY++;
      this.cartService.quantityChange$.next(item);
      this.loader = true;

      this.cartService.cartUpdated$.subscribe((cartItems) => {
        // 2. Apply the old selections to the new cart items
        this.cartItems = cartItems;

        this.cd.detectChanges();
        this.updateTotals();
      });
    } else {
      this.toastr.info('Stock Not available', 'Info');
    }
    // ... rest of the function (setTimeout block)
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      // 1. Store the current selections
      // const currentSelections = this.mapCurrentSelections();

      item.quantity--;
      item.QUANTITY--;
      this.cartService.quantityChange$.next(item);
      this.loader = true;

      this.cartService.cartUpdated$.subscribe((cartItems) => {
        // 2. Apply the old selections to the new cart items
        this.cartItems = cartItems;

        // this.loader = false;
        this.cd.detectChanges();
        this.updateTotals();
      });
      // ... rest of the function (setTimeout block)
    }
  }

  // Delete function (similar logic)
  deleteItem(itemToRemove: any) {
    // Change parameter name for clarity in delete function
    // 1. Store the current selections
    // const currentSelections = this.mapCurrentSelections();

    this.cartService.removeFromCart(itemToRemove);
    this.loadingProducts = false;
    this.loader = true;

    this.cartService.cartUpdated$.subscribe((cartItems) => {
      this.loader = false;

      // 2. Apply the old selections to the new cart items (even if one was deleted)
      this.cartItems = cartItems;

      this.cd.detectChanges();
      this.updateTotals();
    });
    // setTimeout(() => {
    //   this.loader = false;
    // }, 200);
  }
  deleteItems(itemToRemove: any) {
    // Change parameter name for clarity in delete function
    // 1. Store the current selections
    sessionStorage.setItem('DeletedDetails', JSON.stringify(itemToRemove));
    const currentSelections = this.mapCurrentSelections();
    itemToRemove.forEach(
      (data: any) => {
        this.cartService.removeFromCartnotoast(data);
        this.loadingProducts = false;
        this.loader = true;

        this.cartService.cartUpdated$.subscribe((cartItems) => {
          this.loader = false;

          // 2. Apply the old selections to the new cart items (even if one was deleted)
          this.cartItems = this.applySelections(cartItems, currentSelections);

          this.cd.detectChanges();
          this.updateTotals();
        });
      },
      setTimeout(() => {
        this.loader = false;
        this.cartItems = [...this.cartItems, ...itemToRemove];
      }, 200)
    );
  }

  @Output() remove = new EventEmitter<string>(); // string = product ID
  statusCode: any = '';
  // deleteItem(productId: any) {
  //   // const index = this.cartItems.find((item: any) => item.ID == productId.ID);
  //   // console.log('Deleting item with ID:', productId.ID);
  //   // if (index === -1) {
  //   //   console.log(this.cartItems[index])
  //   //   return;
  //   // }
  //   // console.log('Cart items after deletion:', this.cartItems);
  //   // Emit the product ID to the parent component
  //   // this.remove.emit(productId);
  //   // Optionally, you can also call a service method to handle the deletion
  //   // console.log('Deleting item with ID:', productId);
  //   // this.remove.emit(productId);
  //   this.cartService.removeFromCart(productId);
  //   // this.toastr.info('Item removed from cart', 'Info');
  //   // this.cartService.fetchCartFromServer(this.userID, this.etoken);
  //   this.loadingProducts = false; // Hide loader after fetching cart items
  //   this.loader = true;
  //   this.cartService.cartUpdated$.subscribe((cartItems) => {
  //     this.loader = false;
  //     this.cartItems = cartItems;
  //     // this.loadingProducts = false;
  //     // console.log(this.cartItems);
  //     this.cd.detectChanges(); // Optional but ensures view update
  //   });
  //   setTimeout(() => {
  //     this.loader = false;
  //   }, 200);
  //   // console.log('Item removed from cart:', productId
  // }

  get subtotal() {
    return this.cartItems?.reduce(
      (sum: any, item: any) =>
        sum +
        (item.ITEM_DISCOUNT_AMOUNT
          ? item.ITEM_DISCOUNT_AMOUNT
          : item.RATE
          ? item.RATE
          : item.VERIENT_RATE) *
          item.quantity,
      0
    );
  }
  stopLoader() {
    this.dataLoaded = true;
    this.loaderService.hideLoader();
  }
  private isEmail(value: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(value);
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
              // this.isCheckoutVisible = true;
              this.euserID = successCode.data[0]['UserData'][0].ID;
              this.proceedToCheckout();
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
  onOrderPlaced(success: boolean) {
    // console.log(success);

    if (success) {
      // console.log('Order has been successfully placed!');
      // Here you would typically:
      // 1. Navigate to an order confirmation page.
      // 2. Clear the cart (if not already done by backend).
      // 3. Potentially show a global success message.
      this.isCheckoutVisible = success; // Hide the address manager section
      this.close(); // Close the cart drawer
      // Example: this.router.navigate(['/order-success']);
      this.toastr.success('Order has been successfully placed!', 'Success');
    } else {
      this.isCheckoutVisible = success; // Hide the address manager section
      this.close(); // Close the cart drawer
      this.toastr.error('Order placement failed or was cancelled.');
      // Handle failure if needed, though the address manager already shows toasts for errors.
    }
    // this.isCheckoutVisible = success;
  }
  activeTab: 'login' | 'register' | 'forgot' = 'login'; // Default view

  // Optional helper
  showLogin() {
    this.activeTab = 'login';
  }
  showRegister() {
    this.activeTab = 'register';
  }
  showForgot() {
    this.activeTab = 'forgot';
  }
  proceedToCheckout() {
    const isGuest = sessionStorage.getItem('IS_GUEST') === 'true';
    const userId = sessionStorage.getItem('userId') || '';
    this.userID = this.commonFunction.decryptdata(userId);

    if (!this.userID && !isGuest) {
      this.goToLogin();
      this.isCheckoutVisible = false;
    } else {
      if (this.quantity > this.varientStock) {
        this.toastr.error('Maximum quantity reached', 'Error');
        return;
      } else {
        this.isCheckoutVisible = true;
        this.senddatatoCheckout = {
          cartDetails: this.cartItems, // Send all items
          subtotal: this.subtotal,
        };
      }
    }
  }
  isMobileMenuOpen = false;
  IMAGEuRL: any;
  goToLogin() {
    // this.router.navigate(['/login']);
    // this.renderer.removeClass(document.body, 'modal-open');
    // document.body.classList.remove('modal-open');
    // document.body.classList.remove('modal-backdrop');
    // this.isMobileMenuOpen = false; // Close mobile menu when login is clicked
    this.showLoginModal();
    // this.modalservice.openModal();
    // console.log('vbnm');
    this.IMAGEuRL = this.api.retriveimgUrl2();
  }
  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
  isCartRedirected: any = false;
  openLoginModal() {
    this.isCartRedirected = true;
    sessionStorage.setItem('CART_REDIRECT', this.isCartRedirected);
    this.activeTab = 'login';
    // const modalEl = document.getElementById('loginmodal');
    // const modalInstance =
    //   bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

    // // Remove any leftover backdrops
    // document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    // document.body.classList.remove('modal-open');
    // document.body.style.overflow = '';
    // document.body.style.paddingRight = '';
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

    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    modalInstance.show();
  }
  showLoginModal() {
    this.mobileNumberorEmail = '';
    this.data.PASSWORD = '';
    // const loginModalEl = document.getElementById('loginmodal');

    // document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    // var d: any = document.getElementById('loginmodaltrack') as HTMLElement;
    // d.click();
    this.openLoginModal();
  }
  dataList: any = [];
  userId = sessionStorage.getItem('userId');
  showPassword: boolean = false;

  // PasswordVisibility() {
  //   this.showPassword = !this.showPassword;
  // }
  //  showPassword: boolean = false;

  PasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  // showConfirmPassword: boolean = false;
  confirmPass: string = '';
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  //  whichOTP = '';
  // registrationSubmitted = false;
  pass: any = '';
  handleSpacePress(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }
  // handleKeyPress(event: KeyboardEvent) {
  //   if (
  //     event.key === ' ' &&
  //     (!this.data.CUSTOMER_NAME || this.data.CUSTOMER_NAME.length === 0)
  //   ) {
  //     event.preventDefault();
  //   }
  // }
  //  otpSent: boolean = false;
  // remainingTime: number = 60;
  timerSubscription: any;
  resendforgotOtp(content: any) {
    this.otpSent = false; // Resend OTP action
    this.remainingTime = 60; // Reset timer
    this.startTimer();
  }

  startTimer(): void {
    if (this.timerSubscription) {
      return;
    }

    const maxDuration = 60; // 30 seconds max
    this.remainingTime = Math.min(this.remainingTime, maxDuration);

    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.remainingTime > 0))
      .subscribe({
        next: () => this.remainingTime--,
        complete: () => (this.timerSubscription = null),
      });
  }

  ngOnDestroy() {
    document.body.classList.remove('no-scroll');
    // Unsubscribe from the timer when the component is destroyed
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  isOk = true;
  openVerify: boolean = false;
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
  save(form?: NgForm) {
    sessionStorage.setItem('USER_NAME', this.data.CUSTOMER_NAME);
    sessionStorage.setItem('emailormobile', this.mobileNumberorEmail);
    sessionStorage.setItem('PASSWORD', this.data.PASSWORD);

    // console.log(form?.value, 'reg');
    // form?.resetForm();

    // console.log(form?.value, 'ioug')

    this.data.COUNTRY_CODE = this.selectedCountryCode;
    // console.log(this.data.COUNTRY_CODE);
    // this.registrationSubmitted = true;

    // console.log('check validation', form);

    // if (form && form.invalid) {
    //   return;
    // }

    if (this.isOk) {
      // this.data.STATUS = 1;

      // this.data.TYPE = 'M';

      this.data.COUNTRY_CODE = this.searchQuery;

      // this.data.CUSTOMER_CATEGORY_ID = 1;

      // this.data.EMAIL_ID = this.data.EMAIL_ID;

      // this.data.MOBILE_NO = this.data.CUSTOMER_MOBILE_NO;

      // this.data.CUSTOMER_TYPE = 'I';

      // this.data.TYPE_VALUE = this.data.CUSTOMER_MOBILE_NO;

      // this.whichOTP = 'register';

      // console.log('data in register', this.data);

      // const registerData = this.data;

      // this.loadData();
      //kundan
      if (
        !this.data.CUSTOMER_NAME.trim() &&
        !this.mobileNumberorEmail.trim() &&
        !this.pass.trim()
      ) {
        this.toastr.error('Please fill in all fields.', '');
        return;
      } else if (
        this.data.CUSTOMER_NAME.trim() == '' ||
        this.data.CUSTOMER_NAME == undefined ||
        this.data.CUSTOMER_NAME == null
      ) {
        this.toastr.error('Please enter name.', '');
        return;
      } else if (
        !this.mobileNumberorEmail ||
        this.mobileNumberorEmail == '' ||
        this.mobileNumberorEmail == undefined ||
        this.mobileNumberorEmail == null
      ) {
        const fieldName =
          this.inputType === 'email'
            ? 'your email addresss'
            : this.inputType === 'mobile'
            ? 'your mobile number'
            : 'email or mobile number';

        this.toastr.error(`Please enter ${fieldName}.`, '');
        // this.toastr.error('Please enter mobile no. or email', 'Error');
        // return;
      } else if (
        this.inputType === 'email' &&
        !this.commonFunction.emailpattern.test(this.mobileNumberorEmail)
      ) {
        this.toastr.error(`Please enter valid email address.`, '');
        return;
      } else if (
        this.inputType === 'mobile' &&
        !this.commonFunction.mobpattern.test(this.mobileNumberorEmail)
      ) {
        this.toastr.error(`Please enter valid Mobile No.`, '');
        return;
      } else if (
        this.pass == '' ||
        this.pass == undefined ||
        this.pass == null
      ) {
        this.toastr.error('Please enter password.', '');
        return;
      }

      const passwordPattern =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])\S{8,16}$/;

      if (!passwordPattern.test(this.pass)) {
        this.toastr.error(
          'Password must be 8–16 characters with uppercase, lowercase, number, and symbol.',
          ''
        );

        return;
      } else if (!this.confirmPass) {
        this.toastr.error('Please enter confirm password.', '');
        return;
      } else if (this.pass !== this.confirmPass) {
        this.toastr.error('Password and confirm password must be same.', '');
        return;
      }

      if (this.inputType === 'email') {
        this.type = 'E';
      } else if (this.inputType === 'mobile') {
        this.type = 'M';
      }
      this.issignUpLoading = true;
      const temp = this.data.CUSTOMER_NAME;
      // console.log('name', this.data.CUSTOMER_NAME);

      this.api

        .sendOTP1(this.mobileNumberorEmail, this.type)

        .subscribe({
          next: (successCode: any) => {
            // console.log(this.data, 'dkjfiohfo');

            // console.log(successCode, 'scty');

            if (successCode.code == '200') {
              // this.isloginSendOTP = false;
              this.issignUpLoading = false;
              this.modalService1.closeModal();

              // console.log(this.data, 'datayyy');

              //  this.openVerify = true;

              // console.log( this.openVerify,'openverify');

              // this.otpSent = true;

              // this.showOtpModal = true;

              // this.USER_ID = successCode.USER_ID;

              // this.USER_NAME = successCode.USER_NAME;

              // this.type = successCode.TYPE;

              this.remainingTime = 60;

              this.startTimer();

              this.toastr.success('OTP Sent Successfully...', '');

              this.openRegister = false;

              this.modalVisible = false;

              this.showRegisterOtp = true;
              this.data.CUSTOMER_NAME = temp;
              // console.log('name', this.data.CUSTOMER_NAME);

              // console.log(this.openVerify, 'openverify');

              // this.openRegister = false;

              // this.stopLoader();
              // form?.resetForm();
            } else if (successCode.code == '404') {
              this.statusCode =
                'The user is either not registered or has been deactivated.';
              this.toastr.error(
                'The user is either not registered or has been deactivated.'
              );
              this.issignUpLoading = false;
              this.stopLoader();
            } else if (successCode.code == '400') {
              // this.statusCode = 'The User already exists.';
              this.toastr.error('The User already exists.');
              this.issignUpLoading = false;
              this.stopLoader();
            } else {
              this.isloginSendOTP = false;
              this.issignUpLoading = false;
              // this.toastr.error('OTP Validation Failed...', '');

              this.stopLoader();
            }
          },

          error: (error) => {
            // console.log('error', error);
            this.issignUpLoading = false;
            this.stopLoader();

            // Handle error if login fails

            if (error.status === 400) {
              this.statusCode =
                'The user is either not registered or has been deactivated.';

              this.toastr.info(
                'The user is either not registered or has been deactivated.',

                ''
              );
            } else {
              this.toastr.error('Something went Wrong', '');
            }

            this.isloginSendOTP = false;

            this.stopLoader();
          },
        });

      // this.api.userRegistrationOTP(this.data).subscribe(

      //   (successCode: any) => {

      //     if (successCode.body.code === 200) {

      //       console.log(' in register if');

      //       this.issignUpLoading = false;

      //       this.isOk = false;

      //       this.toastr.success('OTP has been sent successfully.', '');

      //       // this.modalService.dismissAll();

      //       // sessionStorage.setItem("token", successCode.body.token);

      //       // this.cookie.set("token", successCode.body.token, 365, "", "", false, "Strict");

      //       // const user = successCode.body.UserData[0]; // This is the user object

      //       // console.log('user.USER_ID:', user.USER_ID);

      //       // console.log('user.USER_NAME:', user.USER_NAME);

      //       // console.log('user.MOBILE_NUMBER:', user.MOBILE_NUMBER);

      //       // sessionStorage.setItem('userId', this.commonFunction.encryptdata(user.USER_ID));

      //       // sessionStorage.setItem('userName', this.commonFunction.encryptdata(user.USER_NAME));

      //       // sessionStorage.setItem('mobileNumber', this.commonFunction.encryptdata(user.MOBILE_NUMBER));

      //       this.isloginSendOTP = false;

      //       this.modalService1.closeModal();

      //       this.otpSent = true;

      //       this.showOtpModal = true;

      //       this.USER_ID = successCode.USER_ID;

      //       this.USER_NAME = successCode.USER_NAME;

      //       this.remainingTime = 60;

      //       this.startTimer();

      //       // this.toastr.success("OTP Sent Successfully...", "");

      //       this.modalVisible = false;

      //       this.openRegister = false;

      //       this.openVerify = true;

      //       // this.modalService.dismissAll();

      //       // this.modalService.open(this.loginotpverficationModal, {

      //       //   backdrop: "static",

      //       //   keyboard: false,

      //       //   centered: true,

      //       // });

      //       // this.isverifyOTP = false;

      //       this.statusCode = '';

      //       this.data = registerData;

      //       console.log('after in register', this.data);

      //       this.stopLoader();

      //     } else if (successCode.body.code === 300) {

      //       // console.log('in else', successCode);

      //       this.stopLoader();

      //       this.issignUpLoading = false;

      //       this.statusCode = 'Email ID or mobile number already exists.';

      //     }

      //     // else if (

      //     //   successCode.body.code === 300 &&

      //     //   successCode.body.message === 'email ID already exists.'

      //     // ) {

      //     //   console.log('in else', successCode);

      //     //   this.stopLoader();

      //     //   this.issignUpLoading = false;

      //     //   this.statusCode = 'email ID already exists.';

      //     // }

      //     console.log('successCode', successCode);

      //     this.mobileNumberorEmail = this.data.CUSTOMER_MOBILE_NO;

      //   },

      //   (error) => {

      //     this.issignUpLoading = false;

      //     // Handle error if login fails

      //     if (error.status === 300) {

      //       this.issignUpLoading = false;

      //       // Handle specific HTTP error (e.g., invalid credentials)

      //       this.toastr.error('Email-ID is already exists', '');

      //     } else if (error.status === 500) {

      //       // Handle server-side error

      //       this.toastr.error(

      //         'An unexpected error occurred. Please try again later.',

      //         ''

      //       );

      //     } else {

      //       this.issignUpLoading = false;

      //       // Generic error handling

      //       this.toastr.error(

      //         'An unknown error occurred. Please try again later.',

      //         ''

      //       );

      //     }

      //     this.stopLoader();

      //   }

      // );
    }
  }
  //  emailPattern =
  //   /^[_a-zA-Z0-9]+(\.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/;
  identifier: string = '';

  userMobileNo: any;
  sendLink() {
    // if (!this.email) {
    //   this.toastr.error('Error', 'Please enter username');
    //   return;
    // }
    // else if (!this.emailPattern.test(this.email)) {
    //   this.toastr.warning('Warning', 'Please Enter Valid Email');
    //   return;
    // }

    if (
      !this.mobileNumberorEmail ||
      this.mobileNumberorEmail == '' ||
      this.mobileNumberorEmail == undefined ||
      this.mobileNumberorEmail == null
    ) {
      const fieldName =
        this.inputType === 'email'
          ? 'your email addresss'
          : this.inputType === 'mobile'
          ? 'your mobile number'
          : 'email or mobile number';

      this.toastr.error(`Please enter ${fieldName}.`, '');
      // this.toastr.error('Please enter mobile no. or email', 'Error');
      return;
    } else if (
      this.inputType === 'email' &&
      !this.commonFunction.emailpattern.test(this.mobileNumberorEmail)
    ) {
      this.toastr.error(`Please enter valid email address.`, '');
      return;
    } else if (
      this.inputType === 'mobile' &&
      !this.commonFunction.mobpattern.test(this.mobileNumberorEmail)
    ) {
      this.toastr.error(`Please enter valid Mobile No.`, '');
      return;
    }

    let mobileNoToSend = '';
    let emailToSend = '';

    if (this.inputType === 'mobile') {
      mobileNoToSend = this.mobileNumberorEmail;
    } else if (this.inputType === 'email') {
      emailToSend = this.mobileNumberorEmail;
    }
    this.getLinkLoading = true;

    this.api.sendLink(mobileNoToSend, emailToSend).subscribe(
      (data) => {
        // console.log('Reset email sent:', data);
        if (data.code == '200') {
          this.getLinkLoading = false;
          this.linkSent = true;
          // this.showOtp = true;
          // this.otpSent = true;
          // this.reinitiliseOTPCountdown();
          // this.startOTPCountdown();
          // this.toastr.success(
          //   'Success',
          //   'OTP sent to your email! Please check your inbox.'
          // );
          // if (this.inputType === 'email') {
          //   this.sendEmailLink();
          // } else if (this.inputType === 'mobile') {
          //   // this.sendWhatsAppLink();
          // }
          this.toastr.success('Password reset link sent successfully', '');
        } else if (data.code == '400') {
          this.getLinkLoading = false;
          this.linkSent = false;
          this.toastr.error(
            'This email or mobile number is not registered.',
            ''
          );
        }
      },
      (error) => {
        this.getLinkLoading = false;
        this.toastr.error('Error', 'Error sending otp:  User not found');
      }
    );
  }

  private sendEmailLink(): void {
    const emailData = { email: this.identifier };
    this.http.post('YOUR_BACKEND_EMAIL_API_URL', emailData).subscribe(
      (response) => {
        // console.log('Email link sent successfully', response);
        this.toastr.error('Email link sent successfully', '');
        this.getLinkLoading = false;
        // Handle success, e.g., show a success message
      },
      (error) => {
        // console.error('Error sending email link', error);
        this.toastr.error('Error sending email link', error);
        this.getLinkLoading = false;
        // Handle error, e.g., show an error message
      }
    );
  }
  private sendWhatsAppLink(): void {
    const mobileData = { mobileNumber: this.identifier };
    this.http.post('YOUR_BACKEND_WHATSAPP_API_URL', mobileData).subscribe(
      (response) => {
        // console.log('WhatsApp link sent successfully', response);
        this.getLinkLoading = false;
        // Handle success
      },
      (error) => {
        // console.error('Error sending WhatsApp link', error);
        this.getLinkLoading = false;
        // Handle error
      }
    );
  }

  onGotoLogin() {
    this.activeTab = 'login';
    // window.location.reload();
  }
  onSubmitOtp() {
    false; // this.api.requestResetPassword(this.email, this.otp).subscribe(
    //   (response) => {
    //     console.log('Reset email sent:', response);
    //     this._message.success('Success', 'OTP verified successfully');

    //     this.verifyLoading = false;
    //     this.showOtp = false;
    //     this.otpVerified=true;
    //     this.token=response.data;
    //     // this._router.navigate(['/reset-password'], {
    //     //   queryParams: { token: response.data }
    //     // });

    //   },
    //   (error) => {
    //     this.verifyLoading = false;
    //     this._message.error('Error', 'Invalid Otp: ' + error.error.message);
    //   }
    // );
    // console.log('OTP Submitted:', this.otp);
  }

  startOTPCountdown(): void {
    this.intervalId = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        clearInterval(this.intervalId);
        this.remainingTime = 0;
      }
    }, 1000);
  }
  reinitiliseOTPCountdown(): void {
    clearInterval(this.intervalId);
    this.countdownTime = 120;
    this.remainingTime = this.countdownTime;
  }

  resetPassword() {
    if (!this.isValidPassword(this.newPassword)) {
      this.toastr.warning('Warning', 'Please enter valid password');
      return;
    } else if (this.newPassword != this.confirmPassword) {
      this.toastr.warning(
        'Warning',
        'New password & confirm password must be same'
      );
      return;
    } else {
      this.Loading = false;
      // this.api.PasswordReset(this.token, this.newPassword).subscribe(
      //   (response) => {
      //     this.Loading=false;
      //     this._message.success('Success', 'Password reset success');
      //     this._router.navigate(['/login']);

      //     setTimeout(() => {
      //       window.location.reload();

      //     }, 1000);
      //   },
      //   (error) => {
      //     this.Loading=false;
      //     this._message.error('Error', 'Error resetting password', error);
      //   }
      // );
    }
  }
  passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  isValidPassword(password: string): boolean {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordPattern.test(password);
  }

  // ******************************************
  // inputType: 'initial' | 'mobile' | 'email' = 'initial';
  // showCountryDropdown: boolean = false;
  // searchQuery: string = '';
  // mobileNumberorEmail: string = '';
  // filteredCountryCodes: any[] = [];
  // selectedCountryCode: string = '+1';
  // public commonFunction = new CommonFunctionService();

  // toggleCountryDropdown() {
  //   this.showCountryDropdown = !this.showCountryDropdown;
  //   // console.log('showCountryDropdown: ', this.showCountryDropdown);

  //   if (this.showCountryDropdown) {
  //     // console.log('showCountryDropdown: ', this.showCountryDropdown);
  //     this.filteredCountryCodes = [...this.countryCodes]; // Create a new array copy
  //     this.searchQuery = '';
  //   }
  // }

  // filterCountries(event: any) {
  //   const query = event.target.value.toLowerCase().trim();
  //   this.searchQuery = query;
  //   this.filteredCountryCodes = this.countryCodes.filter(
  //     (country) =>
  //       country.label.toLowerCase().includes(query) ||
  //       country.value.toLowerCase().includes(query)
  //   );
  // }

  // selectCountry(country: any) {
  //   this.selectedCountryCode = country.value;
  //   // this.data.COUNTRY_CODE = this.selectedCountryCode;
  //   this.showCountryDropdown = false;
  //   this.searchQuery = '';
  // }

  // getPlaceholder() {
  //   return this.inputType === 'email'
  //     ? 'Enter email address'
  //     : this.inputType === 'mobile'
  //     ? 'Enter mobile number'
  //     : 'Enter email or mobile number';
  // }

  // onIdentifierInput(event: any) {
  //   const value = event.target.value;
  //   console.log(this.mobileNumberorEmail, 'mobileoremail');
  //   console.log(event, 'event');
  //   if (!value || value.length < 3) {
  //     this.inputType = 'initial';
  //     return;
  //   }

  //   // Check if input contains letters
  //   if (/[a-zA-Z]/.test(value)) {
  //     this.inputType = 'email';
  //   } else {
  //     this.inputType = 'mobile';
  //   }
  // }

  // countryCodes = [
  //   { label: '+91 (India)', value: '+91' },
  //   { label: '+92 (Pakistan)', value: '+92' },
  //   { label: '+93 (Afghanistan)', value: '+93' },
  //   { label: '+94 (Sri Lanka)', value: '+94' },
  //   { label: '+95 (Myanmar)', value: '+95' },
  //   { label: '+1 (United States)', value: '+1' },
  //   { label: '+1-242 (Bahamas)', value: '+1-242' },
  //   { label: '+1-246 (Barbados)', value: '+1-246' },
  //   { label: '+1-264 (Anguilla)', value: '+1-264' },
  //   { label: '+1-268 (Antigua and Barbuda)', value: '+1-268' },
  //   { label: '+1-284 (British Virgin Islands)', value: '+1-284' },
  //   { label: '+1-340 (U.S. Virgin Islands)', value: '+1-340' },
  //   { label: '+1-345 (Cayman Islands)', value: '+1-345' },
  //   { label: '+1-441 (Bermuda)', value: '+1-441' },
  //   { label: '+1-473 (Grenada)', value: '+1-473' },
  //   { label: '+1-649 (Turks and Caicos Islands)', value: '+1-649' },
  //   { label: '+1-664 (Montserrat)', value: '+1-664' },
  //   { label: '+1-670 (Northern Mariana Islands)', value: '+1-670' },
  //   { label: '+1-671 (Guam)', value: '+1-671' },
  //   { label: '+1-684 (American Samoa)', value: '+1-684' },
  //   { label: '+1-721 (Sint Maarten)', value: '+1-721' },
  //   { label: '+1-758 (Saint Lucia)', value: '+1-758' },
  //   { label: '+1-767 (Dominica)', value: '+1-767' },
  //   { label: '+1-784 (Saint Vincent and the Grenadines)', value: '+1-784' },
  //   { label: '+1-787 (Puerto Rico)', value: '+1-787' },
  //   { label: '+1-809 (Dominican Republic)', value: '+1-809' },
  //   { label: '+1-829 (Dominican Republic)', value: '+1-829' },
  //   { label: '+1-849 (Dominican Republic)', value: '+1-849' },
  //   { label: '+1-868 (Trinidad and Tobago)', value: '+1-868' },
  //   { label: '+1-869 (Saint Kitts and Nevis)', value: '+1-869' },
  //   { label: '+1-876 (Jamaica)', value: '+1-876' },
  //   { label: '+1-939 (Puerto Rico)', value: '+1-939' },
  //   { label: '+20 (Egypt)', value: '+20' },
  //   { label: '+211 (South Sudan)', value: '+211' },
  //   { label: '+212 (Morocco)', value: '+212' },
  //   { label: '+213 (Algeria)', value: '+213' },
  //   { label: '+216 (Tunisia)', value: '+216' },
  //   { label: '+218 (Libya)', value: '+218' },
  //   { label: '+220 (Gambia)', value: '+220' },
  //   { label: '+221 (Senegal)', value: '+221' },
  //   { label: '+222 (Mauritania)', value: '+222' },
  //   { label: '+223 (Mali)', value: '+223' },
  //   { label: '+224 (Guinea)', value: '+224' },
  //   { label: '+225 (Ivory Coast)', value: '+225' },
  //   { label: '+226 (Burkina Faso)', value: '+226' },
  //   { label: '+227 (Niger)', value: '+227' },
  //   { label: '+228 (Togo)', value: '+228' },
  //   { label: '+229 (Benin)', value: '+229' },
  //   { label: '+230 (Mauritius)', value: '+230' },
  //   { label: '+231 (Liberia)', value: '+231' },
  //   { label: '+232 (Sierra Leone)', value: '+232' },
  //   { label: '+233 (Ghana)', value: '+233' },
  //   { label: '+234 (Nigeria)', value: '+234' },
  //   { label: '+235 (Chad)', value: '+235' },
  //   { label: '+236 (Central African Republic)', value: '+236' },
  //   { label: '+237 (Cameroon)', value: '+237' },
  //   { label: '+238 (Cape Verde)', value: '+238' },
  //   { label: '+239 (Sao Tome and Principe)', value: '+239' },
  //   { label: '+240 (Equatorial Guinea)', value: '+240' },
  //   { label: '+241 (Gabon)', value: '+241' },
  //   { label: '+242 (Republic of the Congo)', value: '+242' },
  //   { label: '+243 (Democratic Republic of the Congo)', value: '+243' },
  //   { label: '+244 (Angola)', value: '+244' },
  //   { label: '+245 (Guinea-Bissau)', value: '+245' },
  //   { label: '+246 (British Indian Ocean Territory)', value: '+246' },
  //   { label: '+248 (Seychelles)', value: '+248' },
  //   { label: '+249 (Sudan)', value: '+249' },
  //   { label: '+250 (Rwanda)', value: '+250' },
  //   { label: '+251 (Ethiopia)', value: '+251' },
  //   { label: '+252 (Somalia)', value: '+252' },
  //   { label: '+253 (Djibouti)', value: '+253' },
  //   { label: '+254 (Kenya)', value: '+254' },
  //   { label: '+255 (Tanzania)', value: '+255' },
  //   { label: '+256 (Uganda)', value: '+256' },
  //   { label: '+257 (Burundi)', value: '+257' },
  //   { label: '+258 (Mozambique)', value: '+258' },
  //   { label: '+260 (Zambia)', value: '+260' },
  //   { label: '+261 (Madagascar)', value: '+261' },
  //   { label: '+262 (Reunion)', value: '+262' },
  //   { label: '+263 (Zimbabwe)', value: '+263' },
  //   { label: '+264 (Namibia)', value: '+264' },
  //   { label: '+265 (Malawi)', value: '+265' },
  //   { label: '+266 (Lesotho)', value: '+266' },
  //   { label: '+267 (Botswana)', value: '+267' },
  //   { label: '+268 (Eswatini)', value: '+268' },
  //   { label: '+269 (Comoros)', value: '+269' },
  //   { label: '+27 (South Africa)', value: '+27' },
  //   { label: '+290 (Saint Helena)', value: '+290' },
  //   { label: '+291 (Eritrea)', value: '+291' },
  //   { label: '+297 (Aruba)', value: '+297' },
  //   { label: '+298 (Faroe Islands)', value: '+298' },
  //   { label: '+299 (Greenland)', value: '+299' },
  //   { label: '+30 (Greece)', value: '+30' },
  //   { label: '+31 (Netherlands)', value: '+31' },
  //   { label: '+32 (Belgium)', value: '+32' },
  //   { label: '+33 (France)', value: '+33' },
  //   { label: '+34 (Spain)', value: '+34' },
  //   { label: '+350 (Gibraltar)', value: '+350' },
  //   { label: '+351 (Portugal)', value: '+351' },
  //   { label: '+352 (Luxembourg)', value: '+352' },
  //   { label: '+353 (Ireland)', value: '+353' },
  //   { label: '+354 (Iceland)', value: '+354' },
  //   { label: '+355 (Albania)', value: '+355' },
  //   { label: '+356 (Malta)', value: '+356' },
  //   { label: '+357 (Cyprus)', value: '+357' },
  //   { label: '+358 (Finland)', value: '+358' },
  //   { label: '+359 (Bulgaria)', value: '+359' },
  //   { label: '+36 (Hungary)', value: '+36' },
  //   { label: '+370 (Lithuania)', value: '+370' },
  //   { label: '+371 (Latvia)', value: '+371' },
  //   { label: '+372 (Estonia)', value: '+372' },
  //   { label: '+373 (Moldova)', value: '+373' },
  //   { label: '+374 (Armenia)', value: '+374' },
  //   { label: '+375 (Belarus)', value: '+375' },
  //   { label: '+376 (Andorra)', value: '+376' },
  //   { label: '+377 (Monaco)', value: '+377' },
  //   { label: '+378 (San Marino)', value: '+378' },
  //   { label: '+379 (Vatican City)', value: '+379' },
  //   { label: '+380 (Ukraine)', value: '+380' },
  //   { label: '+381 (Serbia)', value: '+381' },
  //   { label: '+382 (Montenegro)', value: '+382' },
  //   { label: '+383 (Kosovo)', value: '+383' },
  //   { label: '+385 (Croatia)', value: '+385' },
  //   { label: '+386 (Slovenia)', value: '+386' },
  //   { label: '+387 (Bosnia and Herzegovina)', value: '+387' },
  //   { label: '+389 (North Macedonia)', value: '+389' },
  //   { label: '+39 (Italy)', value: '+39' },
  //   { label: '+40 (Romania)', value: '+40' },
  //   { label: '+41 (Switzerland)', value: '+41' },
  //   { label: '+420 (Czech Republic)', value: '+420' },
  //   { label: '+421 (Slovakia)', value: '+421' },
  //   { label: '+423 (Liechtenstein)', value: '+423' },
  //   { label: '+43 (Austria)', value: '+43' },
  //   { label: '+44 (United Kingdom)', value: '+44' },
  //   { label: '+44-1481 (Guernsey)', value: '+44-1481' },
  //   { label: '+44-1534 (Jersey)', value: '+44-1534' },
  //   { label: '+44-1624 (Isle of Man)', value: '+44-1624' },
  //   { label: '+45 (Denmark)', value: '+45' },
  //   { label: '+46 (Sweden)', value: '+46' },
  //   { label: '+47 (Norway)', value: '+47' },
  //   { label: '+48 (Poland)', value: '+48' },
  //   { label: '+49 (Germany)', value: '+49' },
  //   { label: '+500 (Falkland Islands)', value: '+500' },
  //   { label: '+501 (Belize)', value: '+501' },
  //   { label: '+502 (Guatemala)', value: '+502' },
  //   { label: '+503 (El Salvador)', value: '+503' },
  //   { label: '+504 (Honduras)', value: '+504' },
  //   { label: '+505 (Nicaragua)', value: '+505' },
  //   { label: '+506 (Costa Rica)', value: '+506' },
  //   { label: '+507 (Panama)', value: '+507' },
  //   { label: '+508 (Saint Pierre and Miquelon)', value: '+508' },
  //   { label: '+509 (Haiti)', value: '+509' },
  //   { label: '+51 (Peru)', value: '+51' },
  //   { label: '+52 (Mexico)', value: '+52' },
  //   { label: '+53 (Cuba)', value: '+53' },
  //   { label: '+54 (Argentina)', value: '+54' },
  //   { label: '+55 (Brazil)', value: '+55' },
  //   { label: '+56 (Chile)', value: '+56' },
  //   { label: '+57 (Colombia)', value: '+57' },
  //   { label: '+58 (Venezuela)', value: '+58' },
  //   { label: '+590 (Guadeloupe)', value: '+590' },
  //   { label: '+591 (Bolivia)', value: '+591' },
  //   { label: '+592 (Guyana)', value: '+592' },
  //   { label: '+593 (Ecuador)', value: '+593' },
  //   { label: '+594 (French Guiana)', value: '+594' },
  //   { label: '+595 (Paraguay)', value: '+595' },
  //   { label: '+596 (Martinique)', value: '+596' },
  //   { label: '+597 (Suriname)', value: '+597' },
  //   { label: '+598 (Uruguay)', value: '+598' },
  //   { label: '+599 (Netherlands Antilles)', value: '+599' },
  //   { label: '+60 (Malaysia)', value: '+60' },
  //   { label: '+61 (Australia)', value: '+61' },
  //   { label: '+62 (Indonesia)', value: '+62' },
  //   { label: '+63 (Philippines)', value: '+63' },
  //   { label: '+64 (New Zealand)', value: '+64' },
  //   { label: '+65 (Singapore)', value: '+65' },
  //   { label: 'Thailand (+66)', value: '+66' },
  //   { label: 'Timor-Leste (+670)', value: '+670' },
  //   { label: 'Australian External Territories (+672)', value: '+672' },
  //   { label: 'Brunei (+673)', value: '+673' },
  //   { label: 'Nauru (+674)', value: '+674' },
  //   { label: 'Papua New Guinea (+675)', value: '+675' },
  //   { label: 'Tonga (+676)', value: '+676' },
  //   { label: 'Solomon Islands (+677)', value: '+677' },
  //   { label: 'Vanuatu (+678)', value: '+678' },
  //   { label: 'Fiji (+679)', value: '+679' },
  //   { label: 'Palau (+680)', value: '+680' },
  //   { label: 'Wallis and Futuna (+681)', value: '+681' },
  //   { label: 'Cook Islands (+682)', value: '+682' },
  //   { label: 'Niue (+683)', value: '+683' },
  //   { label: 'Samoa (+685)', value: '+685' },
  //   { label: 'Kiribati (+686)', value: '+686' },
  //   { label: 'New Caledonia (+687)', value: '+687' },
  //   { label: 'Tuvalu (+688)', value: '+688' },
  //   { label: 'French Polynesia (+689)', value: '+689' },
  //   { label: 'Tokelau (+690)', value: '+690' },
  //   { label: 'Micronesia (+691)', value: '+691' },
  //   { label: 'Marshall Islands (+692)', value: '+692' },
  //   { label: 'Russia (+7)', value: '+7' },
  //   { label: 'Kazakhstan (+7)', value: '+7' },
  //   { label: 'Japan (+81)', value: '+81' },
  //   { label: 'South Korea (+82)', value: '+82' },
  //   { label: 'Vietnam (+84)', value: '+84' },
  //   { label: 'North Korea (+850)', value: '+850' },
  //   { label: 'Hong Kong (+852)', value: '+852' },
  //   { label: 'Macau (+853)', value: '+853' },
  //   { label: 'Cambodia (+855)', value: '+855' },
  //   { label: 'Laos (+856)', value: '+856' },
  //   { label: 'China (+86)', value: '+86' },
  //   { label: 'Bangladesh (+880)', value: '+880' },
  //   { label: 'Taiwan (+886)', value: '+886' },
  //   { label: 'Turkey (+90)', value: '+90' },
  //   { label: 'Maldives (+960)', value: '+960' },
  //   { label: 'Lebanon (+961)', value: '+961' },
  //   { label: 'Jordan (+962)', value: '+962' },
  //   { label: 'Syria (+963)', value: '+963' },
  //   { label: 'Iraq (+964)', value: '+964' },
  //   { label: 'Kuwait (+965)', value: '+965' },
  //   { label: 'Saudi Arabia (+966)', value: '+966' },
  //   { label: 'Yemen (+967)', value: '+967' },
  //   { label: 'Oman (+968)', value: '+968' },
  //   { label: 'Palestine (+970)', value: '+970' },
  //   { label: 'United Arab Emirates (+971)', value: '+971' },
  //   { label: 'Israel (+972)', value: '+972' },
  //   { label: 'Bahrain (+973)', value: '+973' },
  //   { label: 'Qatar (+974)', value: '+974' },
  //   { label: 'Bhutan (+975)', value: '+975' },
  //   { label: 'Mongolia (+976)', value: '+976' },
  //   { label: 'Nepal (+977)', value: '+977' },
  //   { label: 'Iran (+98)', value: '+98' },
  //   { label: 'Tajikistan (+992)', value: '+992' },
  //   { label: 'Turkmenistan (+993)', value: '+993' },
  //   { label: 'Azerbaijan (+994)', value: '+994' },
  //   { label: 'Georgia (+995)', value: '+995' },
  //   { label: 'Kyrgyzstan (+996)', value: '+996' },
  //   { label: 'Uzbekistan (+998)', value: '+998' },
  // ];

  // Close-on-outside-click support for country dropdown
  // @ViewChildren('dropdownWrapper') dropdownWrappers!: QueryList<ElementRef>;

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent) {
  //   if (!this.showCountryDropdown) return;
  //   const target = event.target as Node;
  //   const wrappers = this.dropdownWrappers
  //     ? this.dropdownWrappers.toArray()
  //     : [];
  //   const clickedInside = wrappers.some((ref) =>
  //     ref.nativeElement.contains(target)
  //   );
  //   if (!clickedInside) {
  //     this.showCountryDropdown = false;
  //     this.searchQuery = '';
  //   }
  // }

  showRegisterOtp: boolean = false;
  // otp: string[] = ['', '', '', '']; // For 4-digit OTP
  // statusCode: string = '';
  // remainingTime: number = 60;
  isverifyOTP: boolean = false;

  // After successful registration, call this
  onRegistrationSuccess() {
    this.showRegisterOtp = true;
    this.startTimer();
  }
  // statusCode: any = '';
  showMap: boolean = false;
  VerifyOTP() {
    if (this.otp.join('').length < 4) {
      this.toastr.error('Please Enter OTP...', '');
      return;
    }
    // this.isverifyOTP = true; // Set true before API call
    // console.log(this.isverifyOTP,'this.isverifyOTP')
    const otp1 = this.otp.join('');
    this.isverifyOTP = true; // Set true before API call
    // this.loadData();
    // console.log(this.whichOTP)
    // if (this.whichOTP == 'login') {
    // let CLOUD_ID = this.cookie.get('CLOUD_ID');
    //  this.USER_NAME = this.data.CUSTOMER_NAME
    this.USER_NAME = sessionStorage.getItem('USER_NAME');
    // console.log(this.USER_NAME, ' this.USER_NAME');
    this.api
      .verifyOTP(
        this.type,
        otp1,
        this.mobileNumberorEmail // this.USER_ID,
        // this.USER_NAME,
        // 1,
        // CLOUD_ID
      )
      .subscribe({
        next: (successCode: any) => {
          // console.log('successCode', successCode.body.code);
          // console.log(this.isverifyOTP, 'this.isverifyOTP');
          if (successCode.body.code === 200) {
            // console.log('wertyuiko');
            //  this.USER_NAME = this.data.CUSTOMER_NAME
            // this.isverifyOTP = false; // Set true before API call
            // console.log(this.isverifyOTP, 'this.isverifyOTP');
            this.toastr.success('OTP verified successfully...', '');
            this.modalService.dismissAll();
            this.isOk = false;
            this.createCustomer();
            this.modalVisible = false;
            this.openRegister = false;
            this.openVerify = false;

            this.otp = ['', '', '', ''];
            // this.isverifyOTP = false;
            this.statusCode = '';
          } else {
            this.toastr.error('Invalid OTP');
          }
          // console.log('successCode.body.code', successCode.body.code);
          this.isverifyOTP = false;
          // this.stopLoader();
        },
        error: (errorResponse) => {
          console.error('verifyOTP API failed:', errorResponse);
          if (errorResponse.error.code === 300) {
            this.toastr.error(
              'Invalid request. Please check the entered details.'
            );
            // console.log('xxx');
            this.statusCode = 'invalid OTP';
            this.stopLoader();
          } else {
            // console.log('sss');
            this.toastr.error('Something went wrong. Please try again.');
            this.statusCode = '';
            this.stopLoader();
          }
          // console.log('kkkkk');
          this.isverifyOTP = false;
          this.stopLoader();
        },
      });
    // }
  }
  createCustomer() {
    if (this.inputType === 'email') {
      // this.type = 'E'
      this.data.MOBILE_NO = null;
      this.data.EMAIL_ID = this.mobileNumberorEmail;
      // console.log(this.data.EMAIL_ID, 'uiyftuii');
    } else if (this.inputType === 'mobile') {
      // this.type = 'M'
      this.data.EMAIL_ID = null;
      this.data.MOBILE_NO = this.mobileNumberorEmail;
    }

    // this.api.createCustomer()()

    this.api
      .createCustomer(
        this.USER_NAME,
        this.data.MOBILE_NO,
        this.data.EMAIL_ID,
        this.pass,
        1,
        this.data.STATUS,
        this.data.COUNTRY_CODE
      )
      .subscribe({
        next: (successCode: any) => {
          // console.log(successCode)
          if (successCode.body.code == '200') {
            this.isloginSendOTP = false;
            this.modalService1.closeModal();
            // console.log(successCode);
            sessionStorage.setItem(
              'userId',
              this.commonFunction.encryptdata(
                successCode.body.data[0]['UserData'][0].ID
              )
            );
            sessionStorage.setItem('token', successCode.body.data[0].token);
            //  sessionStorage.setItem('token', successCode.body.token);
            this.cookie.set(
              'token',
              successCode.body.data[0].token,
              365,
              '',
              '',
              false,
              'Strict'
            );

            // this.otpSent = true;
            // this.showOtpModal = true;
            // this.USER_ID = successCode.USER_ID;
            this.USER_NAME = successCode.USER_NAME;

            this.mobileNumberorEmail = '';

            // this.remainingTime = 60;
            // this.startTimer();
            // this.toastr.success('OTP Sent Successfully...', '');
            this.modalVisible = false;
            this.openRegister = false;
            this.closeLoginModal();
            // const backdrop = document.querySelector('.modal-backdrop');
            // if (backdrop) {
            //   backdrop.remove();
            // }
            // // this.renderer.removeClass(document.body, 'modal-open');
            // document.body.classList.remove('modal-open');
            // document.body.style.overflow = '';
            // document.body.style.overflowX = 'hidden';
            // this.openVerify = true;
            // this.stopLoader();
            this.toastr.success('You have login Successfully!', 'success');
            this.router.navigate(['/home']).then(() => {
              window.location.reload();
            });
          } else if (successCode.body.code == '400') {
            // this.statusCode =
            //   'The user is either not registered or has been deactivated.';
            // this.stopLoader();
          } else {
            this.isloginSendOTP = false;
            this.toastr.error('OTP Validation Failed...', '');
            this.stopLoader();
          }
        },
        error: (error) => {
          // console.log('error', error);
          // this.stopLoader();
          // // Handle error if login fails
          if (error.status === 400) {
            // this.statusCode =
            //   'The user is either not registered or has been deactivated.';
            // this.toastr.info(
            //   'The user is either not registered or has been deactivated.',
            //   ''
            // );
          } else {
            // this.toastr.error('Error sending OTP', '');
          }
          // this.isloginSendOTP = false;

          // this.stopLoader();
        },
      });
  }
  @ViewChild('otpInputs') otpInputs: ElementRef | undefined;

  // Method to move to the next input field
  // Method to move to the next input field
  //   @ViewChild('otpInputs') otpInputs: ElementRef | undefined;
  // otp: string[] = ['', '', '', '', '', ''];  // OTP Array to store individual digits

  // Method to move to the next input field
  moveToNext(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
      // If backspace is pressed on empty input, move to previous input
      const prevInput = document.getElementsByClassName('otp-input')[
        index - 1
      ] as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  onChange(value: string, index: number) {
    // Ensure the input is a number
    if (/^\d*$/.test(value)) {
      // If a value is entered and there's a next input, move to it
      if (value && index < 3) {
        const nextInput = document.getElementsByClassName('otp-input')[
          index + 1
        ] as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    } else {
      // If not a number, clear the input
      this.otp[index] = '';
    }
  }

  // Handle focus event to select the input value when clicked
  onFocus(index: number) {
    const input = this.otpInputs?.nativeElement.querySelectorAll('input')[
      index
    ] as HTMLInputElement;
    input?.select(); // Select the value when clicked for easier editing
  }

  // Method to clear OTP fields
  forgotclearOTPFields() {
    this.otp = ['', '', '', '', '', ''];
  }
  // handleEnterKey(content: any) {
  //   if (this.isSendOpt) {
  //   } else {
  //     // Otherwise, call the existing function for the second button
  //     this.loginforgot(content);
  //   }
  // }
  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData && /^\d{4}$/.test(pastedData)) {
      // If pasted data is 4 digits, distribute across inputs
      for (let i = 0; i < 4; i++) {
        this.otp[i] = pastedData[i];
      }
    }
  }
  handleLoginEnterKey(content: any) {
    if (this.isloginSendOTP) {
    } else {
      // Otherwise, call the existing function for the second button
      this.loginotpverification(content);
    }
  }
  // Method to handle OTP verification
  // isverifyOTP: boolean = false;
  resendOtp() {
    this.otp = ['', '', '', ''];
    this.otp[0] = '';
    this.otp[1] = '';
    this.otp[2] = '';
    this.otp[3] = '';
    if (this.remainingTime > 0) {
      this.toastr.info(
        `Please wait ${this.remainingTime} seconds before resending OTP.`,
        ''
      );
      return; // stop execution if timer is running
    }

    this.otpSent = false;
    this.remainingTime = 60; // reset timer
    this.startTimer();
    if (this.whichOTP == 'login') {
      this.loginotpverification();
    } else if (this.whichOTP == 'register') {
      this.save();
    }
  }
  selectedSubtotal = 0;
  // selectedTax = 0;
  selectedTotal = 0;
  deletedItems: any = [];
  selectedPrice = 0;
  selectedDiscount = 0;
  // UPDATE updateTotals function:
  updateTotals() {
    this.loader = false;
    // this.deletedItems = [];

    // Calculate totals for ALL items (no filtering by selected)
    this.selectedPrice = this.cartItems.reduce(
      (sum: number, item: any) =>
        sum + (item.VERIENT_RATE || 0) * item.QUANTITY,
      0
    );

    this.selectedDiscount = this.cartItems.reduce((sum: number, item: any) => {
      if (item.DISCOUNT_TYPE === 'Amount') {
        return (
          sum + (item.DISCOUNT || 0) * (item.QUANTITY || item.quantity || 1)
        );
      } else if (item.DISCOUNT_TYPE === 'Percentage') {
        const rate = parseFloat(item.VERIENT_RATE) || 0;
        const discount =
          ((rate * (item.DISCOUNT || 0)) / 100) *
          (item.QUANTITY || item.quantity || 1);
        return sum + discount;
      } else {
        return sum;
      }
    }, 0);

    this.selectedSubtotal = this.cartItems.reduce(
      (sum: number, item: any) =>
        sum +
        (item.ITEM_DISCOUNT_AMOUNT ||
          (item.RATE || item.VERIENT_RATE) * item.quantity),
      0
    );

    this.selectedTotal = +this.selectedSubtotal;
  }

  // UPDATE hasSelectedItems function:
  hasSelectedItems() {
    return this.cartItems.length > 0; // Simply check if there are items
  }
  // Add these properties to your component class
  showDeleteConfirmation: boolean = false;
  itemToDelete: any = null;

  // Replace your deleteItem method with these three methods:

  confirmDelete(item: any): void {
    this.itemToDelete = item;
    this.showDeleteConfirmation = true;
  }

  executeDelete(): void {
    if (this.itemToDelete) {
      this.deleteItem(this.itemToDelete);
      this.updateTotals();
    }
    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.itemToDelete = null;
  }
}
