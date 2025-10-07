import { DatePipe } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  Renderer2,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CartService } from 'src/app/Service/cart.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { LoaderService } from 'src/app/Service/loader.service';
import { ModalService } from 'src/app/Service/modal.service';
export class AddressMaster {
  ADDRESS = '';
  COUNTRY_ID = '';
  STATE_ID = '';
  CITY = '';
  PINCODE = '';
  LANDMARK = '';
  ID = '';
  LOCALITY = '';
  STATE_NAME = '';
  CUST_ID = '';
  MOBILE_NO = '';
  NAME = '';

  IS_LAST_SHIPPING_ADDRESS = false;
  ADDRESS_TYPE = 'R';
  IS_DEFUALT_ADDRESS = false;
}
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
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

  currentSection: string = 'dashboard-section';
  showLogoutModal = false;
  sidebarOpen = false;
  isMobile = false;
  totalOrders: any;
  dataList1: {
    ID: number;
    CUST_ID: number;
    NAME: string;
    MOBILE_NO: string;
    ADDRESS: string;
    ADDRESS_TYPE: string;
    PINCODE: string;
    CITY: string;
    STATE_NAME: string;
    COUNTRY_NAME: string;
    LANDMARK: string;
    LOCALITY: string;
    IS_DEFUALT_ADDRESS: number;
    [key: string]: any; // to allow other dynamic properties
  }[] = [];

  pendingOrders: any;
  deliveredOrders: any;
  editModalOpen = false;
  editField: 'email' | 'password' | null = null;
  editValue: string = '';
  isUpdating = false;

  // User details modal state
  userDetailsModalOpen = false;
  userDetailsForm = {
    name: '',
    mobile: '',
  };
  isUpdatingUserDetails = false;

  // Address modal state and form
  addressModalOpen = false;
  isEditingAddress = false;
  addressForm = new AddressMaster();
  countryList: any[] = [];
  stateList: any[] = [];
  pincodeList: any[] = [];
  activeSection: string = 'dashboard-section';
  ngOnInit(): void {
    setTimeout(() => {
      this.route.queryParams.subscribe((params) => {
        const section = params['section'];
        if (section) {
          this.activeSection = section;
          this.currentSection = section;
          this.showSection(section);
        } else {
          this.showSection('dashboard-section');
        }
      });
      this.loadCountry();

      this.getpincodes();
      this.getUserData();
      this.checkScreenSize();
      // this.gettabledata();
    });
  }
  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
    this.videoElement = this.videoElement?.nativeElement;
    this.canvasElement = this.canvasElement?.nativeElement;
  }

  ngOnDestroy(): void {
    // Reset body overflow when component is destroyed
    document.body.style.overflow = 'auto';

    // Clean up camera stream when component is destroyed
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
    if (!this.isMobile && this.sidebarOpen) {
      this.sidebarOpen = false;
      document.body.style.overflow = 'auto';
    }
  }

  showSection(id: string): void {
    this.currentSection = id;
    if (this.currentSection === 'addresses-section') {
      this.loadCountry();
      this.gettabledata();
      this.getpincodes();
    }
    // Close sidebar on mobile when a menu is clicked
    if (this.isMobile) {
      this.sidebarOpen = false;
      document.body.style.overflow = 'auto';
    }
    if (this.currentSection === 'orders-section') {
      this.getOrders();
    }
    if (this.currentSection === 'wishlist-section') {
      this.getFavoriteProducts();
      //  this.getProducts();
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
    document.body.style.overflow = 'auto';
  }

  openModal(): void {
    // Close sidebar on mobile when opening logout modal
    if (this.isMobile) {
      this.sidebarOpen = false;
      document.body.style.overflow = 'auto';
    }
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }
  imagePreview: any = null;
  setDefaultImage(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/img/user.jpg';
  }
  constructor(
    private modalservice: ModalService,
    private api: ApiServiceService,
    private toastr: ToastrService,
    private cookie: CookieService,
    private router: Router,
    private loaderService: LoaderService,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2,
    private datePipe: DatePipe,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}
  public commonFunction = new CommonFunctionService();
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
        } else {
          this.toastr.error('Failed to logout!', '');
        }
      },
      error: (error) => {
        this.toastr.error('Failed to logout !', '');
      },
    });
  }

  isSectionActive(sectionId: string): boolean {
    if (sectionId === '') {
    }
    return this.currentSection === sectionId;
  }
  loadData() {
    this.loaderService.showLoader();
  }
  dataLoaded = false;
  stopLoader() {
    this.dataLoaded = true;
    this.loaderService.hideLoader();
  }
  dataList: any = [];
  userId = sessionStorage.getItem('userId');
  USER_ID: any;
  statastics: any;
  openEditModal(field: 'email' | 'password', currentValue: string) {
    this.editField = field;
    this.editValue = field === 'password' ? '' : currentValue;
    this.editModalOpen = true;
  }
  closeEditModal() {
    this.editModalOpen = false;
    this.editField = null;
    this.editValue = '';
  }

  // User details modal methods
  openUserDetailsModal() {
    this.userDetailsForm = {
      name: this.user.NAME || '',
      mobile: this.user.mobile || '',
    };
    this.userDetailsModalOpen = true;
  }

  closeUserDetailsModal() {
    this.userDetailsModalOpen = false;
    this.userDetailsForm = {
      name: '',
      mobile: '',
    };
  }

  updateUserDetails() {
    if (
      !this.userDetailsForm.name.trim() &&
      !this.userDetailsForm.mobile.trim()
    ) {
      this.toastr.error('Please fill in all fields.', 'Error');
      return;
    }

    if (
      this.userDetailsForm.name == '' ||
      this.userDetailsForm.name == undefined ||
      this.userDetailsForm.name == null
    ) {
      this.toastr.error('Please enter name.', 'Error');
      return;
    }
    if (
      this.userDetailsForm.mobile == '' ||
      this.userDetailsForm.mobile == undefined ||
      this.userDetailsForm.mobile == null
    ) {
      this.toastr.error('Please enter mobile no.', 'Error');
      return;
    }

    // Basic mobile number validation
    if (!/^\d{10}$/.test(this.userDetailsForm.mobile)) {
      this.toastr.error(
        'Please enter a valid 10-digit mobile number.',
        'Error'
      );
      return;
    }

    this.isUpdatingUserDetails = true;
    const payload: any = {
      ID: this.USER_ID,
      NAME: this.userDetailsForm.name.trim(),
      MOBILE_NO: this.userDetailsForm.mobile.trim(),
    };

    this.api.updateUserData(payload).subscribe({
      next: (res: HttpResponse<any>) => {
        this.isUpdatingUserDetails = false;

        const response = res.body;

        if (response?.code === 200) {
          this.toastr.success('User details updated successfully!', 'Success');
          this.user.NAME = this.userDetailsForm.name.trim();
          this.user.mobile = this.userDetailsForm.mobile.trim();
          this.closeUserDetailsModal();
        } else {
          this.toastr.error('Update failed.', 'Error');
        }
      },
      error: (err) => {
        this.isUpdatingUserDetails = false;
        this.toastr.error('Update failed. Please try again.', 'Error');
        console.error('Update error:', err);
      },
    });
  }

  updateField() {
    if (!this.editValue || !this.editField) {
      this.toastr.error('Please enter a data.', 'Error');
      return;
    }
    if (
      this.editField === 'email' &&
      !/^[^@]+@[^@]+\.[^@]+$/.test(this.editValue)
    ) {
      this.toastr.error('Please enter a valid email address.', 'Error');
      return;
    }
    this.isUpdating = true;
    const payload: any = {
      ID: this.USER_ID,
      NAME: this.user.NAME ? this.user.NAME : '',
    };
    if (this.editField === 'email') payload.EMAIL_ID = this.editValue;
    if (this.editField === 'password') payload.PASSWORD = this.editValue;
    this.api.updateUserData(payload).subscribe({
      next: (res: HttpResponse<any>) => {
        this.isUpdating = false;

        const response = res.body;

        if (response?.code === 200) {
          this.toastr.success('User Info Updated successfully!', 'Success');
          if (this.editField === 'email') this.user.email = this.editValue;
          if (this.editField === 'password')
            this.user.password = this.editValue;
          this.closeEditModal();
        } else {
          this.toastr.error('Update failed.', 'Error');
        }
      },
      error: (err) => {
        this.isUpdating = false;
        this.toastr.error('Update failed. Please try again.', 'Error');
        console.error('Update error:', err);
      },
    });
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
          this.statastics = data['data1'];
          this.totalOrders = this.statastics[0][0].TOTAL_ORDERS;
          this.pendingOrders = this.statastics[1][0].PENDING;
          this.deliveredOrders = this.statastics[1][0].DELIVERED;

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
            // console.log(userData.Name);
            this.imagePreview =
              this.IMAGEuRL + 'CustomerProfile/' + this.user.PROFILE_URL;
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
  pincodelist: any[] = [];
  getpincodes() {
    this.api.getPincodeMaster(0, 0, '', '', '  AND STATUS=1 ').subscribe(
      (data) => {
        if (data['code'] == 200) {
          // this.totalRecords = data['count'];
          this.pincodelist = data['data'];

          // }
        } else {
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
  loadCountry() {
    this.api.getAllCountryMaster(0, 0, '', '', ' AND STATUS=1').subscribe(
      (data: any) => {
        this.countryList = data['data'];
        // console.log(this.countryList);
      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  state: any[] = [];
  country: any[] = [];
  isloadstate: boolean = false;
  FilterCountry(event: any) {
    // this.loadSTATE_ID();
    this.isloadstate = true;

    this.api
      .getAllStateMaster(
        0,
        0,
        '',
        '',
        ' AND STATUS=1 AND COUNTRY_ID = ' + event
      )
      .subscribe(
        (data: any) => {
          if (data['code'] == 200) {
            this.stateList = data['data'];
            this.isloadstate = false;
          } else {
            this.toastr.error("Data Can't Load", '');
          }
        },
        (err: any) => {
          console.log(err);
          this.isloadstate = false;
        }
      );
  }

  // Open modal for add/edit
  openAddressModal(address?: any) {
    this.isEditingAddress = !!address;
    this.addressForm = Object.assign({}, address);
    if (this.addressForm.ID) {
      this.onCountryChange(this.addressForm.COUNTRY_ID);
    }

    // console.log(this.addressForm);
    // if (address) {
    //   this.addressForm = { ...address };

    // } else {
    //   this.addressForm = {
    //     ADDRESS: '',
    //     COUNTRY_ID: '',
    //     STATE_ID: '',
    //     ID: '',
    //     CITY: '',
    //     PINCODE: '',
    //     LANDMARK: '',
    //     MOBILE_NO: '',
    //     NAME: '',

    //     CUST_ID: '',
    //     IS_LAST_SHIPPING_ADDRESS: false,
    //     IS_DEFUALT_ADDRESS: false,
    //     AREA: '',
    //     ADDRESS_TYPE: 'R',
    //     IS_DEFUALT_ADDRESS: false,
    //   };
    // }
    this.addressModalOpen = true;
    // this.loadCountry(); // Load country list
  }

  // Close modal
  closeAddressModal() {
    this.addressModalOpen = false;
  }

  // On country change
  onCountryChange(country: string) {
    this.addressForm.COUNTRY_ID = country;

    this.FilterCountry(country); // Load states for selected country
  }

  // On state change (optional, for future use)
  onStateChange(state: string) {
    this.addressForm.STATE_ID = state;
  }
  isOk = false;
  pincode = /^\d{5}$/;
  exist: any;
  isSpinning: boolean = false;
  saveAddress(addNew: boolean, websitebannerPage: NgForm): void {
    // this.isSpinning = false;
    this.isOk = true;
    this.addressForm.CUST_ID = this.USER_ID;
    this.addressForm.IS_LAST_SHIPPING_ADDRESS =
      this.addressForm.IS_DEFUALT_ADDRESS;

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
      (this.addressForm.STATE_ID == '' ||
        this.addressForm.STATE_ID == null ||
        this.addressForm.STATE_ID == undefined) &&
      (this.addressForm.CITY == '' ||
        this.addressForm.CITY == null ||
        this.addressForm.CITY == undefined) &&
      (this.addressForm.PINCODE == '' ||
        this.addressForm.PINCODE == null ||
        this.addressForm.PINCODE == undefined)
    ) {
      this.isOk = false;
      this.toastr.error(' Please Fill All Required Fields ', '');
    }
    // else if (this.addressForm.NAME == null || this.addressForm.NAME.trim() == '') {
    //   this.isOk = false;
    //   this.toastr.error('Please Enter Customer Name', '');
    // } else if (this.addressForm.MOBILE_NO == undefined || this.addressForm.MOBILE_NO <= 0) {
    //   this.isOk = false;
    //   this.toastr.error(' Please Enter Mobile Number ', '');
    // }
    //  else if (!this.mobpattern.test(this.addressForm.MOBILE_NO)) {
    //   this.isOk = false;

    //   this.toastr.error('Please Enter Valid Mobile Number', '');
    // }
    else if (
      this.addressForm.NAME == null ||
      this.addressForm.NAME.trim() == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter Name', '');
    } else if (
      this.addressForm.MOBILE_NO == null ||
      this.addressForm.MOBILE_NO.trim() == '' ||
      this.addressForm.MOBILE_NO == undefined
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter Mobile Number', '');
    } else if (
      !this.commonFunction.internationalmobpattern.test(
        this.addressForm.MOBILE_NO
      )
    ) {
      this.isOk = false;
      this.toastr.error('Please enter a valid mobile number', '');
    } else if (
      this.addressForm.ADDRESS == null ||
      this.addressForm.ADDRESS.trim() == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter Address', '');
    } else if (
      this.addressForm.COUNTRY_ID == undefined ||
      this.addressForm.COUNTRY_ID == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Select Country', '');
    } else if (
      this.addressForm.STATE_ID == undefined ||
      this.addressForm.STATE_ID == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Select State', '');
    }
    // else if (this.addressForm.LANDMARK == null || this.addressForm.LANDMARK.trim() == '') {
    //   this.isOk = false;
    //   this.toastr.error('Please Enter Landmark', '');
    // } else if (this.addressForm.LOCALITY == null || this.addressForm.LOCALITY.trim() == '') {
    //   this.isOk = false;
    //   this.toastr.error('Please Enter Area', '');
    // }
    else if (
      this.addressForm.CITY == null ||
      this.addressForm.CITY.trim() == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter City', '');
    } else if (
      this.addressForm.PINCODE == undefined ||
      this.addressForm.PINCODE == ''
    ) {
      this.isOk = false;
      this.toastr.error(' Please Enter Zipcode ', '');
    }
    //  else if (!this.pincode.test(this.addressForm.PINCODE)) {
    //   this.isOk = false;
    //   this.toastr.error('Pincode Must Be 6 Digit ', '');
    // }
    else if (
      this.addressForm.PINCODE != undefined ||
      this.addressForm.PINCODE >= 0
    ) {
      // if (this.pincodelist.length > 0) {
      //   console.log(this.pincodelist);
      //   // console.log(this.pincodelist.includes(this.addressForm.PINCODE));
      //   this.exist = this.pincodelist.some(
      //     (value) => value.PINCODE === this.addressForm.PINCODE
      //   );
      //   console.log('this.exist', this.exist);
      //   // if (this.exist) {
      //   //   //////////
      //   //   this.isOk = true;
      //   //   this.toastr.error('Please Select Address Type', '');
      //   // } else {
      //   //   this.isOk = false;
      //   //   this.toastr.error('Invalid Pincode', '');
      //   // }
      // }
      if (this.exist == false) {
        this.isOk = false;
        this.toastr.error('Invalid Pincode', '');
      } else {
        if (!this.addressForm.ID) {
          if (this.dataList1.length > 0) {
            if (this.addressForm.IS_DEFUALT_ADDRESS == true) {
              for (let i = 0; i < this.dataList1.length; i++) {
                if (this.dataList1[i]['IS_DEFUALT_ADDRESS'] == 1) {
                  this.isOk = false;
                }
              }
              if (this.isOk == false) {
                this.toastr.error('Mark Default Address Already Enabled', '');
              }
            } else {
              this.isOk = true;
            }
          }
        }
      }
    }

    // else if (
    //   this.addressForm.ADDRESS_TYPE == undefined ||
    //   this.addressForm.ADDRESS_TYPE <= 0
    // ) {
    //   this.isOk = false;
    //   this.toastr.error('Please Select Address Type', '');
    // }
    else if (!this.addressForm.ID) {
      if (this.dataList1.length > 0) {
        if (this.addressForm.IS_DEFUALT_ADDRESS == true) {
          for (let i = 0; i < this.dataList1.length; i++) {
            if (this.dataList1[i]['IS_DEFUALT_ADDRESS'] == 1) {
              this.isOk = false;
            }
          }
          if (this.isOk == false) {
            this.toastr.error('Mark Default Address Already Enabled', '');
          }
        } else {
          this.isOk = true;
        }
      }
    }
    // this.addressForm.NAME = this.user.NAME;
    // this.addressForm.MOBILE_NO = this.user.mobile;
    if (this.isOk) {
      this.isSpinning = true;

      // this.isSpinning = true;
      if (this.addressForm.ID) {
        this.api
          .updateAddressMaster(this.addressForm)
          .subscribe((successCode) => {
            if (successCode.code == '200') {
              this.toastr.success(' Address Updated Successfully...', '');
              if (!addNew) this.closeAddressModal();
              this.gettabledata();
              this.isSpinning = false;
            } else {
              this.toastr.error(' Address Updation Failed...', '');
              this.isSpinning = false;
            }
          });
      } else {
        this.api
          .createAddressMaster(this.addressForm)
          // this.type=.TYPE_ID
          .subscribe((successCode) => {
            if (successCode.code == '200') {
              this.toastr.success(' Address Create Successfully...', '');
              if (!addNew) {
                this.closeAddressModal();
                this.gettabledata();
              } else {
                this.addressForm = new AddressMaster();
                this.resetDrawer(websitebannerPage);
                this.gettabledata();
                // this.api.getAddressMaster(1,1,'','desc','').subscribe (data =>{
                //   if (data['count']==0){
                //     this.data.SEQUENCE_NO=1;
                //   }else
                //   {
                //     this.data.SEQUENCE_NO=data['data'][0]['SEQUENCE_NO']+1;
                //   }
                // },err=>{
                //   console.log(err);
                // })
              }
              this.isSpinning = false;
            } else {
              this.toastr.error('Address Creation Failed...', '');
              this.isSpinning = false;
            }
          });
      }
    }
  }
  resetDrawer(websitebannerPage: NgForm) {
    this.addressForm = new AddressMaster();
    websitebannerPage.form.markAsPristine();
    websitebannerPage.form.markAsUntouched();
  }
  gettabledata() {
    this.api
      .getAddressMaster(0, 0, '', '', ' AND CUST_ID = ' + this.USER_ID)
      .subscribe(
        (data: any) => {
          if (data['code'] == 200) {
            // this.totalRecords = data['count'];
            this.dataList1 = data['data'];
            // console.log(this.dataList1);
            // console.log(data['data']);
            // this.loadingRecords = false;
            // if(this.totalRecords==0){
            //   data.SEQUENCE_NO=1;
            // }
          } else {
            // this.message.error("Something Went Wrong","");
            // this.loadingRecords = false;
          }
        },
        (err: any) => {
          console.log(err);
        }
      );
  }

  deleteAddress(addressId: number) {
    // call delete API or handle logic
  }

  orders: any;

  getOrders() {
    const customerId = this.commonFunction.decryptdata(
      sessionStorage.getItem('userId') || ''
    );

    this.isloadstate = true;

    this.api
      .Ordermaster(0, 0, 'id', '', ' AND CUSTOMER_ID = ' + customerId)
      .subscribe(
        (data: any) => {
          if (data['code'] == 200) {
            this.orders = data['data'];
            console.log(data['data']);
            this.isloadstate = false;
          } else {
            this.toastr.error("Data Can't Load", '');
          }
        },
        (err: any) => {
          console.log(err);
          this.isloadstate = false;
        }
      );
  }

  cartitemDataList: any[] = [];
  viewdetail: any[] = [];
  orderNo: any;
  PACKAGING_CHARGES: any;
  DELIVERY_CHARGES: any;
  totalPrice: any;
  photoUrls: any;
  producctImageurl: string = this.api.retriveimgUrl + 'productImages/';
  TOTAL_AMOUNT: any;
  openProjectDetails(data: any) {
    this.viewdetail = [data];
    // console.log(data);
    // console.log(this.viewdetail);
    this.orderNo = data.ORDER_NUMBER;
    this.DELIVERY_CHARGES = data.DELIVERY_CHARGES;
    console.log(this.DELIVERY_CHARGES);
    this.PACKAGING_CHARGES = data.PACKAGING_CHARGES;
    console.log(this.PACKAGING_CHARGES);
    this.TOTAL_AMOUNT = data.TOTAL_AMOUNT;

    try {
      const items = JSON.parse(data.CART_ITEMS);
      this.cartitemDataList = Array.isArray(items) ? items : [];
    } catch {
      this.cartitemDataList = [];
    }
    this.totalPrice = this.cartitemDataList.reduce(
      (sum, item) => sum + (item.PRICE || 0),
      0
    );
    this.photoUrls = this.cartitemDataList.map(
      (item) => item.PHOTO_URL?.[0] || ''
    );

    const stageMap: { [key: string]: number } = {
      A: 1,
      SP: 2,
      PD: 2,
      D: 3,
      DD: 3,
      OD: 4,
      OC: 5,
    };

    this.step = stageMap[data.CURRENT_STAGE] || 1;
  }
  handleProjectCancel() {}

  getImageArray(product: any): string[] {
    try {
      const images = JSON.parse(product.Images);
      return images.map((img: any) => img.PHOTO_URL);
    } catch (e) {
      console.error('Invalid image format', e);
      return [];
    }
  }

  step = 1;

  goToStep(stepNumber: number) {
    this.step = stepNumber;
  }

  openprofileModal() {
    this.showModal = true;
    this.renderer.addClass(document.body, 'modal-open');
    this.cdRef.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.renderer.removeClass(document.body, 'modal-open');
    this.cdRef.detectChanges();
  }

  capturedImage: string | null = null;
  private stream!: MediaStream;
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef;

  openCamera() {
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
      setTimeout(() => {
        this.initializeCameraWithRetry(attempts + 1);
      }, 200);
      return;
    }

    // Try ViewChild first, then fall back to direct DOM query
    let video = this.videoElement?.nativeElement;

    if (!video) {
      // Fallback: try to find video element directly in the modal
      video = modal.querySelector('video');
    }

    if (!video) {
      setTimeout(() => {
        this.initializeCameraWithRetry(attempts + 1);
      }, 200);
      return;
    }

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
        this.stream = stream;
        video.srcObject = stream;

        // Wait for video to be ready
        video.onloadedmetadata = () => {
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

    // Note: Modal will be closed after successful upload in uploadImage method
    // Don't close here to avoid conflicts
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
  IMAGEuRL: any;
  isUploading: boolean = false;
  progressPercent: number = 0;
  showModal: boolean = false;
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

            // Close the capture photo modal first
            console.log('Closing capture photo modal after successful upload');
            this.closeCapturePhotoModal();
            this.clearCanvasAndVideo();

            // Update user profile
            this.updateUserProfile();

            // Close the photo selection modal with a small delay to ensure capture modal closes first
            setTimeout(() => {
              console.log('Closing photo selection modal');
              this.closeModal();
            }, 100);
          } else {
            this.toastr.error('Image upload failed.', '');
            this.clearCanvasAndVideo();
            this.imagePreview = null;
            this.user.PROFILE_URL = '';
            this.showModal = false;
            // Close the capture photo modal on error too
            this.closeCapturePhotoModal();
          }
        }
      },
      error: () => {
        this.isUploading = false;
        this.toastr.error('Failed to upload image.', '');
        this.imagePreview = null;
        this.user.PROFILE_URL = '';
        this.showModal = false;
        this.clearCanvasAndVideo();
        // Close the capture photo modal on error
        this.closeCapturePhotoModal();
      },
    });
  }
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

  closeCapturePhotoModal() {
    console.log('closeCapturePhotoModal called');
    const modal = document.getElementById('CapturePhotoModal');
    if (!modal) {
      console.error('Capture photo modal not found for closing');
      return;
    }

    console.log('Modal found, closing...');

    // Stop the camera stream if it's active
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    // Remove modal-open class from body first
    this.renderer.removeClass(document.body, 'modal-open');

    // Hide the modal with proper Bootstrap sequence
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.classList.remove('fade');

    // Reset captured image
    this.capturedImage = null;
    this.clearCanvasAndVideo();

    // Force a change detection cycle
    this.cdRef.detectChanges();

    console.log('Modal closed successfully');
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
          this.clearCanvasAndVideo();
          this.getUserData();
        }
        // else if (
        //   successCode.body.code === 300 &&
        //   successCode.body.message === 'mobile number already exists.'
        // ) {
        //   this.stopLoader();
        //   this.statusCode = 'mobile number already exists.';
        // } else if (
        //   successCode.body.code === 300 &&
        //   successCode.body.message === 'email ID already exists.'
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
    // this.message.success('File size should not exceed 5MB.','');

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

  totalFavourites: any;
  FavouritesData: any;
  euserID: string = sessionStorage.getItem('userId') || '';
  decyptedsessionKey: any;
  userID: any;
  favoriteProductIds: any[] = [];
  isLiked: boolean = false;

  toggleLike(product: any) {
    this.userID = this.commonFunction.decryptdata(this.euserID);
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    this.decyptedsessionKey = this.commonFunction.decryptdata(sessionKey);

    if (this.userID) {
      this.decyptedsessionKey = '';
    }

    const Data = {
      PRODUCT_ID: product.ID,
      CUSTOMER_ID: this.userID || 0,
      SESSION_KEY: this.decyptedsessionKey,
    };

    if (product.isLiked) {
      this.api.removeFavoriteProduct(Data).subscribe(
        (res) => {
          if (res['code'] === 200) {
            this.toastr.success('Removed from Favourites');
            product.isLiked = false;
            this.getFavoriteProducts();
          } else {
            this.toastr.error('Failed to remove from favourites.');
          }
        },
        (err) => {
          this.toastr.error('Something went wrong. Try again later.');
        }
      );
    } else {
      const addData = { ...Data, CLIENT_ID: 1 };

      this.api.addFavoriteProduct(addData).subscribe(
        (res) => {
          if (res['code'] === 200) {
            this.toastr.success('Added to Favourites');
            product.isLiked = true;
            this.getFavoriteProducts();
          } else {
            this.toastr.error('Failed to add to favourites.');
          }
        },
        (err) => {
          this.toastr.error('Something went wrong. Try again later.');
        }
      );
    }
  }

  getFavoriteProducts() {
    this.userID = this.commonFunction.decryptdata(this.euserID);
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    this.decyptedsessionKey = this.commonFunction.decryptdata(sessionKey);

    if (this.userID) {
      var filter = ` AND CUSTOMER_ID = ${this.userID}`;
    } else {
      var filter = ` AND SESSION_KEY = '${this.decyptedsessionKey}'`;
    }

    this.api.getFavoriteProducts(filter).subscribe(
      (data) => {
        if (data['code'] === 200) {
          this.totalFavourites = data['count'];
          this.FavouritesData = data['data'];
          this.favoriteProductIds = this.FavouritesData.map(
            (item: any) => item.PRODUCT_ID
          );
          localStorage.setItem('totalFavourites', this.totalFavourites);
          window.dispatchEvent(new Event('favouritesUpdated'));

          if (this.favoriteProductIds.length > 0) {
            this.getProducts();
          }
          this.products = this.products?.map((product: any) => ({
            ...product,
            isLiked: this.favoriteProductIds.includes(product.ID),
          }));
          this.products?.forEach((product: any) => {});
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  products: any;
  loadingProducts = false;
  show = false;
  varient: any;
  selectedVariantId: any;
  selectedPrice: any;
  totalProducts: any;
  showTotalProducts: any;

  getvarientDetails(propertyId: any) {
    this.show = true;
    this.api
      .getAllVarient(
        1,
        10,
        'id',
        'desc',
        'AND STATUS = 1 AND PRODUCT_ID =' + propertyId
      )
      .subscribe((data) => {
        if (data) {
          this.varient = data.data;

          if (this.varient.length > 0) {
            const firstVariant = this.varient[0];
            this.selectedVariantId = firstVariant.ID;
            this.selectedPrice = firstVariant.RATE || 0;
          }

          this.show = false;
        }
      });
  }

  variantRateMap: { [productId: number]: number } = {};

  getProducts() {
    this.loadingProducts = true;
    if (this.favoriteProductIds.length > 0) {
      var filter = ` AND ID IN (${this.favoriteProductIds})  AND IS_VERIENT_AVAILABLE = 1`;
    } else {
      var filter = '';
    }

    this.api
      .getAllProductMaster(
        this.currentPage,
        this.productsPerPage,
        this.sortKey || 'id',
        this.sortDirection || 'desc',
        filter,
        ''
      )
      .subscribe(
        (res: any) => {
          if (res && res.data && Array.isArray(res.data)) {
            this.products = res.data;
            this.loadingProducts = false;
            this.totalProducts = res.count;
            this.showTotalProducts = res.count;
            this.products.forEach((product: any) => {
              this.loadProductVariantsFromData(product);
              let variants = product.VARIENTS;
              this.products = this.products.map((product: any) => ({
                ...product,
                isLiked: this.favoriteProductIds.includes(product.ID),
              }));
              if (typeof variants === 'string') {
                try {
                  variants = JSON.parse(variants);
                } catch (e) {
                  variants = [];
                }
              }

              if (Array.isArray(variants) && variants.length > 0) {
                this.variantRateMap[product.ID] = variants[0].RATE;
              } else {
                this.variantRateMap[product.ID] = 0;
              }
            });
          } else {
            this.products = [];
            this.loadingProducts = false;
            this.totalProducts = 0;
            this.showTotalProducts = 0;
          }
        },
        (err: any) => {
          console.error('Error fetching products:', err);
          this.loadingProducts = false;
          this.products = [];
          this.totalProducts = 0;
          this.showTotalProducts = 0;
        }
      );
  }

  trackByProductId(index: number, product: any): number {
    return product.ID;
  }

  imageIndices: { [productId: string]: number } = {};

  initImageIndex(productId: string) {
    if (!(productId in this.imageIndices)) {
      this.imageIndices[productId] = 0;
    }
  }
  prevImage(productId: string) {
    if (this.imageIndices[productId] > 0) {
      this.imageIndices[productId]--;
    }
  }

  nextImage(productId: string, total: number) {
    if (this.imageIndices[productId] < total - 1) {
      this.imageIndices[productId]++;
    }
  }

  goToImage(productId: string, index: number) {
    this.imageIndices[productId] = index;
  }

  getStarIcons(rating: number): string {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars += '<i class="ri-star-fill"></i>';
      } else if (rating >= i - 0.5) {
        stars += '<i class="ri-star-half-fill"></i>';
      } else {
        stars += '<i class="ri-star-line"></i>';
      }
    }
    return stars;
  }
  viewCart = false;
  productsArray: any = [];
  addToCart(product: any): void {
    const existingProductIndex = this.productsArray.findIndex(
      (p: any) => p.ID === product.ID
    );
    const selectedVariantId = this.selectedVariantMap[product.ID];
    const variants = this.variantMap[product.ID] || [];
    const selectedVariant = variants.find(
      (v) => v.VARIENT_ID === selectedVariantId
    );

    if (selectedVariant) {
      product.UNIT_ID = selectedVariant.UNIT_ID;
      product.VERIENT_ID = selectedVariantId;
      product.SIZE = selectedVariant.SIZE;
    }

    if (existingProductIndex !== -1) {
      this.cartService.addToCart(product);
    } else {
      const productWithQuantity = { ...product, quantity: 1 };
      this.productsArray = [...this.productsArray, productWithQuantity];
      this.cartService.addToCart(product);
    }

    this.viewCart = true;
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
  }
  onCartDrawerClose(isVisible: boolean) {
    this.viewCart = isVisible;
  }

  currentPage = 1;
  productsPerPage = 6;
  sortKey: string | null = 'ID';
  sortDirection: string | null = 'desc';

  setCurrentPage(page: number): void {
    this.currentPage = page;
    this.getProducts();
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    if (value === 'default') {
      this.sortKey = 'ID';
      this.sortDirection = 'desc';
      this.getProducts();
    } else {
      const [key, direction] = value.split(':');
      this.sortKey = key;
      this.sortDirection = direction;
      this.getProducts();
    }
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // get pagesArray(): number[] {
  //   return Array(this.totalPages)
  //     .fill(0)
  //     .map((x, i) => i + 1);
  // }
  // get totalPages(): number {
  //   return Math.ceil(this.totalProducts / this.productsPerPage);
  // }

  get totalPages(): number {
    if (!this.productsPerPage || this.productsPerPage <= 0) return 0;
    if (!this.totalProducts || this.totalProducts <= 0) return 0;
    return Math.ceil(this.totalProducts / this.productsPerPage);
  }

  get pagesArray(): number[] {
    const total = this.totalPages;
    return total > 0
      ? Array(total)
          .fill(0)
          .map((_, i) => i + 1)
      : [];
  }

  price: number = 0;
  selectedVariantStock: any;
  quantity = 1;
  variantMap: { [key: number]: any[] } = {};
  selectedVariantMap: { [key: number]: number } = {};
  variantStockMap: { [key: number]: number } = {};
  unitIdMap: { [key: number]: number } = {};

  unitId: any;
  updateTotalPrice(): void {
    this.totalPrice = this.selectedPrice * this.quantity;
  }
  loadProductVariantsFromData(product: any) {
    let variants = product.VARIENTS;

    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch {
        variants = [];
      }
    }

    if (Array.isArray(variants) && variants.length > 0) {
      let Variants =
        variants?.filter((v: any) => v.STATUS === true || v.STATUS === 1) || [];
      this.variantMap[product.ID] = Variants;
      if (!this.selectedVariantMap[product.ID]) {
        const firstVariant = variants[0];
        this.selectedVariantMap[product.ID] = firstVariant.VARIENT_ID;
        this.variantRateMap[product.ID] = firstVariant.RATE || 0;
        this.variantStockMap[product.ID] = firstVariant.OPENING_STOCK || 0;
        this.unitIdMap[product.ID] = firstVariant.UNIT_ID;
      } else {
        const selectedVariant = Variants.find(
          (v) => v.VARIENT_ID === this.selectedVariantMap[product.ID]
        );
        if (selectedVariant) {
          this.unitIdMap[product.ID] = selectedVariant.UNIT_ID;
        }
      }
    }
  }

  change(selectedId: string, productId: number): void {
    const variants = this.variantMap[productId] || [];
    const selected = variants.find(
      (v: any) => v.VARIENT_ID === Number(selectedId)
    );

    if (selected) {
      this.selectedVariantMap[productId] = selected.VARIENT_ID;
      this.variantRateMap[productId] = selected.RATE || 0;
      this.variantStockMap[productId] = selected.OPENING_STOCK || 0;
      this.unitIdMap[productId] = selected.UNIT_ID;

      this.updateTotalPrice();
    }
  }
}
