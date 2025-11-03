import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { ApiServiceService } from './Service/api-service.service';
import { LoaderService } from './Service/loader.service';
import { ModalService } from './Service/modal.service';
import { CookieService } from 'ngx-cookie-service';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  Event,
  NavigationStart,
} from '@angular/router';
import { CommonFunctionService } from './Service/CommonFunctionService';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Pockit-website';
  constructor(
    private router: Router,
    private cookie: CookieService,
    private modalservice: ModalService,
    private apiservice: ApiServiceService,
    private loaderService: LoaderService,
    private activatedRoute: ActivatedRoute
  ) {
    this.loaderService.isLoading$.subscribe((loading) => {
      this.isLoading = loading;
    });
  }
  needLogeIn: boolean = false;
  isLoading = false; // Loader starts by default
  flashscreen: boolean = true;
  showFooter = true;
  showHeader = true;
  public commonFunction: CommonFunctionService = new CommonFunctionService();

  hideFooter: boolean = false;
  showPopup: boolean = false;

  // The path to your image
  popupImageSrc: string = 'assets/img/New.jpg';
  ngOnInit() {
    sessionStorage.setItem('IS_GUEST', 'false');
    sessionStorage.setItem('CART_REDIRECT','false')
    // this.getsession();
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationStart) {
        this.loaderService.showLoader();
        document.body.classList.remove('modal-open');
        document
          .querySelectorAll('.modal-backdrop')
          .forEach((el) => el.remove());
      }

      if (event instanceof NavigationEnd) {
        const currentUrl = event.urlAfterRedirects;

        const loginRoute = '/login';
        const forgotpasswordroute = '/forgot-password';
        const resetpassword = '/reset-password';
        const routesToHide = [loginRoute, forgotpasswordroute, resetpassword];
        const exactHiddenRoutes1 = ['book-common-page'];
        const dynamicPattern =
          /^\/explore\/[^\/]+\/plays\/[^\/]+\/buy-tickets\/[^\/]+$/;

        // // Hide header & footer on /login
        // this.showHeader = currentUrl !== loginRoute;
        // this.showFooter = currentUrl !== loginRoute;

        // // Optional: hide footer on other specific/dynamic routes
        // this.hideFooter = !(
        //   exactHiddenRoutes1.includes(currentUrl) ||
        //   dynamicPattern.test(currentUrl)
        // );

        this.showHeader = !routesToHide.includes(currentUrl);
        this.showFooter = !routesToHide.includes(currentUrl);

        // Optional: hide footer on other specific/dynamic routes
        this.hideFooter = !(
          exactHiddenRoutes1.includes(currentUrl) ||
          dynamicPattern.test(currentUrl)
        );

        // Scroll behavior
        const fragment = this.activatedRoute.snapshot.fragment;
        if (fragment) {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          window.scrollTo(0, 0);
        }

        this.loaderService.hideLoader();
      }
    });
    this.showPopup = true;
  }
  sessionkey: string = '';
  // private commonFunction = new CommonFunctionService(); // Assuming this is a service for common functions
  getsession() {
    if (
      sessionStorage.getItem('SESSION_KEYS') == undefined ||
      sessionStorage.getItem('SESSION_KEYS') == null
    ) {
      this.apiservice.sessionKeyGet().subscribe(
        (data) => {
          var d = data['sessionKey'];
          this.sessionkey = d;
          // console.log("session key",this.sessionkey);
          let ekey = this.commonFunction.encryptdata(this.sessionkey);
          sessionStorage.setItem('SESSION_KEYS', ekey);
        },
        (err) => {
          // console.log(err);
        }
      );
    }
  }
  closePopup(): void {
    this.showPopup = false;
  }
  openModal() {
    this.modalservice.openModal();
  }

  callAfterMessageReceived(payload: any) {
    console.log('Message received. ', payload);
    console.log(payload['data']);
  }
}
