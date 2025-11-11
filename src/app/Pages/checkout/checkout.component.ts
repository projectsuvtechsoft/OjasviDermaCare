import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
// declare var Razorpay: any;
declare var paypal: any;
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/Service/cart.service';
import { NgForm } from '@angular/forms';
import { interval, takeWhile } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
interface Address {
  ID?: string; // Made optional for new addresses
  NAME: string;
  ADDRESS: string;
  EMAIL_ID?: string;
  CITY_NAME: any;
  PINCODE: string;
  COUNTRY_NAME?: any; // New field
  STATE_NAME?: any; // New field
  MOBILE_NO: string;
  LANDMARK?: string; // New field
  LOCALITY?: string; // New field
  ADDRESS_TYPE?: any; // New field
  IS_DEFAULT?: boolean; // New field
  IS_DEFUALT_ADDRESS?: boolean;
  AREA: '';
  CUST_ID?: string; // Assuming CUST_ID is for customer association
  SESSION_KEY: any;
  COUNTRY_CODE: any;
  CITY_ID: any;
  STATE_ID: any;
  COUNTRY_ID: any;
  PICKUP_LOCATION_ID?: any; // New field for pickup location
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent {
  @Input() cartDetails: any;
  savedAddresses: any[] = [];
  @Input() subtotal: any;
  @Input() selectedDiscount: number = 0;
  @Input() selectedPrice: number = 0;
  @Input() userId: any;
  cityList: any[] = [];
  hasAddresses: boolean = false;
  @Output() orderPlaced = new EventEmitter<boolean>(); // Changed output to reflect order placement

  // New properties for drawer management
  @Input() addressDrawerOpen: boolean = false; // Controls the overall drawer visibility
  @Output() visibleChange = new EventEmitter<boolean>();
  currentStep: number = 2;
  showAddressForm: boolean = false; // Controls which view is shown inside the drawer (list or form)

  isEditingAddress: boolean = false;
  currentAddressId: string | null = null;
  // For the "Add New Address" button on the prompt screen (optional, if delay is expected)
  isTransitioning: boolean = false;

  // For the action buttons on the Address List screen
  // isEditingID: number | null = null; // ID of the address currently being edited/loaded for edit
  isDeletingID: number | null = null; // ID of the address currently being deleted
  isContinuingToPay: boolean = false; // For the sticky footer button

  // For the Save/Update button on the Address Form
  isSavingAddress: boolean = false;
  addressForm: Address = {
    NAME: '',
    ADDRESS: '',
    MOBILE_NO: '',
    EMAIL_ID: '',
    CITY_NAME: '',
    PINCODE: '',
    COUNTRY_NAME: '',
    STATE_NAME: '',
    LANDMARK: '',
    LOCALITY: '',
    ADDRESS_TYPE: 'R',
    AREA: '',
    IS_DEFAULT: false,
    IS_DEFUALT_ADDRESS: false,
    SESSION_KEY: '',
    COUNTRY_CODE: '+1',
    CITY_ID: 0,
    STATE_ID: 0,
    COUNTRY_ID: 0,
    PICKUP_LOCATION_ID: 0,
  };

  countryList: any[] = [];
  stateList: any[] = [];
  pincodeList: any[] = [];
  Shiping_Charge: any = '';

  public commonFunction = new CommonFunctionService(); // Ensure this path is correct
  encryptedmail: string = sessionStorage.getItem('email') || '';
  encryptedmobno: string = sessionStorage.getItem('mobno') || '';
  cartId: any;
  searchQuery: any;
  filteredCountryCodes!: { label: string; value: string }[];
  showCountryDropdown!: boolean;
  paymentConfiguration: any;
  cartIcon!: SafeHtml;
  addressIcon!: SafeHtml;
  paymentIcon!: SafeHtml;
  constructor(
    private api: ApiServiceService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private cookie: CookieService,
    private router: Router,
    private cartService: CartService,
    private sanitizer: DomSanitizer
  ) {
    this.cartService.cartUpdated$.subscribe((cartItems) => {
      this.cartDetails.cartDetails = cartItems;

      // this.toastr.success('Item Added to cart', 'Success')
      // this.loadingProducts = false;
      // this.cd.detectChanges(); // Optional but ensures view update
    });
    this.cartIcon = this.sanitizer.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>`);

    this.addressIcon = this.sanitizer.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>`);

    this.paymentIcon = this.sanitizer.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6">
        <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>`);
  }

  showOrderSummaryModal: boolean = false;
  public isMobile: boolean = false;
  ngOnInit() {
    // console.log(sessionStorage.getItem('IS_GUEST'));
    this.fetchCountries();
    // this.addressDrawerOpen=false
    this.cartId = this.cartDetails?.cartDetails[0]?.CART_ID || '';
    // console.log('this is cartdetails: ', this.cartDetails);
    this.fetchPincodes('1');
    this.fetchShipingcharges();
    // this.addressDrawerOpen=true
    // console.log(this.fetchPincodes('1'));
  }

  MOBILE_BREAKPOINT = 768;
  // 2. Decorator to listen for the 'resize' event on the global 'window' object
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.checkMobile();
    // Use ChangeDetectorRef to explicitly trigger change detection if needed
    // this.cdr.detectChanges();
  }

  // 3. The core logic: updates the 'isMobile' flag based on screen width
  private checkMobile(): void {
    // If the window width is less than 992px, it's considered mobile
    this.isMobile = window.innerWidth < this.MOBILE_BREAKPOINT;
  }
  photoURL = this.api.retriveimgUrl + 'productImages/';
  // --- Drawer Management Functions ---
  imageIndices: { [productId: string]: number } = {};

  getImageArray(product: any): string[] {
    try {
      const images = JSON.parse(product?.PHOTO_URL);
      // console.log(images,'images')
      // console.log(this.imageIndices,'imagesIndices')
      return images.map((img: any) => img);
    } catch (e) {
      // console.error('Invalid image format', e);
      return [];
    }
  }

  // Initialize index safely
  initImageIndex(productId: number) {
    if (!(productId in this.imageIndices)) {
      this.imageIndices[productId] = 0;
    }
  }
  /**
   * Opens the main address management drawer, showing the list of addresses by default.
   */
  openAddressDrawer() {
    this.verificationStatus = 'pending';
    this.addressDrawerOpen = true;
    this.showAddressForm = false; // Always show the list when opening the drawer
  }

  /**
   * Closes the entire address management drawer.
   */
  closeAddressDrawer() {
    // this.verificationStatus='initial'

    this.visibleChange.emit(false);
    this.addressDrawerOpen = false;
    // Optional: Reset form state when closing the drawer completely
    this.resetAddressForm();
    this.currentAddressId = null; // Clear any active editing
    // setTimeout(() => {
    //   window.location.reload(); // Reload the page to reflect any changes
    // }, 6000);
    // window.location.reload(); // Reload the page to reflect any changes
  }

  /**
   * Opens the address form within the drawer,
   * either for adding a new address or editing an existing one.
   * @param addressId The ID of the address to edit, or null for a new address.
   */
  // openAddressForm(addressId: string | null = null) {
  //   // console.log('Opening address form for ID:', addressId);
  //   this.showAddressForm = true; // Switch to the form view inside the drawer
  //   if (addressId) {
  //     this.isEditingAddress = true;
  //     this.currentAddressId = addressId;
  //     const addressToEdit = this.savedAddresses.find(
  //       (addr) => addr.ID === addressId
  //     );

  //     // console.log('Address to edit:', addressToEdit);
  //     if (addressToEdit) {
  //       this.addressForm = { ...addressToEdit }; // Create a copy for editing
  //       // if (this.addressForm.COUNTRY_ID) {
  //       // this.fetchStates(this.addressForm.COUNTRY_ID); // Load states for the selected country
  //       // this.fetchPincodes(this.addressForm.PINCODE);
  //       this.prefillCountryStateCity();
  //       // }
  //     } else {
  //       // console.error('Address not found for editing:', addressId);
  //       this.toastr.error('Address not found.', 'Error');
  //       this.resetAddressForm(); // Reset if address not found
  //       this.isEditingAddress = false;
  //       this.currentAddressId = null;
  //     }
  //   } else {
  //     this.isEditingAddress = false;
  //     this.currentAddressId = null;
  //     this.resetAddressForm(); // Reset for a new address
  //   }
  // }
  openAddressForm(addressId: string | null = null) {
    // console.log('Opening address form for ID:', addressId);
    this.showAddressForm = true; // Switch to the form view inside the drawer
    if (addressId) {
      this.isEditingAddress = true;
      this.currentAddressId = addressId;
      const addressToEdit = this.savedAddresses.find(
        (addr) => addr.ID === addressId
      );

      if (addressToEdit) {
        this.addressForm = Object.assign({}, addressToEdit);
        this.citySearch = addressToEdit.CITY_NAME;
        this.stateSearch = addressToEdit.STATE_NAME;
        this.prefillCountryStateCity();
        if (addressToEdit.EMAIL_ID) {
          this.verificationStatus = 'verified';
        }

        // this.verificationStatus = 'initial';
        // }
      } else {
        // console.error('Address not found for editing:', addressId);
        this.toastr.error('Address not found.', 'Error');
        this.verificationStatus = 'pending';
        this.resetAddressForm(); // Reset if address not found
        this.isEditingAddress = false;
        this.currentAddressId = null;
      }
    } else {
      this.isEditingAddress = false;
      this.currentAddressId = null;
      // this.resetAddressForm();
      // this.verificationStatus = 'initial'; // Reset for a new address
    }
  }

  /**
   * Switches the drawer view back to the list of saved addresses.
   */

  goBackToAddressList() {
    this.showAddressForm = false; // Switch back to the list view
    this.resetAddressForm(); // Clear form data just in case
  }

  // --- Address Management Core Functions ---
  loadingScreen = true;
  fetchSavedAddresses() {
    let euid = sessionStorage.getItem('userId');
    let duid = euid ? this.commonFunction.decryptdata(euid) : null;
    this.cartDetails.cartDetails = this.cartService.getCartItems();
    if (this.userId || duid) {
      var filter = ` AND CUST_ID = ${this.userId || duid}`;
    } else {
      var filter = ` AND SESSION_KEY = '${this.SESSION_KEYS}'`;
    }
    this.api.getCustomeraddressweb(0, 0, 'id', 'desc', filter).subscribe(
      (response: any) => {
        if (response['code'] === 200) {
          this.loadingScreen = false;

          if (response['count'] == 0) {
            this.hasAddresses = false;
            // if (sessionStorage.getItem('IS_GUEST')) {
            this.showAddressForm = true;
            // }
          } else {
            this.hasAddresses = true;
          }

          this.addressDrawerOpen = true; // Ensure drawer is open when addresses are fetched
          this.savedAddresses = response['data'].map((addr: any) => ({
            ID: addr.ID,
            NAME: addr.NAME,
            ADDRESS: addr.ADDRESS,
            CITY_ID: addr.CITY_ID ?? 0,
            STATE_ID: addr.STATE_ID ?? 0,
            COUNTRY_ID: addr.COUNTRY_ID ?? 0,
            CITY_NAME: addr.CITY_NAME,
            PINCODE: addr.PINCODE,
            COUNTRY_NAME: addr.COUNTRY_NAME,
            EMAIL_ID: addr.EMAIL_ID,
            STATE_NAME: addr.STATE_NAME,
            LANDMARK: addr.LANDMARK,
            LOCALITY: addr.LOCALITY,
            ADDRESS_TYPE: addr.ADDRESS_TYPE,
            IS_DEFAULT: addr.IS_DEFUALT_ADDRESS == 1 ? true : false,
            IS_DEFUALT_ADDRESS: addr.IS_DEFUALT_ADDRESS == 1 ? true : false,
            CUST_ID: addr.CUST_ID,
            SESSION_KEY: addr.SESSION_KEY,
            MOBILE_NO: addr.MOBILE_NO,
            COUNTRY_CODE: addr.COUNTRY_CODE,
            IS_LOCAL_PICKUP: addr?.IS_LOCAL_PICKUP,
          }));
          this.selectedAddress =
            this.savedAddresses.find((a) => a.IS_DEFAULT) ||
            this.savedAddresses[0];

          this.IS_LOCAL_PICKUP = this.selectedAddress?.IS_LOCAL_PICKUP;
          // console.log(this.selectedAddress,'Default selected')
          if (
            this.selectedAddress &&
            this.selectedAddress.COUNTRY_NAME != null
          ) {
            sessionStorage.setItem(
              'address',
              String(this.selectedAddress.COUNTRY_NAME)
            );
          }
          if (this.selectedAddress && this.selectedAddress.PINCODE != null) {
            sessionStorage.setItem(
              'pincode',
              String(this.selectedAddress.PINCODE)
            );
          }
          if (this.selectedAddress) {
            sessionStorage.setItem(
              'COUNTRY_NAME',
              this.getCountryFromID(this.selectedAddress.COUNTRY_NAME)
            );
            var CART_ID = this.cartDetails.cartDetails[0].CART_ID;
            var CART_ITEM_ID = this.cartDetails.cartDetails[0].ID;
            var COUNTRY_NAME = this.addressForm.COUNTRY_NAME;
            var ADDRESS_ID = this.addressForm.ID;
            this.cartDetails.cartDetails = this.cartService.getCartItems();
            this.cartId = this.cartDetails?.cartDetails[0]?.CART_ID || '';
            this.cartDetails.cartDetails[0]['COUNTRY_ID'] = COUNTRY_NAME;
            this.cartDetails.cartDetails[0]['ADDRESS_ID'] = ADDRESS_ID;
            this.cartDetails.cartDetails[0]['CART_ID'] = CART_ID;
            this.cartDetails.cartDetails[0]['CART_ITEM_ID'] = CART_ITEM_ID;
            this.cartDetails.cartDetails[0]['PINCODE'] =
              this.addressForm.PINCODE;
            this.cartService.currentProduct = this.cartDetails.cartDetails[0];
            this.cartService.updateCartToServewithouttoastrr();
            this.cartService.cartUpdated.next(this.cartService.cartItems);
            // console.log(this.cartService.cartItems)
            // this.cartDetails.cartDetails = this.cartService.getCartItems();
            // console.log(this.cartDetails.cartDetails);
          }
          // console.log(this.fetchPincodes(this.selectedAddress.PINCODE));
        } else {
          this.toastr.error('Failed to load saved addresses.', 'Error');
          this.savedAddresses = [];
          this.loadingScreen = false;
        }
      },
      (error) => {
        console.error('Error fetching addresses:', error);
        this.savedAddresses = [];
        this.toastr.error('Failed to load saved addresses.', 'Error');
        this.loadingScreen = false;
      }
    );
  }
  getCountryFromID(countryId: number): any {
    const findCountryindex = this.countryList.findIndex(
      (data) => data.ID == countryId
    );
    // console.log(findCountryindex, this.countryList, countryId);
    if (findCountryindex > -1) {
      return this.countryList[findCountryindex].NAME;
    } else {
      return '';
    }
  }
  onSelectAddress(address: any) {
    if (address && address.COUNTRY_NAME != null) {
      this.selectedAddress = address; // Update selected address
      // console.log('Selected address')
      sessionStorage.setItem('address', String(address.COUNTRY_NAME));
      sessionStorage.setItem(
        'COUNTRY_NAME',
        this.getCountryFromID(address.COUNTRY_NAME)
      ); // Update sessionStorage
      // Update sessionStorage
      this.IS_LOCAL_PICKUP = address?.IS_LOCAL_PICKUP;
      sessionStorage.setItem('pincode', String(address.PINCODE));
      var CART_ID = this.cartDetails.cartDetails[0].CART_ID;
      var CART_ITEM_ID = this.cartDetails.cartDetails[0].ID;
      var COUNTRY_NAME = address.COUNTRY_NAME;
      var ADDRESS_ID = address.ID;
      this.cartDetails.cartDetails[0]['COUNTRY_ID'] = COUNTRY_NAME;
      this.cartDetails.cartDetails[0]['COUNTRY_NAME'] =
        this.getCountryFromID(COUNTRY_NAME);
      this.cartDetails.cartDetails[0]['ADDRESS_ID'] = ADDRESS_ID;
      this.cartDetails.cartDetails[0]['CART_ID'] = CART_ID;
      this.cartDetails.cartDetails[0]['CART_ITEM_ID'] = CART_ITEM_ID;
      this.cartDetails.cartDetails[0]['PINCODE'] = address.PINCODE;
      this.cartService.currentProduct = this.cartDetails.cartDetails[0];
      this.cartService.updateCartToServewithouttoastrr();
      // this.cartService.cartUpdated.next(this.cartService.cartItems);

      // console.log(this.cartService.cartItems)

      // this.cartDetails.cartDetails = this.cartService.getCartItems();
      // console.log(this.cartDetails.cartDetails);

      // console.log('Country ID saved to sessionStorage:', address.COUNTRY_ID);
    }
  }

  resetAddressForm() {
    this.addressForm = {
      NAME: '',
      MOBILE_NO: '',
      ADDRESS: '',
      CITY_NAME: '',
      PINCODE: '',
      COUNTRY_NAME: '',
      STATE_NAME: '',
      LANDMARK: '',
      LOCALITY: '',
      ADDRESS_TYPE: undefined,
      IS_DEFAULT: false,
      AREA: '',
      SESSION_KEY: '',
      CITY_ID: 0,
      STATE_ID: 0,
      COUNTRY_ID: 0,
      PICKUP_LOCATION_ID: 0,
      COUNTRY_CODE: '+1',
    };
    // this.stateList = []; // Clear states when resetting country
    // this.pincodeList = [];
  }

  sessionkey: string = sessionStorage.getItem('SESSION_KEYS') || '';
  SESSION_KEYS = this.commonFunction.decryptdata(this.sessionkey);

  onDefaultAddressChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.addressForm.IS_DEFAULT = target.checked;
    // console.log('Checkbox changed to:', this.addressForm.IS_DEFAULT);
  }

  saveAddress(form: NgForm) {
    // if (form.invalid) {
    //   this.toastr.error('Please fill all required fields.', '');
    //   return;
    // }
    // console.log(this.addressForm);
    if (
      (this.addressForm.NAME == '' ||
        this.addressForm.NAME == null ||
        this.addressForm.NAME == undefined) &&
      (this.addressForm.MOBILE_NO == '' ||
        this.addressForm.MOBILE_NO == null ||
        this.addressForm.MOBILE_NO == undefined) &&
      (this.addressForm.EMAIL_ID == '' ||
        this.addressForm.EMAIL_ID == null ||
        this.addressForm.EMAIL_ID == undefined) &&
      (this.addressForm.ADDRESS == '' ||
        this.addressForm.ADDRESS == null ||
        this.addressForm.ADDRESS == undefined) &&
      (this.addressForm.LANDMARK == '' ||
        this.addressForm.LANDMARK == null ||
        this.addressForm.LANDMARK == undefined) &&
      (this.addressForm.COUNTRY_NAME == '' ||
        this.addressForm.COUNTRY_NAME == null ||
        this.addressForm.COUNTRY_NAME == undefined) &&
      (this.addressForm.STATE_NAME == '' ||
        this.addressForm.STATE_NAME == null ||
        this.addressForm.STATE_NAME == undefined) &&
      (this.addressForm.CITY_NAME == '' ||
        this.addressForm.CITY_NAME == null ||
        this.addressForm.CITY_NAME == undefined) &&
      (this.addressForm.PINCODE == '' ||
        this.addressForm.PINCODE == null ||
        this.addressForm.PINCODE == undefined) &&
      (!this.addressForm.ADDRESS_TYPE ||
        !this.addressForm.ADDRESS_TYPE.trim()) &&
      this.addressForm.IS_DEFAULT === false
    ) {
      // this.isOk = false;
      this.toastr.error(' Please Fill All Required Fields ', '');
      return;
    } else if (
      this.addressForm.NAME == null ||
      this.addressForm.NAME.trim() == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Enter Name', '');
      return;
    } else if (
      this.addressForm.MOBILE_NO == null ||
      this.addressForm.MOBILE_NO.trim() == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Enter Mobile Number', '');
      return;
    } else if (
      this.addressForm.EMAIL_ID == null ||
      this.addressForm.EMAIL_ID == undefined
    ) {
      // this.isOk = false;
      this.toastr.error('Please Enter Email', '');
      return;
    } else if (
      this.addressForm.EMAIL_ID &&
      !this.commonFunction.emailpattern.test(this.addressForm.EMAIL_ID)
    ) {
      // this.isOk = false;

      this.toastr.error('Please Enter Valid Email', '');
      return;
    } else if (
      this.addressForm.ADDRESS == null ||
      this.addressForm.ADDRESS.trim() == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Enter Address', '');
      return;
    } else if (
      this.addressForm.COUNTRY_NAME == undefined ||
      this.addressForm.COUNTRY_NAME == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Select Country/Region', '');
      return;
    } else if (
      this.addressForm.STATE_NAME == undefined ||
      this.addressForm.STATE_NAME == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Select State/Province', '');
      return;
    } else if (
      this.addressForm.CITY_NAME == null ||
      this.addressForm.CITY_NAME == undefined
    ) {
      // this.isOk = false;
      this.toastr.error('Please Select Twon/City', '');
      return;
    } else if (
      this.addressForm.PINCODE == undefined ||
      this.addressForm.PINCODE == '' ||
      this.addressForm.PINCODE.trim() === ''
    ) {
      // this.isOk = false;
      this.toastr.error(' Please Enter Pincode/ZIP ', '');
      return;
    } else if (
      !this.addressForm.ADDRESS_TYPE ||
      !this.addressForm.ADDRESS_TYPE.trim()
    ) {
      this.toastr.error('Please Select Address Type', '');
      return;
    }
    // } else if (this.addressForm.IS_DEFAULT === false) {
    //   this.toastr.error('Please specify if this is default', '');
    //   return;
    // }

    if (
      !this.addressForm.COUNTRY_CODE ||
      this.addressForm.COUNTRY_CODE == '' ||
      this.addressForm.COUNTRY_CODE == null ||
      this.addressForm.COUNTRY_CODE == undefined
    ) {
      this.addressForm.COUNTRY_CODE = '+1';
    }

    if (this.userId) {
      this.addressForm.CUST_ID = this.userId;
    } else {
      this.addressForm.SESSION_KEY = this.SESSION_KEYS;
    }
    this.loadingScreen = true;

    sessionStorage.setItem('pincode', String(this.addressForm.PINCODE));
    if (this.isEditingAddress && this.currentAddressId) {
      this.addressForm.IS_DEFAULT = Boolean(this.addressForm.IS_DEFAULT);
      this.addressForm.IS_DEFUALT_ADDRESS = Boolean(
        this.addressForm.IS_DEFAULT
      );
      this.isSavingAddress = true;

      this.api.updateAddressMaster(this.addressForm).subscribe({
        next: (response: any) => {
          this.isSavingAddress = false;
          this.loadingScreen = false;

          if (response.code === 200) {
            this.toastr.success('Address updated successfully!', 'Success');
            // console.log(this.addressForm);
            this.fetchSavedAddresses();
            this.goBackToAddressList();
          } else {
            this.toastr.error(
              'Failed to update address: ' + response.message,
              'Error'
            );
            this.loadingScreen = false;
          }
        },
        error: () => {
          this.toastr.error(
            'Error updating address. Please try again.',
            'Error'
          );
          this.isSavingAddress = false;
          this.loadingScreen = false;
        },
      });
    } else {
      this.addressForm.IS_DEFUALT_ADDRESS = Boolean(
        this.addressForm.IS_DEFAULT
      );
      this.isSavingAddress = true;

      this.api.createAddressMaster(this.addressForm).subscribe({
        next: (response: any) => {
          this.isSavingAddress = false;
          this.loadingScreen = false;

          if (response.code === 200) {
            this.toastr.success('Address added successfully!', 'Success');
            this.addressForm.ID = response.data?.ID || String(Date.now());
            // console.log(this.addressForm);
            this.fetchSavedAddresses();
            this.goBackToAddressList();
          } else {
            this.toastr.error(
              'Failed to add address: ' + response.message,
              'Error'
            );
            this.loadingScreen = false;
          }
        },
        error: () => {
          this.isSavingAddress = false;
          this.loadingScreen = false;

          this.toastr.error('Error adding address. Please try again.', 'Error');
        },
      });
    }
  }

  deleteAddress(addressID: any, customer_id: any) {
    // console.log('Deleting Address ID:', addressID, 'Customer ID:', customer_id);
    this.api.DeleteAddress(addressID, customer_id).subscribe(
      (data: any) => {
        if (data['code'] == 200) {
          this.toastr.success(' Address Removed Successfully...', '');
          this.fetchSavedAddresses();
        } else {
          this.toastr.error('Address Remove Failed...', '');
        }
      },
      (err: any) => {
        // console.log(err);
      }
    );
  }

  // // Modified to directly proceed to checkout without payment gateway
  // selectAddressForDelivery(address: Address) {
  //   localStorage.setItem('selectedAddress', JSON.stringify(address));

  //   // Define parameters for proceedToCheckout
  //   const paymentMode = 'O'; // Changed to COD or any other direct payment mode
  //   const paymentKey = 'N/A'; // No payment gateway key
  //   const paymentStatus = 'S'; // Direct to order placed status
  //   const paymentDatetime = this.datePipe.transform(
  //     new Date(),
  //     'yyyy-MM-dd HH:mm:ss'
  //   );
  //   this.toastr.success('Order placed successfully!', 'Success');

  //   this.api
  //     .proceedToCheckout(
  //       paymentMode,
  //       address.ID, // Use the selected address ID
  //       this.cartId,
  //       this.userId,
  //       paymentKey,
  //       paymentStatus,
  //       paymentDatetime,
  //       1 // clientId
  //     )
  //     .subscribe({
  //       next: (response) => {
  //         console.log('Proceed to Checkout API Success:', response);
  //         if (response['code'] === 200) {
  //           this.toastr.success('Order placed successfully!', 'Success');
  //           this.orderPlaced.emit(true); // Emit that order is placed
  //           this.closeAddressDrawer(); // Close the drawer after a successful order
  //           // You might want to navigate to an order confirmation page here
  //         } else {
  //           this.toastr.error(
  //             'Failed to place order: ' + response['message'],
  //             'Error'
  //           );
  //         }
  //       },
  //       error: (error: any) => {
  //         console.error('Proceed to Checkout API Error:', error);
  //         this.toastr.error(
  //           'Failed to place order. Please try again.',
  //           'Error'
  //         );
  //       },
  //     });
  // }

  // --- Country and State Dropdowns ---

  fetchCountries() {
    this.api.getAllCountryMaster(0, 0, 'id', 'desc', '').subscribe(
      (response: any) => {
        if (response['code'] === 200) {
          this.countryList = response['data'];
          this.fetchSavedAddresses();
        } else {
          console.error('Failed to fetch countries:', response['message']);
          this.countryList = [];
        }
      },
      (error: any) => {
        console.error('Error fetching countries:', error);
        this.countryList = [];
        this.toastr.error('Failed to load countries.', 'Error');
      }
    );
  }

  onCountryChange(countryname: number) {
    this.addressForm.STATE_NAME = '';
    // Clear state selection on country change
    this.stateList = []; // Clear state list
    if (countryname) {
      this.fetchStates(countryname);
    }
    // if (countryId == '1') {
    //   this.fetchPincodes(countryId);
    // }
  }

  fetchStates(countryId: number) {
    this.isLoadingStates = true;
    this.api
      .getState(0, 0, 'id', 'desc', `AND COUNTRY_ID=${countryId} AND STATUS=1`)
      .subscribe(
        (res: any) => {
          this.isLoadingStates = false;
          if (res.code === 200) {
            this.stateList = res.data;
            const selectedState = this.stateList.find(
              (s) => s.ID === this.addressForm.STATE_NAME
            );
            this.addressForm.STATE_ID = selectedState ? selectedState.ID : 0;

            if (selectedState) {
              this.stateSearch = selectedState.NAME;
              this.fetchCities(selectedState.ID);

              // Wait for cities to load, then prefill city
              // setTimeout(() => {

              // }, 300);
            } else {
              // console.log(this.addressForm);
              this.stateSearch = this.stateSearch;
            }
          } else {
            this.stateList = [];
          }
        },
        (error) => {
          this.isLoadingStates = false;
          console.error('Error fetching states:', error);
        }
      );
  }
  filterCountriesd(event: any) {
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

  get selectedShippingCharge(): number {
    // console.log(this.pincodeList)
    if (!this.pincodeList?.length || !this.selectedAddress.PINCODE) return 0;

    // Convert both to string to ensure exact match
    const match = this.pincodeList.find(
      (p) =>
        String(p.PINCODE).trim() === String(this.selectedAddress.PINCODE).trim()
    );

    // console.log(match.SHIPPING_CHARGES);
    return match ? Number(match.SHIPPING_CHARGES) : 0;
  }
  // Assuming 'this.paymentConfiguration' is a property in your component (e.g., initialized as null)

  fetchShipingcharges() {
    this.api.getAllCharges(0, 0, 'id', 'desc', '').subscribe(
      (response: any) => {
        if (
          response['code'] === 200 &&
          response['data'] &&
          Array.isArray(response['data'])
        ) {
          const dataList = response['data'];

          // 1. Find the object where KEY1 is 'PAYMENT_CONFIGURATION'
          const paymentConfig = dataList.find(
            (data: any) => data.KEY1 === 'PAYMENT_CONFIGURATION'
          );

          if (paymentConfig) {
            // 2. Extract VALUE_1
            this.paymentConfiguration = paymentConfig.VALUE_1;
            // console.log(
            //   'Payment Configuration Value:',
            //   this.paymentConfiguration
            // );
          } else {
            console.log('Payment configuration not found in data.');
          }
        } else {
          // console.error('Failed to fetch data or data is empty/invalid:', response['message']);
          // this.pincodeList = [];
        }
      },
      (error: any) => {
        // console.error('Error fetching data:', error);
        this.toastr.error('Failed to load configuration data.', 'Error');
      }
    );
  }

  // Don't forget to declare the property in your component class:
  // paymentConfiguration: string | null = null;
  fetchPincodes(status: string) {
    this.api.getPincodeData(0, 0, 'id', 'desc', 'AND STATUS=1').subscribe(
      (response: any) => {
        if (response['code'] === 200) {
          this.pincodeList = response['data'];
          // console.log(this.pincodeList,response,'Debug')
        } else {
          // console.error('Failed to fetch pincode:', response['message']);
          this.pincodeList = [];
        }
      },
      (error: any) => {
        // console.error('Error fetching pincode:', error);
        this.pincodeList = [];
        this.toastr.error('Failed to load pincode.', 'Error');
      }
    );
  }
  card: any;
  showPaymentModal = false;
  selectedAddress: any = null;
  // proceedToPayment() {
  //   let userID=sessionStorage.getItem('userId');
  //   let decryptedUserID:any;
  //   if(userID){
  //      decryptedUserID = this.commonFunction.decryptdata(userID);
  //   }
  //   this.showOrderSummaryModal = false;
  //   if (this.paymentConfiguration == '1') {
  //     this.initiateSquarePayment(); // custom method to render Square card form
  //     this.showPaymentModal = true;
  //   } else {
  //     const baseUrl = this.api.baseUrl;
  //     const headers = new HttpHeaders({
  //       'Content-Type': 'application/json',
  //       applicationkey: this.api.commonapplicationkey,
  //       apikey: this.api.commonapikey,
  //       token: sessionStorage.getItem('token') || '',
  //       supportkey: this.cookie.get('supportKey'),
  //     });
  //     this.http
  //       .post(
  //         baseUrl + 'web/cart/proceedToPaymentTesting',
  //         {
  //           amount:this.IS_LOCAL_PICKUP==1 && this.deliveryOption == 'pickup'?
  //           (this.selectedPrice -
  //               this.selectedDiscount) * 100 :
  //             (this.selectedPrice -
  //               this.selectedDiscount +
  //               (this.cartDetails?.cartDetails?.[0]?.['DATA'].NET_AMOUNT -
  //                 this.cartDetails?.cartDetails?.[0]?.['DATA']
  //                   .TOTAL_DISCOUNT_AMOUNT)) *
  //             100,
  //           PAYMENT_MODE: 'O',
  //           ADDRESS_ID: this.selectedAddress!.ID,
  //           CART_ID: this.cartId,
  //           CUSTOMER_ID: this.userId ? Number(this.userId) : decryptedUserID ? Number(decryptedUserID) : 0,
  //           SESSION_KEY: this.SESSION_KEYS,
  //           COUNTRY_NAME: this.selectedAddress.COUNTRY_NAME,
  //           STATE_NAME: this.selectedAddress.STATE_NAME,
  //           CITY_NAME: this.selectedAddress.CITY_NAME,
  //           PINCODE: this.selectedAddress.PINCODE,
  //           COUNTRY_CODE: this.selectedAddress.COUNTRY_CODE,
  //           CLIENT_ID: 1,
  //           IS_LOCAL_PICKUP:this.deliveryOption=='pickup'?this.selectedAddress?.IS_LOCAL_PICKUP:0,
  //           PICKUP_LOCATION_MASTER_ID:this.PICKUP_LOCATION_MASTER_ID,
  //           MOBILE_NO:this.selectedAddress.MOBILE_NO
  //         },
  //         {
  //           headers,
  //         }
  //       )
  //       .subscribe({
  //         next: (response: any) => {
  //           // const paymentKey = response.payment.id;
  //           // const paymentStatus = 'S';
  //           // const paymentDatetime = this.datePipe.transform(
  //           //   new Date(),
  //           //   'yyyy-MM-dd HH:mm:ss'
  //           // );
  //           if (response.code == 200) {
  //             this.toastr.success('Payment successful!', 'Success');
  //             this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] =
  //               response.invoiceNumber;

  //             var redirectionOrderId = response.order_id;
  //             this.currentStep = 4;
  //             // this.closePaymentModal();
  //             // this.orderPlaced.emit(true);
  //             // this.visibleChange.emit(false);
  //             this.isProcessingPayment = false;

  //             this.showPaymentModal = false;
  //             // this.showReceiptModal = true;

  //             this.router
  //               .navigate(['order'], {
  //                 queryParams: { orderId: redirectionOrderId },
  //               })
  //               .then(() => {
  //                 this.addressDrawerOpen = false;
  //                 this.cartService.cartItems = [];
  //                 this.cartService.cartUpdated.next(this.cartService.cartItems);
  //                 this.cartService.updateCartCount();
  //               });
  //             setTimeout(() => {
  //               this.enableDownload = true;
  //             }, 5000);
  //             // this.paymentSuccessModalVisible = true;
  //           } else {
  //             this.toastr.error('Payment failed!', 'Error');
  //             this.isProcessingPayment = false;
  //           }
  //           // console.log(response.body);

  //           // this.api
  //           //   .proceedToCheckout(
  //           //     'S',
  //           //     this.selectedAddress!.ID,
  //           //     this.cartId,
  //           //     this.userId,
  //           //     paymentKey,
  //           //     paymentStatus,
  //           //     paymentDatetime,
  //           //     1
  //           //   )
  //           //   .subscribe({
  //           //     next: (res) => {
  //           //       if (res.code === 200) {
  //           //         this.toastr.success(
  //           //           'Order placed successfully!',
  //           //           'Success'
  //           //         );
  //           //         this.closeAddressDrawer();
  //           //         this.closePaymentModal();
  //           //       } else {
  //           //         this.toastr.error(
  //           //           'Failed to place order: ' + res.message,
  //           //           'Error'
  //           //         );
  //           //       }
  //           //     },
  //           //     error: (err) => {
  //           //       this.toastr.error('Checkout failed after payment', 'Error');
  //           //     },
  //           //   });
  //         },
  //         error: () => {
  //           this.isProcessingPayment = false;

  //           this.toastr.error('Payment failed. Please try again.', 'Error');
  //         },
  //       });
  //   }
  // }
  paymentSuccessModalVisible: boolean = false;

  // processPaymentWithToken() {
  // Your existing payment code here...

  // On success:

  // }
  // live:sq0idp-MZsV8XmKikjtR3cQ_FqOXw
  // test:sandbox-sq0idb-rV2VaHliz7OXmsejGzJq4Q
  isLoadingCard = false;
  async initiateSquarePayment() {
    if (!this.selectedAddress) {
      this.toastr.error('Please select an address first.', 'Error');
      return;
    }

    this.isLoadingCard = true; // Start loader
    this.showPaymentModal = true;

    await this.delay(50); // Allow modal to render

    try {
      const payments = await (window as any).Square.payments(
        'sandbox-sq0idb-rV2VaHliz7OXmsejGzJq4Q',
        ''
      );
      this.card = await payments.card();
      await this.card.attach('#card-container');
    } catch (e) {
      console.error('Error loading Square payment form:', e);
      this.toastr.error(
        'Failed to load payment form. Please try again.',
        'Error'
      );
      this.closePaymentModal();
    } finally {
      this.isLoadingCard = false; // Stop loader
    }
  }

  isProcessingPayment = false;
  enableDownload = false;
  async processPaymentWithToken() {
    let userID = sessionStorage.getItem('userId');
    let decryptedUserID: any;
    if (userID) {
      decryptedUserID = this.commonFunction.decryptdata(userID);
    }
    this.isProcessingPayment = true;
    if (!this.selectedAddress) {
      this.toastr.error('No address selected.', 'Error');
      return;
    }

    // Ensure the card object exists before trying to use it
    if (!this.card) {
      this.toastr.error(
        'Payment form not initialized. Please try again.',
        'Error'
      );
      return;
    }

    const cardResult = await this.card.tokenize();

    if (cardResult.status === 'OK') {
      // console.log('Card tokenization successful:', cardResult);ks
      const token = cardResult.token;
      const baseUrl = this.api.baseUrl;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        applicationkey: this.api.commonapplicationkey,
        apikey: this.api.commonapikey,
        token: sessionStorage.getItem('token') || '',
        supportkey: this.cookie.get('supportKey'),
      });
      if (this.userId) {
        this.SESSION_KEYS = '';
      }

      this.http
        .post(
          baseUrl + 'web/cart/proceedToPayment',
          {
            nonce: token,
            amount:
              this.IS_LOCAL_PICKUP == 1 && this.deliveryOption == 'pickup'
                ? (this.selectedPrice - this.selectedDiscount) * 100
                : (this.selectedPrice -
                    this.selectedDiscount +
                    (this.cartDetails?.cartDetails?.[0]?.['DATA'].NET_AMOUNT -
                      this.cartDetails?.cartDetails?.[0]?.['DATA']
                        .TOTAL_DISCOUNT_AMOUNT)) *
                  100,
            PAYMENT_MODE: 'O',
            ADDRESS_ID: this.selectedAddress!.ID,
            CART_ID: this.cartId,
            CUSTOMER_ID: this.userId
              ? Number(this.userId)
              : decryptedUserID
              ? Number(decryptedUserID)
              : 0,
            SESSION_KEY: this.SESSION_KEYS,
            COUNTRY_NAME: this.selectedAddress.COUNTRY_NAME,
            STATE_NAME: this.selectedAddress.STATE_NAME,
            CITY_NAME: this.selectedAddress.CITY_NAME,
            PINCODE: this.selectedAddress.PINCODE,
            COUNTRY_CODE: this.selectedAddress.COUNTRY_CODE,

            IS_LOCAL_PICKUP:
              this.deliveryOption == 'pickup'
                ? this.selectedAddress?.IS_LOCAL_PICKUP
                : 0,
            PICKUP_LOCATION_MASTER_ID: this.PICKUP_LOCATION_MASTER_ID,
            MOBILE_NO: this.selectedAddress.MOBILE_NO,
            CLIENT_ID: 1,
          },
          {
            headers,
          }
        )
        .subscribe({
          next: (response: any) => {
            // const paymentKey = response.payment.id;
            // const paymentStatus = 'S';
            // const paymentDatetime = this.datePipe.transform(
            //   new Date(),
            //   'yyyy-MM-dd HH:mm:ss'
            // );
            if (response.code == 200) {
              this.toastr.success('Payment successful!', 'Success');
              this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] =
                response.invoiceNumber;

              var redirectionOrderId = response.order_id;
              this.currentStep = 4;
              // this.closePaymentModal();
              // this.orderPlaced.emit(true);
              // this.visibleChange.emit(false);
              this.isProcessingPayment = false;

              this.showPaymentModal = false;
              // this.showReceiptModal = true;

              this.router
                .navigate(['order'], {
                  queryParams: { orderId: redirectionOrderId },
                })
                .then(() => {
                  this.addressDrawerOpen = false;
                  this.cartService.cartItems = [];
                  this.cartService.cartUpdated.next(this.cartService.cartItems);
                  this.cartService.updateCartCount();
                });
              setTimeout(() => {
                this.enableDownload = true;
              }, 5000);
              // this.paymentSuccessModalVisible = true;
            } else {
              this.toastr.error('Payment failed!', 'Error');
              this.isProcessingPayment = false;
            }
            // console.log(response.body);

            // this.api
            //   .proceedToCheckout(
            //     'S',
            //     this.selectedAddress!.ID,
            //     this.cartId,
            //     this.userId,
            //     paymentKey,
            //     paymentStatus,
            //     paymentDatetime,
            //     1
            //   )
            //   .subscribe({
            //     next: (res) => {
            //       if (res.code === 200) {
            //         this.toastr.success(
            //           'Order placed successfully!',
            //           'Success'
            //         );
            //         this.closeAddressDrawer();
            //         this.closePaymentModal();
            //       } else {
            //         this.toastr.error(
            //           'Failed to place order: ' + res.message,
            //           'Error'
            //         );
            //       }
            //     },
            //     error: (err) => {
            //       this.toastr.error('Checkout failed after payment', 'Error');
            //     },
            //   });
          },
          error: () => {
            this.isProcessingPayment = false;

            this.toastr.error('Payment failed. Please try again.', 'Error');
          },
        });
    } else {
      this.isProcessingPayment = false;

      this.toastr.error('Card validation failed.', 'Error');
    }
  }
  closePaymentModal() {
    this.showPaymentModal = false;
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  // goToOrderDetails() {
  //   this.closePaymentModal();
  //   this.orderPlaced.emit(true);
  //   this.visibleChange.emit(false);
  //   this.cartService.showSection('orders-section');
  //   this.router.navigate(['/profile'])// change as needed; // change to your route
  // }
  goToProfileSection(section: string) {
    // Close mobile menu when profile section is clicked
    // this.isMobileMenuOpen = false;
    // window.dispatchEvent(new Event('cartUpdated'));
    // Navigate to profile route with query param
    this.router
      .navigate(['/profile'], {
        queryParams: { section },
      })
      .then(() => {
        // this.addressDrawerOpen = false;
        this.visibleChange.emit(false);
        this.orderPlaced.emit(true);
        this.cartService.cartItems = [];
        this.cartService.cartUpdated.next(this.cartService.cartItems);
        this.cartService.updateCartCount();
        // window.location.reload();
        // window.scrollTo(0, 0);
      });
  }

  goToProductListing() {
    this.router.navigate(['/product-list']).then(() => {
      this.visibleChange.emit(false);
      this.orderPlaced.emit(true);
      this.cartService.cartItems = [];
      this.cartService.cartUpdated.next(this.cartService.cartItems);
      this.cartService.updateCartCount();
      // window.location.reload();
    }); // change as needed
  }

  goBackToCart() {
    this.addressDrawerOpen = false;
    this.visibleChange.emit(false); // Notify parent to close drawer
    // Optionally: show cart drawer if controlled separately
  }
  IS_LOCAL_PICKUP: any;
  PICKUP_LOCATION_MASTER_ID: any;
  MOBILE_NO: any;
  steped() {
    this.currentStep = 3;
    if (
      this.selectedAddress.IS_LOCAL_PICKUP == 1 &&
      this.deliveryOption == 'pickup' &&
      !this.selectedPickupName
    ) {
      this.toastr.error('Please select local pickup location');
      return;
    }
    // console.log(this.cartDetails)
    this.showOrderSummaryInDrawer = true;
    this.isStepActive('payment');
  }
  desteper() {
    this.currentStep = 2;
  }
vareintImageUrl: string = this.api.retriveimgUrl + 'VarientImages/';
  showOrderSummaryInDrawer: boolean = false;

  openr() {
    this.currentStep = 2;
    this.showOrderSummaryInDrawer = false;
    this.isEditingAddress = false;
    this.showAddressForm = true;
    this.countrySearch = '';
    this.citySearch = '';
    this.stateSearch = '';
    this.filteredStates = [];
    this.filteredCities = [];
    this.resetAddressForm();
    // this.openAddressDrawer();
    // this.verificationStatus='initial'
  }

  isLoadingCountries = false;
  isLoadingStates = false;
  isLoadingCities = false;

  countrySearch = '';
  stateSearch = '';
  citySearch: string = '';
  filteredCountries: any[] = [];
  filteredStates: any[] = [];
  filteredCities: any[] = [];
  // Filter countries based on search (case-insensitive, partial match)
  onCountryBlur() {
    // Delay clearing so click on suggestion registers
    setTimeout(() => (this.filteredCountries = []), 100);
  }

  onStateBlur() {
    this.addressForm.STATE_NAME = this.stateSearch;
    setTimeout(() => (this.filteredStates = []), 100);
  }

  selectCountry(country: any) {
    // Set the selected value
    this.addressForm.COUNTRY_NAME = country.NAME ?? this.countrySearch;
    this.addressForm.COUNTRY_ID = country.ID ?? 0;
    this.countrySearch = country.NAME;
    this.filteredCountries = [];
    this.fetchStates(country.ID);
  }

  selectCountrycode(country: any) {
    this.addressForm.COUNTRY_CODE = country;
    // console.log('Selected country code:', this.addressForm.COUNTRY_CODE);
    // this.data.COUNTRY_CODE = this.selectedCountryCode;
    this.showCountryDropdown = false;
    this.searchQuery = '';
  }
  selectState(state: any) {
    this.addressForm.STATE_NAME = state.NAME ?? this.stateSearch;
    this.addressForm.STATE_ID = state.ID ?? 0;
    this.stateSearch = state.NAME;
    this.filteredStates = [];
    this.fetchCities(state.ID);
  }

  filterCountries() {
    const term = this.countrySearch?.trim().toLowerCase();
    if (!term) {
      this.filteredCountries = [];
      return;
    }

    this.filteredCountries = this.countryList?.filter((c) =>
      c.NAME.toLowerCase().includes(term)
    );
  }

  filterStates() {
    const term = this.stateSearch.trim().toLowerCase();
    if (!term) {
      this.filteredStates = [];
      return;
    }

    this.filteredStates = this.stateList.filter((s) =>
      s.NAME.toLowerCase().includes(term)
    );
  }

  // Add button logic: only show if no exact match
  get showAddCountryOption(): any {
    const term = this.countrySearch?.trim().toLowerCase();
    return term && !this.countryList.some((c) => c.NAME.toLowerCase() === term);
  }

  get showAddStateOption(): any {
    const term = this.stateSearch?.trim().toLowerCase();
    return term && !this.stateList.some((s) => s.NAME.toLowerCase() === term);
  }

  createCountry(name: string) {
    const payload = {
      ID: 0,
      NAME: name,
      STATUS: true,
      SEQUENCE_NO: 0,
      SHORT_CODE: this.generateShortCode(name),
      CLIENT_ID: 1,
    };

    this.isLoadingCountries = true;
    this.api
      .getAllCountryMaster(1, 1, '', '', 'AND STATUS=1')
      .subscribe((res) => {
        if (res.code == 200) {
          payload.SEQUENCE_NO = res.data[0].SEQUENCE_NO + 1;
          this.api.createCountry(payload).subscribe(
            (response: any) => {
              this.isLoadingCountries = false;
              if (response.code === 200) {
                this.toastr.success('Country added successfully');
                const newCountry = { ID: response.ID, NAME: name };

                setTimeout(() => {
                  this.fetchCountries();
                  // this.countryList.push(newCountry);
                  this.selectCountry(newCountry); // ✅ auto-select// ✅ auto-select
                }, 200);
              } else {
                this.toastr.error(
                  response.message || 'Failed to create country'
                );
              }
            },
            (error) => {
              this.isLoadingCountries = false;
              this.toastr.error('Error creating country');
            }
          );
        }
      });
  }

  // ------------------ CITY ------------------

  onCityBlur() {
    this.addressForm.CITY_NAME = this.citySearch;
    setTimeout(() => (this.filteredCities = []), 100);
  }

  selectCity(city: any) {
    this.addressForm.CITY_NAME = city.NAME ?? this.citySearch;
    // this.addressForm.CITY_ID = city.ID ?? 0;
    this.citySearch = city.NAME;
    this.filteredCities = [];
    // 1. Store the city's unique ID
    //    (Use the correct property from your city object, e.g., city.ID, city.cityId)
    this.addressForm.CITY_ID = city.ID ?? 0; // <-- IMPORTANT

    // 2. If the user changes the city, reset the pickup location
    // this.clearPickupLocation();

    // 3. (Optional) Automatically search if "Local Pickup" is already selected
    // if (this.addressForm.ADDRESS_TYPE === 'P') {
    //   this.findPickupLocations();
    // }
  }

  filterCities() {
    const term = this.citySearch.trim().toLowerCase();
    if (!term) {
      this.filteredCities = [];
      return;
    }

    this.filteredCities = this.cityList.filter((c) =>
      c.NAME.toLowerCase().includes(term)
    );
  }

  get showAddCityOption(): any {
    const term = this.citySearch.trim().toLowerCase();
    return term && !this.cityList.some((c) => c.NAME.toLowerCase() === term);
  }

  fetchCities(stateId: number) {
    this.isLoadingCities = true;
    this.api
      .getCityData(
        0,
        0,
        'id',
        'desc',
        'AND IS_ACTIVE=1 AND STATE_ID=' + stateId
      )
      .subscribe(
        (response: any) => {
          this.isLoadingCities = false;
          if (response.code === 200) {
            this.cityList = response.data;
            const selectedCity = this.cityList.find(
              (c) => c.ID === this.addressForm.CITY_NAME
            );
            this.addressForm.CITY_ID = selectedCity ? selectedCity.ID : 0;
            this.citySearch = selectedCity
              ? selectedCity.NAME
              : this.citySearch;
            // console.log('citySearch', this.citySearch);
          } else {
            this.cityList = [];
          }
        },
        (error: any) => {
          this.isLoadingCities = false;
          console.error('Error fetching cities:', error);
          this.cityList = [];
        }
      );
  }
  createState(name: string) {
    if (!this.addressForm.COUNTRY_NAME) {
      this.toastr.warning('Please select a country first');
      return;
    }

    const payload = {
      ID: 0,
      NAME: name,
      STATUS: true,
      SEQUENCE_NO: 0,
      COUNTRY_ID: this.addressForm.COUNTRY_NAME,
      SHORT_CODE: this.generateShortCode(name),
      CLIENT_ID: 1,
    };

    this.isLoadingStates = true;
    this.api.getState(1, 1, '', '', 'AND STATUS=1').subscribe((res) => {
      if (res.code == 200) {
        payload.SEQUENCE_NO = res.data[0].SEQUENCE_NO + 1;
        this.api.createState(payload).subscribe(
          (response: any) => {
            this.isLoadingStates = false;
            if (response.code === 200) {
              this.toastr.success('State added successfully');
              const newState = { ID: response.ID, NAME: name };
              // ✅ auto-select
              setTimeout(() => {
                this.fetchStates(this.addressForm.COUNTRY_NAME);
                // this.stateList.push(newState);

                this.selectState(newState); // ✅ auto-select
              }, 200);
            } else {
              this.toastr.error(response.message || 'Failed to create state');
            }
          },
          (error) => {
            this.isLoadingStates = false;
            this.toastr.error('Error creating state');
          }
        );
      }
    });
  }

  prefillCountryStateCity() {
    // --- Prefill Country ---
    const selectedCountry = this.countryList.find(
      (c) => c.ID === this.addressForm.COUNTRY_NAME
    );

    if (selectedCountry) {
      this.countrySearch = this.addressForm.COUNTRY_NAME;
      this.fetchStates(selectedCountry.ID);

      // Wait for states to load, then prefill state
      // setTimeout(() => {

      // }, 300);
    } else {
      this.countrySearch = this.addressForm.COUNTRY_NAME;
    }
  }

  // Called on input change for country
  onCountryInputChange() {
    // console.log(this.countrySearch)
    // If country input is empty, clear selection
    if (!this.countrySearch || this.countrySearch?.trim() === '') {
      this.addressForm.COUNTRY_NAME = null; // clear selected ID
      this.filteredCountries = [];

      // Clear state too
      this.addressForm.STATE_NAME = null;
      this.stateSearch = '';
      this.filteredStates = [];
      this.stateList = []; // optional: reset state list
    }
    this.addressForm.COUNTRY_NAME = this.countrySearch;
  }
  generateShortCode(name: string): string {
    if (!name) return '';
    // Take the first two letters, uppercase
    return name.trim().substring(0, 2).toUpperCase();
  }
  generateShortCodeCity(name: string): string {
    if (!name) return '';
    return name
      .trim()
      .replace(/\s+/g, '') // remove spaces
      .substring(0, 3) // take first 3 letters
      .toUpperCase();
  }
  createCity(name: string) {
    if (!this.addressForm.COUNTRY_NAME) {
      this.toastr.warning('Please select a country first');
      return;
    }
    if (!this.addressForm.STATE_NAME) {
      this.toastr.warning('Please select a state first');
      return;
    }

    const payload = {
      ID: 0,
      NAME: name,
      IS_ACTIVE: true,
      SEQUENCE_NO: 0,
      COUNTRY_ID: this.addressForm.COUNTRY_NAME,
      STATE_ID: this.addressForm.STATE_NAME,
      SHORT_CODE: this.generateShortCodeCity(name),
      CLIENT_ID: 1,
    };

    this.isLoadingCities = true;
    this.api.getCityData(1, 1, '', '', 'AND IS_ACTIVE=1').subscribe((res) => {
      if (res.code == 200) {
        payload.SEQUENCE_NO = res.data[0].SEQUENCE_NO + 1;
        this.api.createCity(payload).subscribe(
          (response: any) => {
            this.isLoadingCities = false;
            if (response.code === 200) {
              this.toastr.success('City added successfully');
              const newCity = { ID: response.ID, NAME: name };
              // this.cityList.push(newCity);
              setTimeout(() => {
                this.fetchCities(this.addressForm.STATE_NAME);
                this.selectCity(newCity); // ✅ auto-select
              }, 200);
            } else {
              this.toastr.error(response.message || 'Failed to create city');
            }
          },
          (error) => {
            this.isLoadingCities = false;
            this.toastr.error('Error creating city');
          }
        );
      }
    });
  }

  goToStep(step: 'cart' | 'address' | 'payment') {
    // Only allow navigation to completed or active steps
    if (step === 'cart') {
      this.currentStep = 1;
      sessionStorage.setItem('step', this.currentStep.toString());
      this.visibleChange.emit(true);
      this.closeAddressDrawer(); // Close the drawer first
      // Note: If they click 'address', it just closes the drawer
      // if it's already the active step, or navigates to the address page.
      // If (step === 'address') { this.router.navigate(['/address']); }
    } else if (step === 'address') {
      this.currentStep = 2;
      this.hasAddresses = true;
      this.showOrderSummaryInDrawer = false;
      // Logic for future steps like 'payment' (maybe show a warning)
      // console.log('Cannot navigate to payment yet.');
    }
    // else if(step === 'payment'){
    //   // this.isStepActive(step)
    //   this.hasAddresses=false
    //   this.showOrderSummaryInDrawer=true
    // }
  }
  isStepActive(step: 'cart' | 'address' | 'payment'): boolean {
    if (step === 'cart') return this.currentStep >= 1;
    if (step === 'address') return this.currentStep >= 2;
    if (step === 'payment') return this.currentStep >= 3;
    return false;
  }

  isEmailValid(): boolean {
    const email = this.addressForm.EMAIL_ID;
    this.isChanged = 1;
    if (!email) return false;

    // A simple check against the regex.
    // In a real app, you would reference the form control's validity state.
    const regex = new RegExp(this.commonFunction.emailpattern);
    return regex.test(email);
  }

  verificationStatus: 'initial' | 'pending' | 'verified' | 'failed' = 'initial';
  // 2. The verification function
  loadingButton = false;
  verifyEmail(): void {
    if (!this.isEmailValid()) {
      this.toastr.info('Please enter a valid email address before verifying.');
      return;
    }
    this.loadingButton = true;
    this.verificationStatus = 'pending';
    // this.visible=true
    // --- REAL-WORLD SCENARIO: Call an API ---
    // In a real application, you would make an API call here
    // (e.g., using a service to send a verification code or token).

    // console.log(`Attempting to verify email: ${this.addressForm.EMAIL_ID}`);

    // Simulate an API delay and success/failure logic
    // setTimeout(() => {
    //   // Logic for verification success (e.g., if API returns status 200)
    //   const success = true; // Replace with actual API response check

    //   if (success) {
    //     this.verificationStatus = 'verified';
    //     // Optionally, disable the input after verification
    //     // document.getElementById('emailId')?.setAttribute('disabled', 'true');
    //   } else {
    //     this.verificationStatus = 'failed';
    //   }
    // }, 2000); // 2-second simulation delay
    this.api.verifyEmail(this.addressForm.EMAIL_ID).subscribe(
      (res) => {
        if (res['code'] == 200) {
          this.toastr.success('Otp Sent Successfully');
          this.loadingButton = false;
          this.startTimer();
          this.visible = true;
        } else {
          this.toastr.error('Failed to send otp');
          this.verificationStatus = 'failed';
          this.loadingButton = false;
        }
      },
      (err) => {
        this.verificationStatus = 'failed';
        this.loadingButton = false;
      }
    );
  }
  otp: string[] = ['', '', '', ''];
  otpSent: boolean = false;
  otpVerified: boolean = false;
  resendOTP: boolean = false;
  showRegisterOtp: boolean = false;
  countdownTime: number = 180; // Countdown time in seconds
  remainingTime: number = this.countdownTime;
  // otp: string[] = ['', '', '', '']; // For 4-digit OTP
  // statusCode: string = '';
  // remainingTime: number = 60;
  isverifyOTP: boolean = false;
  timerSubscription: any;
  statusCode: any = '';
  visible: boolean = false;
  dismiss() {
    this.visible = false;
    this.remainingTime = this.countdownTime;
  }
  @ViewChild('otpInputs') otpInputs: ElementRef | undefined;

  // Method to move to the next input field
  // Method to move to the next input field
  //   @ViewChild('otpInputs') otpInputs: ElementRef | undefined;
  // otp: string[] = ['', '', '', '', '', ''];  // OTP Array to store individual digits

  // Method to move to the next input field
  // moveToNext(event: KeyboardEvent, index: number) {
  //   if (event.key === 'Backspace' && !this.otp[index] && index > 0) {
  //     // If backspace is pressed on empty input, move to previous input
  //     const prevInput = document.getElementsByClassName('otp-input')[
  //       index - 1
  //     ] as HTMLInputElement;
  //     if (prevInput) {
  //       prevInput.focus();
  //     }
  //   }
  // }

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
    this.otp = ['', '', '', ''];
  }
  // handleEnterKey(content: any) {
  //   if (this.isSendOpt) {
  //   } else {
  //     // Otherwise, call the existing function for the second button
  //     this.loginforgot(content);
  //   }
  // }
  allowOnlyNumbers(event: any, index: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, ''); // Remove non-digits
    input.value = value;

    if (value && index < this.otp.length - 1) {
      const next =
        document.querySelectorAll<HTMLInputElement>('input[type=text]')[
          index + 1
        ];
      next?.focus();
    }
  }
  // handlePaste(event: ClipboardEvent) {
  //   event.preventDefault();
  //   const pastedData = event.clipboardData?.getData('text');
  //   if (pastedData && /^\d{4}$/.test(pastedData)) {
  //     // If pasted data is 4 digits, distribute across inputs
  //     for (let i = 0; i < 4; i++) {
  //       this.otp[i] = pastedData[i];
  //     }
  //   }
  // }
  onOtpInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Allow only one digit per box
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    input.value = value;
    this.otp[index] = value;

    // Move focus to next input if a digit is entered
    if (value && index < this.otp.length - 1) {
      const next =
        document.querySelectorAll<HTMLInputElement>('.otp-input')[index + 1];
      next?.focus();
    }

    // Auto-submit if all digits entered
    if (
      this.otp.join('').length === this.otp.length &&
      !this.otp.includes('')
    ) {
      this.VerifyOTP();
    }
  }

  moveToNext(event: KeyboardEvent, index: number) {
    const inputs = document.querySelectorAll<HTMLInputElement>('.otp-input');

    if (event.key === 'Backspace') {
      if (!(inputs[index] as HTMLInputElement).value && index > 0) {
        (inputs[index - 1] as HTMLInputElement).focus();
      }
    }

    // Optional: handle arrow navigation
    if (event.key === 'ArrowLeft' && index > 0) {
      (inputs[index - 1] as HTMLInputElement).focus();
    } else if (event.key === 'ArrowRight' && index < inputs.length - 1) {
      (inputs[index + 1] as HTMLInputElement).focus();
    }
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const cleanData = pastedData.replace(/\D/g, '').slice(0, 4);

    if (cleanData) {
      for (let i = 0; i < 4; i++) {
        this.otp[i] = cleanData[i] || '';
        const input =
          document.querySelectorAll<HTMLInputElement>('.otp-input')[i];
        (input as HTMLInputElement).value = this.otp[i] || '';
      }

      // Focus last field
      const lastInput =
        document.querySelectorAll<HTMLInputElement>('.otp-input')[
          cleanData.length - 1
        ];
      lastInput?.focus();

      // Auto-submit if complete
      if (cleanData.length === this.otp.length) {
        this.VerifyOTP();
      }
    }
  }
  // handleLoginEnterKey(content: any) {
  //   if (this.isloginSendOTP) {
  //   } else {
  //     // Otherwise, call the existing function for the second button
  //     this.loginotpverification(content);
  //   }
  // }
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
    this.remainingTime = 180; // reset timer
    this.startTimer();
    //  if (this.whichOTP == 'login') {
    //    this.loginotpverification();
    //  } else if (this.whichOTP == 'register') {
    //    this.save();
    //  }
  }
  resendforgotOtp(content: any) {
    this.otpSent = false; // Resend OTP action
    this.remainingTime = 180; // Reset timer
    this.startTimer();
  }

  startTimer(): void {
    if (this.timerSubscription) {
      return;
    }

    const maxDuration = 180; // 30 seconds max
    this.remainingTime = Math.min(this.remainingTime, maxDuration);

    this.timerSubscription = interval(1000)
      .pipe(takeWhile(() => this.remainingTime > 0))
      .subscribe({
        next: () => this.remainingTime--,
        complete: () => (this.timerSubscription = null),
      });
  }

  ngOnDestroy() {
    // Unsubscribe from the timer when the component is destroyed
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
  isOk = true;
  VerifyOTP() {
    if (this.otp.join('').length < 4) {
      this.toastr.error('Please Enter OTP...', '');
      return;
    }
    // this.isverifyOTP = true; // Set true before API call
    // console.log(this.isverifyOTP,'this.isverifyOTP')
    const otp1 = Number(this.otp.join(''));
    this.isverifyOTP = true; // Set true before API call
    // this.loadData();
    // console.log(this.whichOTP)
    // if (this.whichOTP == 'login') {
    // let CLOUD_ID = this.cookie.get('CLOUD_ID');
    //  this.USER_NAME = this.data.CUSTOMER_NAME
    // this.USER_NAME = sessionStorage.getItem('USER_NAME');
    // console.log(this.USER_NAME, ' this.USER_NAME');
    this.api
      .verifyEmailOTP(
        otp1,
        this.addressForm.EMAIL_ID // this.USER_ID,
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
            // this.modalService.dismissAll();
            this.isOk = false;
            // this.createCustomer();
            this.visible = false;
            this.verificationStatus = 'verified';
            // this.openRegister = false;
            // this.openVerify = false;

            this.otp = ['', '', '', '', '', ''];
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
          // console.error('verifyOTP API failed:', errorResponse);s
          if (errorResponse.error.code === 300) {
            this.toastr.error(
              'Invalid request. Please check the entered details.'
            );
            // console.log('xxx');
            this.statusCode = 'invalid OTP';
            // this.stopLoader();
          } else {
            // console.log('sss');
            this.toastr.error('Something went wrong. Please try again.');
            this.statusCode = '';
            // this.stopLoader();
          }
          // console.log('kkkkk');
          this.isverifyOTP = false;
          // this.stopLoader();
        },
      });
    // }
  }

  today = new Date();
  showReceiptModal = false;

  closeReceiptModal() {
    this.showReceiptModal = false;
    this.addressDrawerOpen = false;
    this.visibleChange.emit(false);
    this.orderPlaced.emit(true);
    this.cartService.cartItems = [];
    this.cartService.cartUpdated.next(this.cartService.cartItems);
    this.cartService.updateCartCount();
  }
  // Add this method to handle modal closing
  closeModal(): void {
    this.showAddressForm = false;
    this.verificationStatus = 'pending';
    // Optional: Reset form state when closing

    // Optional: Add any other cleanup logic here
    // this.resetForm(); // If you have a reset method
  }

  //     downloadInvoice() {
  //   // console.log(this.cartDetails.cartDetails)
  //   const fileUrl = this.api.retriveimgUrl + 'Invoice/' + this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] + '.pdf';
  //   const link = document.createElement('a');
  //   link.href = fileUrl;
  //   link.target='_blank'
  //   link.download = 'invoice.pdf';
  //   link.click();
  // }
  // async downloadInvoice() {
  //   const invoiceNumber = this.cartDetails.cartDetails[0]['INVOICE_NUMBER'];
  //     const fileUrl = this.api.retriveimgUrl + 'Invoice/' + this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] + '.pdf';

  //   try {
  //     const response = await fetch(fileUrl, { method: 'GET', mode: 'no-cors' });
  //     if (response.ok) {
  //       const link = document.createElement('a');
  //       link.href = fileUrl;
  //       link.target = '_blank';
  //       link.download = 'invoice.pdf';
  //       link.click();
  //     } else {
  //       console.error('Invoice not ready yet');
  //     }
  //   } catch (error) {
  //     console.error('Error checking invoice:', error);
  //   }
  // }
  isDownloading = false;

  downloadInvoice() {
    this.isDownloading = true;

    const fileUrl =
      this.api.retriveimgUrl +
      'Invoice/' +
      this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] +
      '.pdf';

    // Simulating delay (e.g. 5 seconds for invoice generation)
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = 'invoice.pdf';
      link.click();
      this.isDownloading = false; // stop loader
    }, 10000);
  }

  orderStatus: 'A' | 'BP' | 'SP' | 'D' | 'DD' | 'DC' = 'A'; // Example initial status 'A' (Pending)

  // Mapping the statuses to a numerical step for progress bar calculation
  private statusMap: { [key: string]: number } = {
    A: 1, // Pending
    BP: 2, // Preparing
    SP: 2, // Packaging (Treated as the same step as Preparing for progress display)
    D: 3, // Dispatching
    DD: 4, // Delivered
    DC: 0, // Canceled - special case
  };

  /**
   * Checks if a specific step is completed based on the current order status.
   * @param currentStatus The current order status code.
   * @param stepCode The status code for the step being checked (e.g., 'BP' for Preparing).
   */
  isStatusComplete(currentStatus: string, stepCode: string): boolean {
    if (currentStatus === 'DD') return true; // Delivered means everything before it is complete

    const currentStep = this.statusMap[currentStatus] || 0;
    const checkStep = this.statusMap[stepCode] || 0;

    // A step is complete if the current status is greater than the step's numerical value
    // or if the current status is one of the later stages
    return currentStep > checkStep;
  }

  /**
   * Checks if a specific step is pending (not yet active or complete).
   * Used to apply the gray color.
   * @param currentStatus The current order status code.
   * @param stepCode The status code for the step being checked (e.g., 'BP' for Preparing).
   */
  isStatusPending(currentStatus: string, stepCode: string): boolean {
    const currentStep = this.statusMap[currentStatus] || 0;
    const checkStep = this.statusMap[stepCode] || 0;

    // A step is pending if the current status's step number is less than the check step number
    return currentStep < checkStep;
  }

  /**
   * Calculates the width of the green progress bar.
   * @param currentStatus The current order status code.
   * @returns A string for the CSS width property (e.g., '66%').
   */
  getProgressWidth(currentStatus: string): string {
    const totalSteps = 4; // Total number of main steps (Placed, Preparing, Shipped, Delivered)
    const currentStep = this.statusMap[currentStatus] || 0;

    if (currentStatus === 'DC') return '0%'; // Canceled
    if (currentStep === totalSteps) return '100%'; // Delivered

    // We have 3 gaps between 4 steps. Percentage steps are 0, 33.33, 66.66, 100
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    return `${percentage.toFixed(2)}%`;
  }

  countryCodes = [
    { label: '+91 (India)', value: '+91' },
    { label: '+92 (Pakistan)', value: '+92' },
    { label: '+93 (Afghanistan)', value: '+93' },
    { label: '+94 (Sri Lanka)', value: '+94' },
    { label: '+95 (Myanmar)', value: '+95' },
    { label: '+1 (United States)', value: '+1' },
    // { label: '+1-242 (Bahamas)', value: '+1-242' },
    // { label: '+1-246 (Barbados)', value: '+1-246' },
    // { label: '+1-264 (Anguilla)', value: '+1-264' },
    // { label: '+1-268 (Antigua and Barbuda)', value: '+1-268' },
    // { label: '+1-284 (British Virgin Islands)', value: '+1-284' },
    // { label: '+1-340 (U.S. Virgin Islands)', value: '+1-340' },
    // { label: '+1-345 (Cayman Islands)', value: '+1-345' },
    // { label: '+1-441 (Bermuda)', value: '+1-441' },
    // { label: '+1-473 (Grenada)', value: '+1-473' },
    // { label: '+1-649 (Turks and Caicos Islands)', value: '+1-649' },
    // { label: '+1-664 (Montserrat)', value: '+1-664' },
    // { label: '+1-670 (Northern Mariana Islands)', value: '+1-670' },
    // { label: '+1-671 (Guam)', value: '+1-671' },
    // { label: '+1-684 (American Samoa)', value: '+1-684' },
    // { label: '+1-721 (Sint Maarten)', value: '+1-721' },
    // { label: '+1-758 (Saint Lucia)', value: '+1-758' },
    // { label: '+1-767 (Dominica)', value: '+1-767' },
    // { label: '+1-784 (Saint Vincent and the Grenadines)', value: '+1-784' },
    // { label: '+1-787 (Puerto Rico)', value: '+1-787' },
    // { label: '+1-809 (Dominican Republic)', value: '+1-809' },
    // { label: '+1-829 (Dominican Republic)', value: '+1-829' },
    // { label: '+1-849 (Dominican Republic)', value: '+1-849' },
    // { label: '+1-868 (Trinidad and Tobago)', value: '+1-868' },
    // { label: '+1-869 (Saint Kitts and Nevis)', value: '+1-869' },
    // { label: '+1-876 (Jamaica)', value: '+1-876' },
    // { label: '+1-939 (Puerto Rico)', value: '+1-939' },
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

  onStateInputChange() {
    if (!this.stateSearch || this.stateSearch.trim() === '') {
      this.addressForm.STATE_NAME = null;
      this.filteredStates = [];
    }
    this.addressForm.STATE_NAME = this.stateSearch;
  }

  // by sanju

  onEmailChange() {
    // Reset verification when email changes
    this.verificationStatus = 'initial';
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  isChanged: any = 0;

  pickupLocations: any[] = [];

  // Controls the loading spinner/text
  isLoadingPickupLocations: boolean = false;

  // Shows the "No locations found" message
  showPickupError: boolean = false;

  // Toggles the custom dropdown's visibility
  isPickupDropdownOpen: boolean = false;
  /**
   * Fetches pickup locations based on the selected city.
   * This is triggered by the "Find" button.
   */
  // findPickupLocations() {
  //   // Guard clause: Don't search if no city is selected
  //   if (!this.addressForm.CITY_ID) {
  //     console.error("No city selected. Cannot find locations.");
  //     this.showPickupError = true; // Show an error message
  //     return;
  //   }

  //   console.log("Finding locations for city ID:", this.addressForm.CITY_ID);

  //   // Reset state before searching
  //   this.isLoadingPickupLocations = true;
  //   this.showPickupError = false;
  //   this.pickupLocations = []; // Clear old locations
  //   this.addressForm.PICKUP_LOCATION_ID = null; // Reset selection
  //   this.isPickupDropdownOpen = false; // Close dropdown while searching

  //   // --- SIMULATED API CALL ---
  //   // In a real app, you would replace this setTimeout
  //   // with your 'this.http.get(...)' or 'this.myApiService.getLocations(...)'

  //   setTimeout(() => {
  //     // Mock data - replace with your real API response
  //     // We check the city ID to return different results
  //     if (this.addressForm.CITY_ID === 'city_id_1') { // Use a real ID from your 'selectCity'
  //       this.pickupLocations = [
  //         { id: 'loc_001', name: 'Main Warehouse', address: '123 Main St, Near City Park' },
  //         { id: 'loc_002', name: 'Downtown Hub', address: '456 Central Ave, Suite 100' },
  //         { id: 'loc_003', name: 'Westside Pickup', address: '789 West End Blvd' },
  //         { id: 'loc_004', name: 'Eastside Store', address: '101 East Market' },
  //       ];
  //     } else {
  //       // Simulate no locations found for other cities
  //       this.pickupLocations = [];
  //     }
  //     // --- END SIMULATED API CALL ---

  //     this.isLoadingPickupLocations = false;

  //     if (this.pickupLocations.length > 0) {
  //       this.isPickupDropdownOpen = true; // Automatically open the dropdown to show results
  //     } else {
  //       this.showPickupError = true; // Show "No locations found" message
  //     }
  //   }, 1000); // 1-second delay to simulate network
  // }

  /**
   * Selects a pickup location from the custom dropdown.
   * This is triggered by (mousedown) on an option.
   */
  // selectPickupLocation(location: any) {
  //   // console.log("Selected location:", location);
  //   this.addressForm.PICKUP_LOCATION_ID = location.id;
  //   this.isPickupDropdownOpen = false; // Close dropdown on selection
  // }

  /**
   * Helper function to display the selected location's name in the button.
   * Used by the <span> in your dropdown button.
   */
  getSelectedPickupLocation() {
    if (!this.addressForm.PICKUP_LOCATION_ID) {
      return null;
    }
    // Find the location object in our array by its ID
    return this.pickupLocations.find(
      (loc) => loc.id === this.addressForm.PICKUP_LOCATION_ID
    );
  }

  /**
   * Clears pickup location data when switching back to Residential/Office.
   * This is triggered by (ngModelChange) on those radio buttons.
   */
  clearPickupLocation() {
    this.pickupLocations = [];
    this.addressForm.PICKUP_LOCATION_ID = null;
    this.isLoadingPickupLocations = false;
    this.showPickupError = false;
    this.isPickupDropdownOpen = false;
  }
  deliveryOption: 'delivery' | 'pickup' = 'delivery';
  pickupDropdownOpen = false;
  // selectedPickupLocation: string = '';
  selectedPickupLocation: any;

  // pickupLocations = [
  //   { id: 'loc1', name: 'San Jose Center', address: '123 Main St, San Jose, CA' },
  //   { id: 'loc2', name: 'Downtown Hub', address: '45 Market St, San Jose, CA' },
  //   { id: 'loc3', name: 'West Valley Store', address: '78 Sunset Blvd, San Jose' },
  // ];
  get selectedPickupName(): string | null {
    const p = this.pickupLocations.find(
      (loc) => loc.ID === this.selectedPickupLocation
    );
    this.PICKUP_LOCATION_MASTER_ID = p?.ID;
    // this.IS_LOCAL_PICKUP=p?.IS_LOCAL_PICKUP
    return p ? p.ADDRESS : null;
  }

  // toggle dropdown
  togglePickupDropdown(): void {
    this.pickupDropdownOpen = !this.pickupDropdownOpen;
  }

  // select and close
  selectPickupLocation(location: { ID: any }): void {
    this.selectedPickupLocation = location.ID;
    this.pickupDropdownOpen = false;
  }
  onDeliveryOptionChange(event: any) {
    if (event == 'pickup') {
      this.getPickupLocationByCity(this.selectedAddress.CITY_ID);
    } else {
      this.selectedPickupLocation = null;
    }
  }

  getPickupLocationByCity(cityID: any) {
    this.api
      .getAllpickupLocation(
        0,
        0,
        'id',
        'desc',
        ' AND STATUS=1 AND CITY_ID=' + cityID
      )
      .subscribe((res) => {
        if (res.code == 200) {
          this.pickupLocations = res.data;
        } else {
          this.pickupLocations = [];
        }
      });
  }
  async proceedToPayment() {
    let userID = sessionStorage.getItem('userId');
    let decryptedUserID: any;
    if (userID) {
      decryptedUserID = this.commonFunction.decryptdata(userID);
    }
    // console.log('Proceeding to payment with user ID:', decryptedUserID);

    this.showOrderSummaryModal = false;

    // PayPal mode
    if (this.paymentConfiguration === '1') {
      // 2 = PayPal
      this.initiatePayPalPayment();
      this.showPaymentModal = true;
    } else {
      // Your existing non-PayPal logic (e.g. internal test payments)
      this.callProceedToNonPaymentAPI(decryptedUserID);
    }
  }

  /** ✅ Common function reused by PayPal and direct call **/
  private callProceedToPaymentAPI(decryptedUserID: any) {
    const baseUrl = this.api.baseUrl;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.api.commonapplicationkey,
      apikey: this.api.commonapikey,
      token: sessionStorage.getItem('token') || '',
      supportkey: this.cookie.get('supportKey'),
    });

    this.http
      .post(
        baseUrl + 'web/cart/proceedToPayment',
        {
          amount:
            this.IS_LOCAL_PICKUP == 1 && this.deliveryOption == 'pickup'
              ? (this.selectedPrice - this.selectedDiscount) * 100
              : (this.selectedPrice -
                  this.selectedDiscount +
                  (this.cartDetails?.cartDetails?.[0]?.['DATA'].NET_AMOUNT -
                    this.cartDetails?.cartDetails?.[0]?.['DATA']
                      .TOTAL_DISCOUNT_AMOUNT)) *
                100,
          PAYMENT_MODE: 'O',
          ADDRESS_ID: this.selectedAddress!.ID,
          CART_ID: this.cartId,
          CUSTOMER_ID: this.userId
            ? Number(this.userId)
            : decryptedUserID
            ? Number(decryptedUserID)
            : 0,
          SESSION_KEY: decryptedUserID ? '' : this.SESSION_KEYS,
          COUNTRY_NAME: this.selectedAddress.COUNTRY_NAME,
          STATE_NAME: this.selectedAddress.STATE_NAME,
          CITY_NAME: this.selectedAddress.CITY_NAME,
          PINCODE: this.selectedAddress.PINCODE,
          COUNTRY_CODE: this.selectedAddress.COUNTRY_CODE,
          CLIENT_ID: 1,
          IS_LOCAL_PICKUP:
            this.deliveryOption == 'pickup'
              ? this.selectedAddress?.IS_LOCAL_PICKUP
              : 0,
          PICKUP_LOCATION_MASTER_ID: this.PICKUP_LOCATION_MASTER_ID,
          MOBILE_NO: this.selectedAddress.MOBILE_NO,
          paymentId: this.paymentId || '',
          status: this.status || '',
          responseData: this.response,
        },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          if (response.code == 200) {
            this.toastr.success('Payment successful!', 'Success');
            this.navigateToOrder(response.order_id, response.invoiceNumber);
          } else {
            this.toastr.error('Payment failed!', 'Error');
          }
        },
        error: () => {
          this.toastr.error('Payment failed. Please try again.', 'Error');
        },
      });
  }

  /** ✅ Navigate and clean up after success **/
  private navigateToOrder(orderId: string, invoiceNumber: string) {
    this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] = invoiceNumber;
    this.currentStep = 4;
    this.isProcessingPayment = false;
    this.showPaymentModal = false;

    this.router.navigate(['order'], { queryParams: { orderId } }).then(() => {
      this.addressDrawerOpen = false;
      this.cartService.cartItems = [];
      this.cartService.cartUpdated.next(this.cartService.cartItems);
      this.cartService.updateCartCount();
    });

    setTimeout(() => {
      this.enableDownload = true;
    }, 5000);
  }
  paymentId: string = '';
  status: string = '';
  response: any;
  async initiatePayPalPayment() {
    if (!this.selectedAddress) {
      this.toastr.error('Please select an address first.', 'Error');
      return;
    }
    // console.log(this.selectedAddress);
    await this.delay(100); // Allow modal to render
    const paypalContainer = document.getElementById('paypal-container');
    if (!paypalContainer) return;

    paypalContainer.innerHTML = ''; // clear old buttons

    paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },
        createOrder: (data: any, actions: any) => {
          const amount =
            this.IS_LOCAL_PICKUP == 1 && this.deliveryOption == 'pickup'
              ? this.selectedPrice - this.selectedDiscount
              : this.selectedPrice -
                this.selectedDiscount +
                (this.cartDetails?.cartDetails?.[0]?.['DATA'].NET_AMOUNT -
                  this.cartDetails?.cartDetails?.[0]?.['DATA']
                    .TOTAL_DISCOUNT_AMOUNT);

          const addr = this.selectedAddress;

          return actions.order.create({
            intent: 'CAPTURE',
            payer: {
              name: {
                given_name: addr.NAME.split(' ')[0],
                surname: addr.NAME.split(' ')[1],
              },
              email_address: addr.EMAIL_ID,
              address: {
                address_line_1: addr.ADDRESS,
                address_line_2: addr.addressLine2 || '',
                admin_area_2: addr.CITY_NAME,
                admin_area_1: '',
                postal_code: addr.PINCODE,
                country_code: addr.countryCode || 'US',
              },
            },
            purchase_units: [
              {
                description: 'Checkout Payment',
                amount: { currency_code: 'USD', value: amount },
                shipping: {
                  name: {
                    full_name: `${addr.NAME} `,
                  },
                  email_address: addr.EMAIL_ID,
                  address: {
                    address_line_1: addr.ADDRESS,
                    address_line_2: addr.addressLine2 || '',
                    admin_area_2: addr.CITY_NAME,
                    admin_area_1: '',
                    postal_code: addr.PINCODE,
                    country_code: addr.countryCode || 'US',
                  },
                },
              },
            ],
            application_context: {
              shipping_preference: 'SET_PROVIDED_ADDRESS',
              user_action: 'PAY_NOW',
            },
          });
        },

        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          // console.log('Order approved:', order);
          this.paymentId = order.purchase_units[0].payments.captures[0].id;
          this.status = order.purchase_units[0].payments.captures[0].status;
          this.response = order;
          // this.toastr.success('Payment successful!', 'Success');
          let userID = sessionStorage.getItem('userId');
          let decryptedUserID: any;
          if (userID) {
            decryptedUserID = this.commonFunction.decryptdata(userID);
          }
          // Optionally notify backend
          this.callProceedToPaymentAPI(decryptedUserID);
        },
        onError: (err: any) => {
          console.error('PayPal Checkout error:', err);
          this.toastr.error('Payment failed!', 'Error');
        },
      })
      .render('#paypal-container');
  }
  private callProceedToNonPaymentAPI(decryptedUserID: any) {
    const baseUrl = this.api.baseUrl;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.api.commonapplicationkey,
      apikey: this.api.commonapikey,
      token: sessionStorage.getItem('token') || '',
      supportkey: this.cookie.get('supportKey'),
    });

    this.http
      .post(
        baseUrl + 'web/cart/proceedToPaymentTesting',
        {
          amount:
            this.IS_LOCAL_PICKUP == 1 && this.deliveryOption == 'pickup'
              ? (this.selectedPrice - this.selectedDiscount) * 100
              : (this.selectedPrice -
                  this.selectedDiscount +
                  (this.cartDetails?.cartDetails?.[0]?.['DATA'].NET_AMOUNT -
                    this.cartDetails?.cartDetails?.[0]?.['DATA']
                      .TOTAL_DISCOUNT_AMOUNT)) *
                100,
          PAYMENT_MODE: 'O',
          ADDRESS_ID: this.selectedAddress!.ID,
          CART_ID: this.cartId,
          CUSTOMER_ID: this.userId
            ? Number(this.userId)
            : decryptedUserID
            ? Number(decryptedUserID)
            : 0,
          SESSION_KEY: decryptedUserID ? '' : this.userId ? '' :this.SESSION_KEYS,
          COUNTRY_NAME: this.selectedAddress.COUNTRY_NAME,
          STATE_NAME: this.selectedAddress.STATE_NAME,
          CITY_NAME: this.selectedAddress.CITY_NAME,
          PINCODE: this.selectedAddress.PINCODE,
          COUNTRY_CODE: this.selectedAddress.COUNTRY_CODE,
          CLIENT_ID: 1,
          IS_LOCAL_PICKUP:
            this.deliveryOption == 'pickup'
              ? this.selectedAddress?.IS_LOCAL_PICKUP
              : 0,
          PICKUP_LOCATION_MASTER_ID: this.PICKUP_LOCATION_MASTER_ID,
          MOBILE_NO: this.selectedAddress.MOBILE_NO,
        },
        { headers }
      )
      .subscribe({
        next: (response: any) => {
          if (response.code == 200) {
            this.toastr.success('Payment successful!', 'Success');
            this.navigateToOrder(response.order_id, response.invoiceNumber);
          } else {
            this.toastr.error('Payment failed!', 'Error');
          }
        },
        error: () => {
          this.toastr.error('Payment failed. Please try again.', 'Error');
        },
      });
  }
}
