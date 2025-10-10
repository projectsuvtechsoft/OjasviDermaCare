import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
declare var Razorpay: any;
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/Service/cart.service';
import { NgForm } from '@angular/forms';
interface Address {
  ID?: string; // Made optional for new addresses
  NAME: string;
  ADDRESS: string;
  CITY_ID: any;
  PINCODE: string;
  COUNTRY_ID?: any; // New field
  STATE_ID?: any; // New field
  MOBILE_NO: string;
  LANDMARK?: string; // New field
  LOCALITY?: string; // New field
  ADDRESS_TYPE?: any; // New field
  IS_DEFAULT?: boolean; // New field
  IS_DEFUALT_ADDRESS?: boolean;
  CUST_ID?: string; // Assuming CUST_ID is for customer association
  SESSION_KEY: any;
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
  @Input() userId: any;
  cityList: any[] = [];
 
  @Output() orderPlaced = new EventEmitter<boolean>(); // Changed output to reflect order placement

  // New properties for drawer management
  @Input() addressDrawerOpen: boolean = false; // Controls the overall drawer visibility
  @Output() visibleChange = new EventEmitter<boolean>();
  currentStep: number = 2;
  showAddressForm: boolean = false; // Controls which view is shown inside the drawer (list or form)

  isEditingAddress: boolean = false;
  currentAddressId: string | null = null;

 addressForm: Address = {
    NAME: '',
    ADDRESS: '',
    MOBILE_NO: '',
    CITY_ID: '',
    PINCODE: '',
    COUNTRY_ID: '',
    STATE_ID: '',
    LANDMARK: '',
    LOCALITY: '',
    ADDRESS_TYPE: 'Residential',
    IS_DEFAULT: false,
    IS_DEFUALT_ADDRESS: false,
    SESSION_KEY: '',
  };

  countryList: any[] = [];
  stateList: any[] = [];
  pincodeList: any[] = [];
  Shiping_Charge: any = '';

  public commonFunction = new CommonFunctionService(); // Ensure this path is correct
  encryptedmail: string = sessionStorage.getItem('email') || '';
  encryptedmobno: string = sessionStorage.getItem('mobno') || '';
  cartId: any;

  constructor(
    private api: ApiServiceService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private http: HttpClient,
    private cookie: CookieService,
    private router: Router,
    private cartService: CartService
  ) {
    this.cartService.cartUpdated$.subscribe((cartItems) => {
      this.cartDetails.cartDetails = cartItems;

      // this.toastr.success('Item Added to cart', 'Success')
      // this.loadingProducts = false;
      // console.log('cart items', this.cartItems);
      // this.cd.detectChanges(); // Optional but ensures view update
    });
  }

  showOrderSummaryModal: boolean = false;
  ngOnInit() {
    // console.log(this.cartDetails);

    // this.addressDrawerOpen=false
    this.fetchSavedAddresses();
    this.cartId = this.cartDetails.cartDetails[0]?.CART_ID || '';
    this.fetchCountries();
    // console.log('this is cartdetails: ', this.cartDetails);
    this.fetchPincodes('1');
    this.fetchShipingcharges();
    // this.addressDrawerOpen=true
    // console.log(this.fetchPincodes('1'));
  }

  // --- Drawer Management Functions ---

  /**
   * Opens the main address management drawer, showing the list of addresses by default.
   */
  openAddressDrawer() {
    this.addressDrawerOpen = true;
    this.showAddressForm = false; // Always show the list when opening the drawer
  }

