import {
  Component,
  ElementRef,
  inject,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
// import { parsePhoneNumberFromString } from 'libphonenumber-js';

// import { Gallery } from "ng-gallery";
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { Lightbox } from "ng-gallery/lightbox";
import { CookieService } from 'ngx-cookie-service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  Validators,
} from '@angular/forms';
import { interval, takeWhile } from 'rxjs';
import { HostListener } from '@angular/core';
import { ViewChildren, QueryList } from '@angular/core';
import { ModalService } from 'src/app/Service/modal.service';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { LoaderService } from 'src/app/Service/loader.service';
import { Location } from '@angular/common';
export class registerdata {
  CUSTOMER_NAME: string = '';
  TYPE: any;
  CUSTOMER_MOBILE_NO: any = '';
  MOBILE_NO: any = '';
  PASSWORD: any = '';
  EMAIL_ID: any = '';
  STATUS: any;
  TYPE_VALUE: any;
  OTP: any;
  IS_NEW_CUSTOMER: any = 1;
  USER_ID: any;
  CUSTOMER_EMAIL_ID: any;
  CUSTOMER_CATEGORY_ID: any;
  IS_SPECIAL_CATALOGUE: any;
  ACCOUNT_STATUS: any;
  CUSTOMER_TYPE: any;
  CLOUD_ID: any;
  W_CLOUD_ID: any;
  // USER_NAME:any ='';
  COUNTRY_CODE: any;
}

interface AddressForm {
  CUSTOMER_ID: number;
  CUSTOMER_TYPE: number;
  CONTACT_PERSON_NAME: string;
  MOBILE_NO: string;
  EMAIL_ID: string;
  ADDRESS_LINE_1: string;
  ADDRESS_LINE_2: string;
  COUNTRY_ID: number;
  STATE_ID: number;
  CITY_ID: number;
  CITY_NAME: string;
  PINCODE_ID: number;
  PINCODE: string;
  TERRITORY_ID: any;
  DISTRICT_ID: number;
  GEO_LOCATION: string;
  DISTRICT_NAME: string;
  TYPE: string;
  IS_DEFAULT: boolean;
  CLIENT_ID: number;
  LANDMARK: '';
}

interface LocationOption {
  id: number;
  name: string;
}