  /**
   * Closes the entire address management drawer.
   */
  closeAddressDrawer() {
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
  openAddressForm(addressId: string | null = null) {
    // console.log('Opening address form for ID:', addressId);
    this.showAddressForm = true; // Switch to the form view inside the drawer
    if (addressId) {
      this.isEditingAddress = true;
      this.currentAddressId = addressId;
      const addressToEdit = this.savedAddresses.find(
        (addr) => addr.ID === addressId
      );
 
      // console.log('Address to edit:', addressToEdit);
      if (addressToEdit) {
        this.addressForm = { ...addressToEdit }; // Create a copy for editing
        if (this.addressForm.COUNTRY_ID) {
          this.fetchStates(this.addressForm.COUNTRY_ID); // Load states for the selected country
          // this.fetchPincodes(this.addressForm.PINCODE);
          this.prefillCountryStateCity();
        }
      } else {
        // console.error('Address not found for editing:', addressId);
        this.toastr.error('Address not found.', 'Error');
        this.resetAddressForm(); // Reset if address not found
        this.isEditingAddress = false;
        this.currentAddressId = null;
      }
    } else {
      this.isEditingAddress = false;
      this.currentAddressId = null;
      this.resetAddressForm(); // Reset for a new address
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

fetchSavedAddresses() {
    if (this.userId) {
      var filter = ` AND CUST_ID = ${this.userId}`;
    } else {
      var filter = ` AND SESSION_KEY = '${this.SESSION_KEYS}'`;
    }
    this.api.getCustomeraddressweb(0, 0, 'id', 'desc', filter).subscribe(
      (response: any) => {
        if (response['code'] === 200) {
          this.addressDrawerOpen = true; // Ensure drawer is open when addresses are fetched
          this.savedAddresses = response['data'].map((addr: any) => ({
            ID: addr.ID,
            NAME: addr.NAME,
            ADDRESS: addr.ADDRESS,
            CITY_ID: addr.CITY_ID,
            PINCODE: addr.PINCODE,
            COUNTRY_ID: addr.COUNTRY_ID,
            STATE_ID: addr.STATE_ID,
            LANDMARK: addr.LANDMARK,
            LOCALITY: addr.LOCALITY,
            ADDRESS_TYPE: addr.ADDRESS_TYPE,
            IS_DEFAULT: addr.IS_DEFUALT_ADDRESS == 1 ? true : false,
            CUST_ID: addr.CUST_ID,
            SESSION_KEY: addr.SESSION_KEY,
            MOBILE_NO: addr.MOBILE_NO,
          }));
          this.selectedAddress =
            this.savedAddresses.find((a) => a.IS_DEFAULT) ||
            this.savedAddresses[0];
 
          if (this.selectedAddress && this.selectedAddress.COUNTRY_ID != null) {
            sessionStorage.setItem(
              'address',
              String(this.selectedAddress.COUNTRY_ID)
            );
          }
          if (this.selectedAddress && this.selectedAddress.PINCODE != null) {
            sessionStorage.setItem(
              'pincode',
              String(this.selectedAddress.PINCODE)
            );
          }
          if (this.selectedAddress) {
            var CART_ID = this.cartDetails.cartDetails[0].CART_ID;
            var CART_ITEM_ID = this.cartDetails.cartDetails[0].ID;
            var COUNTRY_ID = this.addressForm.COUNTRY_ID;
            var ADDRESS_ID = this.addressForm.ID;
            this.cartDetails.cartDetails[0]['COUNTRY_ID'] = COUNTRY_ID;
            this.cartDetails.cartDetails[0]['ADDRESS_ID'] = ADDRESS_ID;
            this.cartDetails.cartDetails[0]['CART_ID'] = CART_ID;
            this.cartDetails.cartDetails[0]['CART_ITEM_ID'] = CART_ITEM_ID;
            this.cartDetails.cartDetails[0]['PINCODE'] =
              this.addressForm.PINCODE;
            this.cartService.currentProduct = this.cartDetails.cartDetails[0];
            this.cartService.updateCartToServer();
            this.cartService.cartUpdated.next(this.cartService.cartItems);
            // console.log(this.cartService.cartItems)
            // this.cartDetails.cartDetails = this.cartService.getCartItems();
            // console.log(this.cartDetails.cartDetails);
          }
          // console.log(this.fetchPincodes(this.selectedAddress.PINCODE));
        } else {
          this.toastr.error('Failed to load saved addresses.', 'Error');
          this.savedAddresses = [];
        }
      },
      (error) => {
        console.error('Error fetching addresses:', error);
        this.savedAddresses = [];
        this.toastr.error('Failed to load saved addresses.', 'Error');
      }
    );
  }

  onSelectAddress(address: any) {
    if (address && address.COUNTRY_ID != null) {
      this.selectedAddress = address; // Update selected address
      sessionStorage.setItem('address', String(address.COUNTRY_ID)); // Update sessionStorage
      sessionStorage.setItem('pincode', String(address.PINCODE));
      var CART_ID = this.cartDetails.cartDetails[0].CART_ID;
      var CART_ITEM_ID = this.cartDetails.cartDetails[0].ID;
      var COUNTRY_ID = address.COUNTRY_ID;
      var ADDRESS_ID = address.ID;
      this.cartDetails.cartDetails[0]['COUNTRY_ID'] = COUNTRY_ID;
      this.cartDetails.cartDetails[0]['ADDRESS_ID'] = ADDRESS_ID;
      this.cartDetails.cartDetails[0]['CART_ID'] = CART_ID;
      this.cartDetails.cartDetails[0]['CART_ITEM_ID'] = CART_ITEM_ID;
      this.cartDetails.cartDetails[0]['PINCODE'] = address.PINCODE;
      this.cartService.currentProduct = this.cartDetails.cartDetails[0];
      this.cartService.updateCartToServer();
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
      CITY_ID: '',
      PINCODE: '',
      COUNTRY_ID: '',
      STATE_ID: '',
      LANDMARK: '',
      LOCALITY: '',
      ADDRESS_TYPE: undefined,
      IS_DEFAULT: false,
      SESSION_KEY: '',
    };
    // this.stateList = []; // Clear states when resetting country
    // this.pincodeList = [];
  }

  sessionkey: string = sessionStorage.getItem('SESSION_KEYS') || '';
  SESSION_KEYS = this.commonFunction.decryptdata(this.sessionkey);

  onDefaultAddressChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.addressForm.IS_DEFAULT = target.checked;
    console.log('Checkbox changed to:', this.addressForm.IS_DEFAULT);
  }

   saveAddress(form: NgForm) {
    // if (form.invalid) {
    //   this.toastr.error('Please fill all required fields.', '');
    //   return;
    // }
    if (
      (this.addressForm.NAME == '' ||
        this.addressForm.NAME == null ||
        this.addressForm.NAME == undefined) &&
      (this.addressForm.MOBILE_NO == '' ||
        this.addressForm.MOBILE_NO == null ||
        this.addressForm.MOBILE_NO == undefined) &&
      (this.addressForm.ADDRESS == '' ||
        this.addressForm.ADDRESS == null ||
        this.addressForm.ADDRESS == undefined) &&
      (this.addressForm.LANDMARK == '' ||
        this.addressForm.LANDMARK == null ||
        this.addressForm.LANDMARK == undefined) &&
      (this.addressForm.COUNTRY_ID == '' ||
        this.addressForm.COUNTRY_ID == null ||
        this.addressForm.COUNTRY_ID == undefined) &&
      (this.addressForm.STATE_ID == '' ||
        this.addressForm.STATE_ID == null ||
        this.addressForm.STATE_ID == undefined) &&
      (this.addressForm.CITY_ID == '' ||
        this.addressForm.CITY_ID == null ||
        this.addressForm.CITY_ID == undefined) &&
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
      this.addressForm.ADDRESS == null ||
      this.addressForm.ADDRESS.trim() == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Enter Address', '');
      return;
    } else if (
      this.addressForm.COUNTRY_ID == undefined ||
      this.addressForm.COUNTRY_ID == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Select Country', '');
      return;
    } else if (
      this.addressForm.STATE_ID == undefined ||
      this.addressForm.STATE_ID == ''
    ) {
      // this.isOk = false;
      this.toastr.error('Please Select State', '');
      return;
    } else if (
      this.addressForm.CITY_ID == null ||
      this.addressForm.CITY_ID == undefined
    ) {
      // this.isOk = false;
      this.toastr.error('Please Select City', '');
      return;
    } else if (
      this.addressForm.PINCODE == undefined ||
      this.addressForm.PINCODE == '' ||
      this.addressForm.PINCODE.trim() === ''
    ) {
      // this.isOk = false;
      this.toastr.error(' Please Enter Zipcode ', '');
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
 
    if (this.userId) {
      this.addressForm.CUST_ID = this.userId;
    } else {
      this.addressForm.SESSION_KEY = this.SESSION_KEYS;
    }
 
    sessionStorage.setItem('pincode', String(this.addressForm.PINCODE));
    if (this.isEditingAddress && this.currentAddressId) {
      this.addressForm.IS_DEFAULT = Boolean(this.addressForm.IS_DEFAULT);
      this.addressForm.IS_DEFUALT_ADDRESS = Boolean(
        this.addressForm.IS_DEFAULT
      );
      this.api.updateAddressMaster(this.addressForm).subscribe({
        next: (response: any) => {
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
          }
        },
        error: () => {
          this.toastr.error(
            'Error updating address. Please try again.',
            'Error'
          );
        },
      });
    } else {
      this.addressForm.IS_DEFUALT_ADDRESS = Boolean(
        this.addressForm.IS_DEFAULT
      );
      this.api.createAddressMaster(this.addressForm).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            this.toastr.success('Address added successfully!', 'Success');
            this.addressForm.ID = response.data?.ID || String(Date.now());
            console.log(this.addressForm);
            this.fetchSavedAddresses();
            this.goBackToAddressList();
          } else {
            this.toastr.error(
              'Failed to add address: ' + response.message,
              'Error'
            );
          }
        },
        error: () => {
          this.toastr.error('Error adding address. Please try again.', 'Error');
        },
      });
    }
  }
 

 deleteAddress(addressID: any, customer_id: any) {
    console.log('Deleting Address ID:', addressID, 'Customer ID:', customer_id);
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
        console.log(err);
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
    this.addressForm.STATE_ID = ''; // Clear state selection on country change
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
  this.api.getState(0, 0, 'id', 'desc', `AND COUNTRY_ID=${countryId} AND STATUS=1`).subscribe(
    (res: any) => {
      this.isLoadingStates = false;
      if (res.code === 200) {
        this.stateList = res.data;
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
  fetchShipingcharges() {
    this.api.getAllCharges(0, 0, 'id', 'desc', '').subscribe(
      (response: any) => {
        if (response['code'] === 200) {
          this.Shiping_Charge = response['data'][0]['VALUE_1'];
          // console.log('dataaaly ', response['data']);
          // console.log('charges ', this.Shiping_Charge);
          // console.log(this.pincodeList,response,'Debug')
        } else {
          // console.error('Failed to fetch pincode:', response['message']);
          // this.pincodeList = [];
          console.log('failed shipping', response['data']);
        }
      },
      (error: any) => {
        // console.error('Error fetching pincode:', error);
        this.pincodeList = [];
        this.toastr.error('Failed to load shipping charges.', 'Error');
      }
    );
  }
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
  proceedToPayment() {
    this.showOrderSummaryModal = false;
    this.showPaymentModal = true;
    this.initiateSquarePayment(); // custom method to render Square card form
  }
  paymentSuccessModalVisible: boolean = false;

  // processPaymentWithToken() {
  // Your existing payment code here...

  // On success:

  // }
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
  async processPaymentWithToken() {
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
            amount: this.subtotal * 100,
            PAYMENT_MODE: 'O',
            ADDRESS_ID: this.selectedAddress!.ID,
            CART_ID: this.cartId,
            CUSTOMER_ID: this.userId ? this.userId : 0,
            SESSION_KEY: this.SESSION_KEYS,
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
              this.currentStep = 4;
              // this.closePaymentModal();
              // this.orderPlaced.emit(true);
              // this.visibleChange.emit(false);
              this.isProcessingPayment = false;

              this.showPaymentModal = false;
              this.paymentSuccessModalVisible = true;
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
  steped() {
    this.currentStep = 3;
  }
  desteper() {
    this.currentStep = 2;
  }

showOrderSummaryInDrawer: boolean = false;
 
openr(){
 
  this.currentStep=2;
  this.showOrderSummaryInDrawer=false;
 
  this.showAddressForm=true;
  this.openAddressDrawer();
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
    setTimeout(() => (this.filteredStates = []), 100);
  }
 
  selectCountry(country: any) {
    // Set the selected value
    this.addressForm.COUNTRY_ID = country.ID;
    this.countrySearch = country.NAME;
    this.filteredCountries = [];
    this.fetchStates(country.ID);
  }
 
  selectState(state: any) {
    this.addressForm.STATE_ID = state.ID;
    this.stateSearch = state.NAME;
    this.fetchCities(state.ID);
    this.filteredStates = [];
  }
 
  filterCountries() {
    const term = this.countrySearch.trim().toLowerCase();
    if (!term) {
      this.filteredCountries = [];
      return;
    }
 
    this.filteredCountries = this.countryList.filter((c) =>
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
    const term = this.countrySearch.trim().toLowerCase();
    return term && !this.countryList.some((c) => c.NAME.toLowerCase() === term);
  }
 
  get showAddStateOption(): any {
    const term = this.stateSearch.trim().toLowerCase();
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
  this.api.getAllCountryMaster(1, 1, '', '', 'AND STATUS=1').subscribe((res) => {
    if (res.code == 200) {
      payload.SEQUENCE_NO = res.data[0].SEQUENCE_NO + 1;
      this.api.createCountry(payload).subscribe(
        (response: any) => {
          this.isLoadingCountries = false;
          if (response.code === 200) {
            this.toastr.success('Country added successfully');
            const newCountry = { ID: response.ID, NAME: name };
           
             setTimeout(()=>{
             this.fetchCountries();
            // this.countryList.push(newCountry);
            this.selectCountry(newCountry); // ✅ auto-select// ✅ auto-select
 
            },200)
          } else {
            this.toastr.error(response.message || 'Failed to create country');
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
    setTimeout(() => (this.filteredCities = []), 100);
  }
 
  selectCity(city: any) {
    this.addressForm.CITY_ID = city.ID;
    this.citySearch = city.NAME;
    this.filteredCities = [];
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
  this.api.getCityData(0, 0, 'id', 'desc', 'AND IS_ACTIVE=1 AND STATE_ID=' + stateId).subscribe(
    (response: any) => {
      this.isLoadingCities = false;
      if (response.code === 200) {
        this.cityList = response.data;
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
  if (!this.addressForm.COUNTRY_ID) {
    this.toastr.warning('Please select a country first');
    return;
  }
 
  const payload = {
    ID: 0,
    NAME: name,
    STATUS: true,
    SEQUENCE_NO: 0,
    COUNTRY_ID: this.addressForm.COUNTRY_ID,
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
             setTimeout(()=>{
            this.fetchStates(this.addressForm.COUNTRY_ID)
            // this.stateList.push(newState);
 
            this.selectState(newState);  // ✅ auto-select
 
            },200)
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
    (c) => c.ID === this.addressForm.COUNTRY_ID
  );
 
  if (selectedCountry) {
    this.countrySearch = selectedCountry.NAME;
    this.fetchStates(selectedCountry.ID);
 
    // Wait for states to load, then prefill state
    // setTimeout(() => {
      const selectedState = this.stateList.find(
        (s) => s.ID === this.addressForm.STATE_ID
      );
 
      if (selectedState) {
        this.stateSearch = selectedState.NAME;
        this.fetchCities(selectedState.ID);
 
        // Wait for cities to load, then prefill city
        // setTimeout(() => {
          const selectedCity = this.cityList.find(
            (c) => c.ID === this.addressForm.CITY_ID
          );
          this.citySearch = selectedCity ? selectedCity.NAME : '';
        // }, 300);
      } else {
        this.stateSearch = '';
      }
    // }, 300);
  } else {
    this.countrySearch = '';
  }
}
 
  // Called on input change for country
  onCountryInputChange() {
    // If country input is empty, clear selection
    if (!this.countrySearch || this.countrySearch.trim() === '') {
      this.addressForm.COUNTRY_ID = null; // clear selected ID
      this.filteredCountries = [];
 
      // Clear state too
      this.addressForm.STATE_ID = null;
      this.stateSearch = '';
      this.filteredStates = [];
      this.stateList = []; // optional: reset state list
    }
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
    .substring(0, 3)     // take first 3 letters
    .toUpperCase();
}
 createCity(name: string) {
  if (!this.addressForm.COUNTRY_ID) {
    this.toastr.warning('Please select a country first');
    return;
  }
  if (!this.addressForm.STATE_ID) {
    this.toastr.warning('Please select a state first');
    return;
  }
 
  const payload = {
    ID: 0,
    NAME: name,
    IS_ACTIVE: true,
    SEQUENCE_NO: 0,
    COUNTRY_ID: this.addressForm.COUNTRY_ID,
    STATE_ID: this.addressForm.STATE_ID,
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
            setTimeout(()=>{
             this.fetchCities(this.addressForm.STATE_ID)
            this.selectCity(newCity); // ✅ auto-select
 
            },200)
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
 
  
}