interface User {
  ID: number;
  EMAIL_ID?: string;
}
declare var google: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    private cookie: CookieService,
    private modalService1: ModalService,
    private api: ApiServiceService,
    private toastr: ToastrService,
    private location: Location,
    // public gallery: Gallery,
    // public lightbox: Lightbox,
    private router: Router,
    private fb: FormBuilder,
    private loaderService: LoaderService,
    private eRef: ElementRef
  ) {}
  isGuest: any = false;
  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '../../../../../assets/images/profile.png';
  }
  emailPattern: RegExp =
    /^(?!.*\.\..*)(?!.*--.*)(?!.*-\.|-\@|\.-|\@-)[a-zA-Z0-9]([a-zA-Z0-9._%+-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
  isUserLoggedIn: boolean = false;
  showLoginModal: boolean = false;
  private modalService: any = inject(NgbModal);
  mobileNumberorEmail: string = '';
  // PASSWORD: string = '';
  mobileNumberlogin: any;
  PASSWORDLOGIN: any;

  @ViewChild('content') content!: TemplateRef<any>;
  openVerticallyCentered(content: TemplateRef<any>) {
    this.mobileNumberorEmail = '';
    // this.modalService.open(content, { centered: true });
    this.modalService.open(content, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
  }
  public commonFunction = new CommonFunctionService();

  // Chat, Call and login model logic
  showCallAndChatButtons(data: any): void {
    if (data.WHO_WILL_SHOW) {
      // If user is logged in, show chat and call buttons
      this.isUserLoggedIn = true;
    } else {
      // If user is not logged in, show the login modal
      this.showLoginModal = true;
      this.openVerticallyCentered(this.content);
    }
  }

  @ViewChild('loginwithpass') loginwithpass!: TemplateRef<any>;
  showloginwithpass(currentModal: any) {
    this.modalService1.closeModal();
    this.PASSWORDLOGIN = '';
    // this.modalService.open(this.loginwithpass, { centered: true })
    this.modalService.open(this.loginwithpass, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
  }
  isLoading: boolean = false;
  issignUpLoading: boolean = false;

  otpSent: boolean = false;
  remainingTime: number = 60;
  timerSubscription: any;
  // Resend OTP action after 30 seconds
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
    // Unsubscribe from the timer when the component is destroyed
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  @ViewChild('forgotpass') forgotpass!: TemplateRef<any>;
  showforgotPass(currentModal: any) {
    this.modalService.dismissAll(currentModal);
    // this.modalService.open(this.forgotpass, { centered: true })
    this.modalService.open(this.forgotpass, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
  }
  openRegister: boolean = false;
  @ViewChild('register') register!: TemplateRef<any>;
  showRegisterModal() {
    this.registrationSubmitted = false;
    this.isloginSendOTP = false;
    this.issignUpLoading = false;
    this.selectedCountryCode = '+1';
    this.statusCode = '';
    this.modalVisible = false;
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    this.cookie.delete('token');
    this.openRegister = true;
    this.confirmPass = '';
    this.pass = '';
  }

  showConfirmPasswordError: boolean = false;

  modalVisible: boolean = false;
  form!: FormGroup;
  showPasswordError: boolean = false; // ✅ Declare variable
  // @ViewChild("showlogin") showlogin!: TemplateRef<any>;
  @ViewChild('showlogin', { static: true }) showlogin!: TemplateRef<any>;
  private messaging: any;
  ngOnInit(): void {
    // console.log('kkkkkkkkkkkkkkkkkkk');

    // this.openVerify = true;
    this.modalService1.modalState$.subscribe((state: any) => {
      this.modalVisible = true;

      // for loading map

      console.log('this.modalVisible', this.modalVisible);

      this.data = new registerdata();
      // this.modalService.open(state, { centered: true });
    });
    this.form = this.fb.group({
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
    });
    this.form.controls['password'].valueChanges.subscribe(() => {
      if (this.form.controls['password'].dirty) {
        this.showPasswordError =
          this.form.controls['password'].invalid &&
          !!this.form.controls['password'].value;
      }
    });
    let is_register = sessionStorage.getItem('IS_REGISTER');
    if (is_register) {
      this.showRegisterModal();
      sessionStorage.removeItem('IS_REGISTER');
    }
  }

  closeModal() {
    this.modalService1.closeModal();
    this.modalService.dismissAll();
    this.mobileNumberorEmail = '';
  }

  closeregister() {
    this.modalService.dismissAll();
    this.mobileNumberorEmail = '';
    this.mobileNumberlogin = '';
    this.otp = ['', '', '', '', '', ''];
    this.data = new registerdata();
    this.showAddressDetailsForm = false;
  }
  testmobilenumber(number: any) {
    return /^[6-9]\d{9}$/.test(number);
  }

  @ViewChild('loginotpverficationModal')
  loginotpverficationModal!: TemplateRef<any>;
  isloginSendOTP: boolean = false;
  showOtpModal: boolean = false;
  type: any;
  USER_ID: any;
  USER_NAME: any;
  loginSubmitted: boolean = false;
  openVerify: boolean = false;
  isLoggedIn: boolean = false;

  loginotpverification(form?: NgForm): void {
    this.loginSubmitted = true;
    if (form && form.invalid) {
      Object.values(form.controls).forEach((control) => {
        control.markAsTouched();
        control.updateValueAndValidity();
      });
      this.loginSubmitted = false;
      return;
    }

    console.log('login', form?.value);
    // Determine type based on input value
    this.type = this.isEmail(this.mobileNumberorEmail) ? 'E' : 'M';
    this.isloginSendOTP = true;
    this.statusCode = '';
    this.whichOTP = 'login';
    // this.loadData();

    this.api
      .login(
        (this.USER_NAME = this.mobileNumberorEmail),
        (this.type = this.type),
        this.data.PASSWORD
      )
      .subscribe({
        next: (successCode: any) => {
          console.log('in login', successCode.code, successCode);

          if (successCode.code == '200') {
            // console.log(this.data, 'iotrriuuiyoio');
            this.isloginSendOTP = false;
            this.modalService1.closeModal();
            // this.otpSent = true;
            // this.showOtpModal = true;
            // this.USER_ID = successCode.USER_ID;
            this.USER_NAME = successCode.USER_NAME;

            // this.remainingTime = 60;
            // this.startTimer();
            // this.toastr.success('OTP Sent Successfully...', '');
            this.modalVisible = false;
            this.openRegister = false;
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
            sessionStorage.setItem('IS_GUEST', 'false');
            this.toastr.success('You have login Successfully!', 'success');
            // document.body.style.overflow='';
            document.body.style.overflow = '';
            document.body.style.overflowX = 'hidden';
            // form?.resetForm();
            this.router.navigate(['/home']);
            // this.openVerify = true;
            // this.stopLoader();

            // console.log(this.isLoggedIn, 'this.isLoggedIn');
          } else if (successCode.code == '404') {
            this.isloginSendOTP = false;
            this.toastr.error(
              'Account not found. Please register to continue.',
              ''
            );
            this.stopLoader();
            // form?.resetForm();
          } else if (successCode.code == '401') {
            this.isloginSendOTP = false;
            this.toastr.error(
              'You have entered incorrect mobile number or email or password.',
              ''
            );
            this.stopLoader();
            // form?.resetForm();
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
    // this.api
    //   .sendOTP(this.selectedCountryCode, this.mobileNumberorEmail, this.type)
    //   .subscribe({
    //     next: (successCode: any) => {
    //       if (successCode.code == '200') {
    //         this.isloginSendOTP = false;
    //         this.modalService1.closeModal();
    //         this.otpSent = true;
    //         this.showOtpModal = true;
    //         this.USER_ID = successCode.USER_ID;
    //         this.USER_NAME = successCode.USER_NAME;

    //         this.remainingTime = 60;
    //         this.startTimer();
    //         this.toastr.success('OTP Sent Successfully...', '');
    //         this.modalVisible = false;
    //         this.openRegister = false;
    //         this.openVerify = true;
    //         this.stopLoader();
    //       } else if (successCode.code == '400') {
    //         this.statusCode =
    //           'The user is either not registered or has been deactivated.';
    //         this.stopLoader();
    //       } else {
    //         this.isloginSendOTP = false;
    //         this.toastr.error('OTP Validation Failed...', '');
    //         this.stopLoader();
    //       }
    //     },
    //     error: (error) => {
    //       console.log('error', error);
    //       this.stopLoader();
    //       // Handle error if login fails
    //       if (error.status === 400) {
    //         this.statusCode =
    //           'The user is either not registered or has been deactivated.';
    //         this.toastr.info(
    //           'The user is either not registered or has been deactivated.',
    //           ''
    //         );
    //       } else {
    //         this.toastr.error('Error sending OTP', '');
    //       }
    //       this.isloginSendOTP = false;

    //       this.stopLoader();
    //     },
    //   });
  }
  whichOTP = '';
  registrationSubmitted = false;
  pass: any = '';
  handleSpacePress(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
    }
  }
  handleKeyPress(event: KeyboardEvent) {
    if (
      event.key === ' ' &&
      (!this.data.CUSTOMER_NAME || this.data.CUSTOMER_NAME.length === 0)
    ) {
      event.preventDefault();
    }
  }
  save(form?: NgForm) {
    sessionStorage.setItem('USER_NAME', this.data.CUSTOMER_NAME);
    sessionStorage.setItem('emailormobile', this.mobileNumberorEmail);
    sessionStorage.setItem('PASSWORD', this.data.PASSWORD);

    console.log(form?.value, 'reg');
    // form?.resetForm();

    // console.log(form?.value, 'ioug')

    this.data.COUNTRY_CODE = this.selectedCountryCode;
    console.log(this.data.COUNTRY_CODE);
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
      console.log('name', this.data.CUSTOMER_NAME);

      this.api

        .sendOTP1(this.mobileNumberorEmail, this.type)

        .subscribe({
          next: (successCode: any) => {
            console.log(this.data, 'dkjfiohfo');

            console.log(successCode, 'scty');

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

              this.openVerify = true;
              this.data.CUSTOMER_NAME = temp;
              console.log('name', this.data.CUSTOMER_NAME);

              console.log(this.openVerify, 'openverify');

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
            console.log('error', error);
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
  statusCode: any = '';
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
            console.log(this.isverifyOTP, 'this.isverifyOTP');
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
  // VerifyOTP() {
  //   if (this.otp.join('').length < 4) {
  //     this.toastr.error('Please Enter OTP...', '');
  //     return;
  //   }
  //   // this.isverifyOTP = true; // Set true before API call
  //   console.log(this.isverifyOTP,'this.isverifyOTP')
  //   const otp1 = this.otp.join('');
  //   // this.isverifyOTP = true; // Set true before API call
  //   this.loadData();
  //   if (this.whichOTP == 'login') {
  //     let CLOUD_ID = this.cookie.get('CLOUD_ID');
  //     this.api
  //       .verifyOTP(
  //         this.type,
  //         this.mobileNumberorEmail,
  //         otp1,
  //         // this.USER_ID,
  //         // this.USER_NAME,
  //         // 1,
  //         // CLOUD_ID
  //       )
  //       .subscribe({
  //         next: (successCode: any) => {
  //           console.log('successCode', successCode.body.code);
  // this.isverifyOTP = false; // Set true before API call
  //       console.log(this.isverifyOTP,'this.isverifyOTP')
  //           if (successCode.body.code === 200) {
  //             console.log('wertyuiko');
  //   // this.isverifyOTP = false; // Set true before API call
  //   //     console.log(this.isverifyOTP,'this.isverifyOTP')
  //             this.toastr.success('OTP verified successfully...', '');
  //             this.modalService.dismissAll();
  //             this.isOk = false;
  //               this.createCustomer();
  //             // window.location.href = '/home';
  //            this.modalVisible = true;
  //            this.openRegister = false
  //            this.openVerify = false

  //             sessionStorage.setItem('token', successCode.body.token);
  //             this.cookie.set(
  //               'token',
  //               successCode.body.token,
  //               365,
  //               '',
  //               '',
  //               false,
  //               'Strict'
  //             );

  //             // const user = successCode.body.UserData[0];

  //             // sessionStorage.setItem(
  //             //   'userId',
  //             //   this.commonFunction.encryptdata(user.USER_ID)
  //             // );
  //             // sessionStorage.setItem(
  //             //   'userName',
  //             //   this.commonFunction.encryptdata(user.USER_NAME)
  //             // );
  //             // sessionStorage.setItem(
  //             //   'mobileNumber',
  //             //   this.commonFunction.encryptdata(user.MOBILE_NUMBER)
  //             // );

  //             this.otp = ['', '', '', ''];

  //             // this.isverifyOTP = false;

  //             this.statusCode = '';
  //           } else {
  //             this.toastr.error('Something went wrong. Please try again.');
  //           }

  //           console.log('successCode.body.code', successCode.body.code);
  //           this.isverifyOTP = false;

  //           // this.stopLoader();
  //         },
  //         error: (errorResponse) => {
  //           console.error('verifyOTP API failed:', errorResponse);
  //           if (errorResponse.error.code === 300) {
  //             this.toastr.error(
  //               'Invalid request. Please check the entered details.'
  //             );
  //             console.log('xxx');
  //             this.statusCode = 'invalid OTP';
  //             this.stopLoader();
  //           } else {
  //             console.log('sss');
  //             this.toastr.error('Something went wrong. Please try again.');
  //             this.statusCode = '';
  //             this.stopLoader();
  //           }
  //           console.log('kkkkk');

  //           this.isverifyOTP = false;
  //           this.stopLoader();
  //         },
  //       });
  //   }
  //   //  else if (this.whichOTP == 'register') {
  //   //   let CLOUD_ID = this.cookie.get('CLOUD_ID');
  //   //   this.data.TYPE = 'M';
  //   //   this.data.COUNTRY_CODE = this.selectedCountryCode;
  //   //   this.data.CUSTOMER_CATEGORY_ID = 1;
  //   //   this.data.CUSTOMER_EMAIL_ID = this.data.EMAIL_ID;
  //   //   this.data.OTP = otp1;
  //   //   this.data.IS_NEW_CUSTOMER = 1;
  //   //   this.data.CUSTOMER_NAME = this.data.CUSTOMER_NAME;
  //   //   this.data.IS_SPECIAL_CATALOGUE = false;
  //   //   this.data.ACCOUNT_STATUS = true;

  //   //   this.data.CUSTOMER_MOBILE_NO = this.data.CUSTOMER_MOBILE_NO;
  //   //   this.data.CUSTOMER_TYPE = 'I';
  //   //   this.data.TYPE_VALUE = this.data.CUSTOMER_MOBILE_NO;
  //   //   this.data.CLOUD_ID = CLOUD_ID;
  //   //   const registerData = this.data;
  //   //   this.loadData();
  //   //   this.api.userRegistration(this.data).subscribe({
  //   //     next: (successCode: any) => {
  //   //       if (successCode.body.message === 'Logged in successfully.') {
  //   //         this.toastr.success('OTP verified successfully...', '');
  //   //         this.modalService.dismissAll();
  //   //         this.isOk = false;
  //   //         this.data = registerData;
  //   //         console.log('after in verification', this.data);
  //   //         sessionStorage.setItem('token', successCode.body.token);
  //   //         this.cookie.set(
  //   //           'token',
  //   //           successCode.body.token,
  //   //           365,
  //   //           '',
  //   //           '',
  //   //           false,
  //   //           'Strict'
  //   //         );

  //   //         const user = successCode.body.UserData[0]; // This is the user object
  //   //         this.USER_ID = user.USER_ID;
  //   //         console.log('user.USER_ID:', user.USER_ID);
  //   //         console.log('user.USER_NAME:', user.USER_NAME);
  //   //         console.log('user.MOBILE_NUMBER:', user.MOBILE_NUMBER);
  //   //         sessionStorage.setItem(
  //   //           'userId',
  //   //           this.commonFunction.encryptdata(user.USER_ID)
  //   //         );
  //   //         sessionStorage.setItem(
  //   //           'userName',
  //   //           this.commonFunction.encryptdata(user.USER_NAME)
  //   //         );
  //   //         sessionStorage.setItem(
  //   //           'mobileNumber',
  //   //           this.commonFunction.encryptdata(user.MOBILE_NUMBER)
  //   //         );

  //   //         this.otp = ['', '', '', ''];
  //   //         this.isverifyOTP = false;
  //   //         this.statusCode = '';
  //   //         this.openVerify = false;
  //   //         this.stopLoader();
  //   //       }

  //   //       console.log('successCode.body.code', successCode.body.code);

  //   //       this.stopLoader();
  //   //     },
  //   //     error: (errorResponse) => {
  //   //       console.error('verifyOTP API failed:', errorResponse);
  //   //       if (errorResponse.error.code === 300) {
  //   //         this.toastr.error(
  //   //           'Invalid request. Please check the entered details.'
  //   //         );
  //   //         console.log('xxx');
  //   //         this.statusCode = 'invalid OTP';
  //   //       } else {
  //   //         console.log('sss');
  //   //         this.toastr.error('Something went wrong. Please try again.');
  //   //         this.statusCode = '';
  //   //       }
  //   //       console.log('kkkkk');
  //   //       this.stopLoader();
  //   //       this.isverifyOTP = false;
  //   //     },
  //   //   });
  //   // }

  //   // this.isverifyOTP = false;
  // }

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
        this.data.STATUS
      )
      .subscribe({
        next: (successCode: any) => {
          // console.log(successCode)
          if (successCode.body.code == '200') {
            this.isloginSendOTP = false;
            this.modalService1.closeModal();
            console.log(successCode);
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
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
              backdrop.remove();
            }
            // this.renderer.removeClass(document.body, 'modal-open');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.overflowX = 'hidden';
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

  @ViewChild('openMap') openMap!: TemplateRef<any>;
  // @ViewChild('openMap', { static: true }) openMap!: TemplateRef<any>;
  @ViewChild('loginforgotModal') loginforgotModal!: TemplateRef<any>;

  isSendOpt: boolean = false;
  loginforgot(currentModal: any) {
    this.otpSent = true;
    this.otp = ['', '', '', '', '', ''];
    this.startTimer();
    if (this.mobileNumberorEmail.length === 10) {
      this.isSendOpt = true;
    } else {
      this.toastr.error('Please enter a valid 10-digit mobile number.');
    }
  }
  // Default OTP for validation
  forgotdefaultOTP = '654321';
  otp: string[] = ['', '', '', '', '', '']; // Array to store OTP input
  showError = false; // Flag to control error message visibility

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
  handleEnterKey(content: any) {
    if (this.isSendOpt) {
    } else {
      // Otherwise, call the existing function for the second button
      this.loginforgot(content);
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
  isverifyOTP: boolean = false;

  @ViewChild('loginforgetwithpass') loginforgetwithpass!: TemplateRef<any>;
  isverifyForgotOTP: boolean = false;
  VerifyforgotOTP(content: any) {
    const otp1 = this.otp.join('');
    const FIREBASE_REG_TOKEN = 'bacdefghi';
    this.isverifyForgotOTP = true;
  }

  passwordVisible: boolean = false; // Initially password is hidden
  passwordFieldType: string = 'password'; // Set default input type to 'password'

  confpasswordVisible: boolean = false; // Initially password is hidden
  passconfwordFieldType: string = 'password'; // Set default input type to 'password'

  // Toggle password visibility
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    this.passwordFieldType = this.passwordVisible ? 'text' : 'password'; // Toggle input type
  }
  toggleconfPasswordVisibility() {
    this.confpasswordVisible = !this.confpasswordVisible;
    this.passconfwordFieldType = this.confpasswordVisible ? 'text' : 'password'; // Toggle input type
  }

  data: registerdata = new registerdata();
  isOk = true;

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
  openmodal123(currentModal: any) {
    this.modalService.dismissAll(currentModal);
    this.modalService1.openModal();
    this.forgotclearOTPFields();
    // this.mobileNumberorEmail = "";
    this.loginSubmitted = false;
    this.statusCode = '';
  }

  private isEmail(value: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(value);
  }

  inputType: 'initial' | 'mobile' | 'email' = 'initial';
  selectedCountryCode: string = '+1';
  countryCodeVisible: boolean = false;
  userName: string = '';
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
  //     return;
  //   }
  //     this.inputType = 'mobile';

  // }
  onIdentifierInput(event: any) {
    let value: string = event.target.value;
    console.log(this.mobileNumberorEmail, 'mobileoremail');
    console.log(event, 'event');

    if (!value || value.length < 3) {
      this.inputType = 'initial';
      return;
    }

    // Check if input contains letters → email
    if (/[a-zA-Z]/.test(value)) {
      this.inputType = 'email';
      return;
    }

    // Otherwise → mobile
    this.inputType = 'mobile';

    try {
      // ✅ Detect country code from the first few digits
      if (value.startsWith('00')) {
        value = '+' + value.substring(2); // normalize 00 → +
      }

      const firstFour = value.substring(0, 4);
      const match = this.countryCodes.find((c) =>
        firstFour.startsWith(c.value)
      );

      if (match) {
        this.selectedCountryCode = match.value;
      }
    } catch (err) {
      console.warn('Error detecting country code:', err);
    }
  }

  validateMobileNumber(number: string): boolean {
    return /^[6-9]\d{9}$/.test(number);
  }

  validateEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
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

  showCountryDropdown: boolean = false;
  searchQuery: string = '';
  filteredCountryCodes: any[] = [];

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

  selectCountry(country: any) {
    this.selectedCountryCode = country.value;
    this.data.COUNTRY_CODE = this.selectedCountryCode;
    this.showCountryDropdown = false;
    this.searchQuery = '';
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
  showPincodeDropdown: boolean = false;
  searchPincode: string = '';
  filteredPincodes: any[] = [];
  selectedPincode: string = '';

  filterPincodes(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredPincodes = this.pincodeData.filter(
      (item: any) =>
        item.PINCODE.toLowerCase().includes(query) ||
        item.PINCODE_NUMBER.toLowerCase().includes(query)
    );
  }

  // Reference all dropdown wrapper instances in the template
  @ViewChildren('dropdownWrapper') dropdownWrappers!: QueryList<ElementRef>;

  // Close dropdown when clicking outside any wrapper
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

  openLoginModal() {
    // Close the register modal (assuming `this.register` is the reference to the register modal)
    this.modalService1.closeModal(); // This closes the register modal
    this.mobileNumberorEmail = '';
    this.registrationSubmitted = false;
    this.statusCode = '';
    this.issignUpLoading = false;
    this.selectedCountryCode = '91';
    this.inputType = 'initial';
    this.openRegister = false;
    this.statusCode = '';
    this.modalVisible = true;
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    // if (this.modalVisible) {
    //   this.modalService.dismissAll();
    //   this.modalService.open(this.showlogin, {
    //     backdrop: 'static',
    //     keyboard: false,
    //     centered: true,
    //   });
    // }
  }
  openRegistarModal() {
    // this.modalService1.closeModal();

    this.openVerify = false;
    this.openRegister = true;

    // const backdrop = document.querySelector('.modal-backdrop');
    // if (backdrop) {
    //   backdrop.remove();
    // }
  }

  address: any = {
    houseNo: '',
    landmark: '',
    city: '',
    pincode: '',
    state: '',
  };
  map2: any;
  longitude: any;
  latitude: any;

  locationCode: string = '';
  locationAddress: string = '';
  pincodeData: any = [];
  pincodeloading: boolean = false;
  selectedLocation: any;
  currentMarker: any;

  showAddressDetailsForm = false;
  user: User | null = null;

  // Mock data for dropdowns - replace with actual API calls
  countries: LocationOption[] = [{ id: 1, name: 'India' }];

  isConfirmLoading = false;
  addressSubmitted: boolean = false;
  isAddrssSaving: boolean = false;

  asGuest: boolean = false;
  onshowMap() {
    // this.showAddressDetailsForm = false;
    // this.closeregister();
    // setTimeout(() => this.initializeMapWithLocation(), 100);
    // this.openVerify = false;
    // this.modalVisible = false;
    // this.showMap = true;
    // this.asGuest = true;
  }

  showStateDropdown: boolean = false;
  searchState: string = '';
  filteredStates: any[] = [];

  loadData() {
    this.loaderService.showLoader();
  }
  dataLoaded = false;
  stopLoader() {
    this.dataLoaded = true;
    this.loaderService.hideLoader();
  }

  getPlaceholder() {
    return this.inputType === 'email'
      ? 'Enter email address'
      : this.inputType === 'mobile'
      ? 'Enter mobile number'
      : 'Enter email or mobile number';
  }

  alphaOnly(event: any) {
    event = event ? event : window.event;
    var charCode = event.which ? event.which : event.keyCode;
    if (
      charCode > 32 &&
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122)
    ) {
      return false;
    }
    return true;
  }

  backtologin() {
    // Close the register modal (assuming `this.register` is the reference to the register modal)
    this.modalService1.closeModal(); // This closes the register modal
    this.mobileNumberorEmail = '';
    this.registrationSubmitted = false;
    this.statusCode = '';
    this.issignUpLoading = false;
    this.selectedCountryCode = '91';
    this.inputType = 'initial';
    this.openRegister = false;
    this.statusCode = '';
    this.modalVisible = true;
    this.asGuest = false;
    // if (this.modalVisible) {
    //   this.modalService.dismissAll();
    //   this.modalService.open(this.showlogin, {
    //     backdrop: "static",
    //     keyboard: false,
    //     centered: true,
    //   });
    // }
  }
  forgotpass1: boolean = false;
  newPass: string = '';
  forgotpassModal() {
    // this.forgotpass1 = true;
    // this.modalVisible = false;
    // this.openRegister = false;
    // // this.forgotpass1 = false;

    // console.log(this.forgotpass1, ' this.forgotpass ');

    const loginModalEl = document.getElementById('loginmodal');

    // Check if the modal element exists and hide it using Bootstrap's modal function
    if (loginModalEl) {
      // This is the correct way to hide a Bootstrap modal programmatically
      (window as any).bootstrap.Modal.getInstance(loginModalEl)?.hide();
    }
    this.router.navigate(['/forgot-password']);
  }

  goBack(): void {
    //  this.renderer.removeClass(document.body, 'modal-open');

    // document.body.classList.remove('modal-open');
    const loginModalEl: any = document.getElementById('loginmodal');
    // // console.log(loginModalEl);
    // loginModalEl.addEventListener('hidden.bs.modal', () => {
    //   document.body.style.overflow = ''; // reset to default
    //   document.body.style.paddingRight = ''; // reset scrollbar padding
    // });
    // const modalInstance =
    //   bootstrap.Modal.getInstance(loginModalEl) ||
    //   new bootstrap.Modal(loginModalEl);
    // modalInstance.hide();
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    // if (window.history.length > 1) {
    //   this.location.back();
    // } else {
    this.router.navigate(['/home']); // fallback
    // }
  }

  showPassword: boolean = false;

  PasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  showConfirmPassword: boolean = false;
  confirmPass: string = '';
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  showLoginPassword: boolean = false;
  // confirmPass: string = '';
  toggleLoginPasswordVisibility() {
    this.showLoginPassword = !this.showLoginPassword;
  }
  // Removed duplicate specific outside click handler in favor of the generic one above
}
