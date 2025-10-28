import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { ProductDataService } from 'src/app/Service/ProductData.service ';

declare var bootstrap: any;

declare var $: any;
@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
  providers: [DatePipe],
})
export class LandingPageComponent {
  loadingRecords: boolean = false;
  dataList: any[] = [];
  sort: any;
  likeQuery: any;

  emailaddress: any = '';
  private commonFunction = new CommonFunctionService();
  producctImageurl: string = this.api.retriveimgUrl + 'productImages/';
  carouselItems: any = [];
  IMAGEuRL: any;

  carouselOptions = {
    loop: true,
    margin: 10,
    nav: true,
    dots: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
    responsive: {
      0: { items: 1 },
      600: { items: 4 },
      1000: { items: 5 },
    },
  };

  isBannerLoading: boolean = false;

  constructor(
    private router: Router,
    private api: ApiServiceService,
    public toastr: ToastrService,
    public datepipe: DatePipe,
    private cookie: CookieService,
    private productService: ProductDataService
  ) {}

  Imgurl: any;
  ngOnInit(): void {
    this.getcustomerWebsiteReviews();
    this.getProducts();
    this.getBannerData();
    this.getsession();
    this.IMAGEuRL = this.api.retriveimgUrl2();
    this.Imgurl = this.IMAGEuRL + 'CustomerProfile/';
    sessionStorage.setItem('IS_GUEST', 'false');
  }
  sessionkey: string = '';
  // private commonFunction = new CommonFunctionService(); // Assuming this is a service for common functions
  getsession() {
    if (
      sessionStorage.getItem('SESSION_KEYS') == undefined ||
      sessionStorage.getItem('SESSION_KEYS') == null
    ) {
      this.api.sessionKeyGet().subscribe(
        (data) => {
          var d = data['sessionKey'];
          this.sessionkey = d;
          // console.log("session key",this.sessionkey);
          let ekey = this.commonFunction.encryptdata(this.sessionkey);
          sessionStorage.setItem('SESSION_KEYS', ekey);
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
  goToProductList() {
    // console.log('redirecting to product list');

    this.router.navigate(['/product-list']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  activeTab: string = 'popular';
  filter: any = ' AND IS_POPULAR=1';

  carousels: any = {
    popular: 0,
    bestseller: 0,
    newarrival: 0,
  };

  products: any = {
    popular: [],
    bestseller: [],
    newarrival: [],
  };

  switchTab(tab: string): void {
    this.activeTab = tab;

    // Reset filter based on tab
    this.filter = '';
    if (tab === 'popular') this.filter = 'AND IS_POPULAR = 1';
    if (tab === 'bestseller') this.filter = 'AND IS_BEST_SELLER = 1';
    if (tab === 'newarrival') this.filter = 'AND IS_NEW_ARRIVAL = 1';
    if (tab === 'upcoming') this.filter = 'AND IS_UPCOMING = 1';

    this.carousels[tab] = 0;
    this.getProducts();
  }

  getProducts(): void {
    this.loadingRecords = true;
    this.api
      .getAllProductsData(
        0,
        0,
        'ID',
        'asc',
        this.filter +
          ' AND STATUS=1 AND IS_VERIENT_AVAILABLE=1 AND VARIENTS IS NOT NULL '
      )
      .subscribe({
        next: (data) => {
          if (data['code'] === 200) {
            this.loadingRecords = false;
            this.dataList = data.Products;
            this.products[this.activeTab] = this.dataList;
            // loadProductVariantsFromData
            this.dataList.forEach((product) => {
              this.loadProductVariantsFromData(product);
              let variants = product.VARIENTS;

              if (typeof variants === 'string') {
                try {
                  variants = JSON.parse(variants);
                } catch (e) {
                  variants = [];
                }
              }

              if (Array.isArray(variants) && variants.length > 0) {
                this.variantRateMap[product.ID] = variants[0].RATE;
                this.currentStockMap[product.ID] = variants[0].CURRENT_STOCK;
              } else {
                this.variantRateMap[product.ID] = 0;
                this.currentStockMap[product.ID] = 0;
              }
            });
            // console.log();
            
          } else {
            this.loadingRecords = false;
          }
        },
        error: (err) => {
          this.loadingRecords = false;
        },
      });
  }

  getVisibleProducts(tab: string): any[] {
    const start = this.carousels[tab];
    return this.products[tab]?.slice(start, start + 4);
  }

  next(tab: string): void {
    const max = this.products[tab].length - 4;
    if (this.carousels[tab] < max) {
      this.carousels[tab]++;
    }
  }

  prev(tab: string): void {
    if (this.carousels[tab] > 0) {
      this.carousels[tab]--;
    }
  }

  imageIndices: { [productId: string]: number } = {};

  getImageArray(product: any): string[] {
    try {
      const images = JSON.parse(product.Images);
      return images.map((img: any) => img.PHOTO_URL);
    } catch (e) {
      console.error('Invalid image format', e);
      return [];
    }
  }

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

  setImage(productId: number, index: number): void {
    this.imageIndices[productId] = index;
  }

  isExpanded: { [productId: string]: boolean } = {};

  toggleExpand(productId: string): void {
    this.isExpanded[productId] = !this.isExpanded[productId];
  }

  // slides = [
  //   { image: 'https://via.placeholder.com/400x200?text=Slide+1', title: 'Slide 1' },
  //   { image: 'https://via.placeholder.com/400x200?text=Slide+2', title: 'Slide 2' },
  //   { image: 'https://via.placeholder.com/400x200?text=Slide+3', title: 'Slide 3' }
  // ];

  getBannerData() {
    this.isBannerLoading = true;
    this.api.getWebBannerData(0, 0, 'id', 'desc', ' AND STATUS = 1').subscribe(
      (data) => {
        if (data['code'] == 200) {
          this.isBannerLoading = false;

          if (data.data.length > 0) {
            this.carouselItems = data['data'];

            // Allow Angular to finish rendering
            setTimeout(() => {
              ($('.owl-carousel') as any).owlCarousel({
                loop: true,
                margin: 10,
                nav: false,
                autoplay: false,
                autoplayTimeout: 3000, // time between slides (3s)
                autoplayHoverPause: true, // pause on hover

                responsive: {
                  0: { items: 1 },
                  600: { items: 1 },
                  1000: { items: 1 },
                },
              });
            }, 100); // delay ensures DOM is updated
          } else {
            this.isBannerLoading = false;

            this.carouselItems = [];
          }
        } else {
          this.isBannerLoading = false;

          this.carouselItems = [];
        }
      },
      (error) => {
        this.isBannerLoading = false;

        this.carouselItems = [];
      }
    );
  }

  // activeIndex = 0;

  // carouselOptions = {
  //   items: 1,
  //   loop: true,
  //   autoplay: true,
  //   dots: true,
  //   nav: false,
  //   autoplayTimeout: 4000,
  //   autoplayHoverPause: true,
  //   onTranslated: (event: any) => {
  //     this.activeIndex = (event.item.index - event.relatedTarget._clones.length / 2) % this.carouselItems.length;
  //     if (this.activeIndex < 0) this.activeIndex = this.carouselItems.length - 1;
  //   }
  // };

  SubsribeToNewsLetter() {
    if (
      this.emailaddress == undefined ||
      this.emailaddress == null ||
      this.emailaddress == ''
    ) {
      this.toastr.error('Please enter email ID', '');
    } else if (!this.commonFunction.emailpattern.test(this.emailaddress)) {
      this.toastr.error('Please enter valid email ID', '');
    } else {
      var data: any = {
        DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        EMAIL_ID: this.emailaddress,
        DEVICE_ID: this.cookie.get('deviceId'),

        CLIENT_ID: 1,
      };
      this.loadingRecords = true;

      this.api.SubsribeToNewsLetterCreate(data).subscribe(
        (successCode) => {
          if (successCode['code'] === 200) {
            this.toastr.success('Subscribed successfully.', '');
            this.loadingRecords = false;
            this.emailaddress = '';
          } else if (successCode['code'] === 400) {
            this.toastr.error('Email ID already exists', '');
            this.loadingRecords = false;
          } else {
            this.loadingRecords = false;
          }
        },
        (err) => {
          this.toastr.error('Something Went Wrong try Again Later..', '');
          this.loadingRecords = false;
        }
      );
    }
  }

  toastMessage: string = '';
  showToast: boolean = false;

  // showTailwindToast(message: string) {
  //   this.toastMessage = message;
  //   this.showToast = true;

  //   setTimeout(() => {
  //     this.showToast = false;
  //   }, 3000); // Toast visible for 3 seconds
  // }

  //   SubsribeToNewsLetter(): void {
  //   if (!this.emailaddress) {
  //     this.showTailwindToast('Please enter email ID');
  //   } else if (!this.commonFunction.emailpattern.test(this.emailaddress)) {
  //     this.showTailwindToast('Please enter a valid email ID');
  //   } else {
  //     const data: any = {
  //       DATE: this.datepipe.transform(new Date(), 'dd-MM-yyyy HH:mm:ss'),
  //       EMAIL_ID: this.emailaddress,
  //       DEVICE_ID: this.cookie.get('deviceId'),
  //       CLIENT_ID: 1,
  //     };

  //     this.loadingRecords = true;
  //     this.api.SubsribeToNewsLetterCreate(data).subscribe({
  //       next: (res) => {
  //         this.loadingRecords = false;
  //         if (res.code === 200) {
  //           this.showTailwindToast('Successfully subscribed!');
  //           this.emailaddress = '';
  //         } else {
  //           this.showTailwindToast('Something went wrong. Please try again.');
  //         }
  //       },
  //       error: () => {
  //         this.loadingRecords = false;
  //         this.showTailwindToast('Error occurred. Please try again later.');
  //       },
  //     });
  //   }
  // }
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  reviewForm = {
    rating: 0,
    text: '',
  };
  euserID: string = sessionStorage.getItem('userId') || '';
  decyptedsessionKey: any;
  userID: any;

  setRating(value: number) {
    this.reviewForm.rating = value;
  }

  submitReview() {
    if (this.reviewForm.rating === 0 || !this.reviewForm.text.trim()) {
      this.toastr.error('Please provide a rating and a comment', '');
      return;
    }

    this.userID = this.commonFunction.decryptdata(this.euserID);
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    this.decyptedsessionKey = this.commonFunction.decryptdata(sessionKey);

    if (this.userID) {
      this.decyptedsessionKey = '';
    }

    const Data = {
      CUSTOMER_ID: this.userID || 0,
      REVIEW: this.reviewForm.text,
      RATINGS: this.reviewForm.rating,
      CLIENT_ID: 1,
      // SESSION_KEY: this.decyptedsessionKey,
    };

    this.api.addreview(Data).subscribe(
      (res) => {
        if (res['code'] === 200) {
          this.toastr.success('Review Added Successfully');
          this.getcustomerWebsiteReviews();
        } else {
          this.toastr.error('Failed to add  review.');
        }
      },
      (err) => {
        this.toastr.error('Something went wrong. Try again later.');
      }
    );

    this.reviewForm = { rating: 0, text: '' };
    this.closeBtn.nativeElement.click();
  }

  ReviewData: any[] = [];

  getcustomerWebsiteReviews() {
    this.api.getcustomerWebsiteReviews('').subscribe(
      (data) => {
        if (data['code'] === 200) {
          this.ReviewData = data['data'];
          this.updateResponsiveSettings();
          window.addEventListener(
            'resize',
            this.updateResponsiveSettings.bind(this)
          );
          setTimeout(() => {
            this.reviewTextElements.forEach((el, index) => {
              const nativeEl = el.nativeElement;

              const isTruncated =
                nativeEl.scrollHeight > nativeEl.clientHeight + 1; // small buffer for precision

              this.shouldShowTooltip[index] = isTruncated;
            });
          }, 0);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  currentSlide = 0;
  showNavigation = false;
  shouldShowTooltip: boolean[] = [];
  visibleCards = 1;
  @ViewChildren('reviewText') reviewTextElements!: QueryList<ElementRef>;
  ngOnDestroy() {
    window.removeEventListener(
      'resize',
      this.updateResponsiveSettings.bind(this)
    );
  }

  updateResponsiveSettings() {
    const width = window.innerWidth;

    if (width >= 1024) {
      this.visibleCards = 3;
    } else if (width >= 768) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 1;
    }

    this.showNavigation = (this.ReviewData?.length ?? 0) > this.visibleCards;
    const max = this.maxSlideIndex;
    if (this.currentSlide > max) {
      this.currentSlide = max;
    }
  }

  get maxSlideIndex(): number {
    if (!this.ReviewData?.length || this.visibleCards === 0) return 0;
    return Math.max(
      0,
      Math.ceil(this.ReviewData.length / this.visibleCards) - 1
    );
  }

  nextSlide() {
    if (this.currentSlide < this.maxSlideIndex) {
      this.currentSlide++;
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }

  getFirstVariantId(product: any): number | null {
    let variants = product.VARIENTS;

    // If it's a string, parse it
    if (typeof variants === 'string') {
      try {
        variants = JSON.parse(variants);
      } catch {
        variants = [];
      }
    }

    // Return the first variant ID if available
    if (Array.isArray(variants) && variants.length > 0) {
      return variants[0].VARIENT_ID;
    }

    return null;
  }
  addtodetail(product: any) {
    // window.scrollTo(0, 0);
    this.productService.setProduct(product);
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
  }
   loadProductVariantsFromData(product: any) {
    let variants = product.VARIENTS;
    // console.log(variants);

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
        // console.log('this.unitIdMap[product.ID]', this.unitIdMap[product.ID]);
        let selectedvarientproductId = this.dataList.findIndex(
          (id) => id.ID === product.ID
        );

        this.dataList[selectedvarientproductId].CURRENT_STOCK_VARIENT =
          firstVariant.CURRENT_STOCK ? firstVariant.CURRENT_STOCK : 0;
        //  console.log('selectedvarientproductId',this.products[selectedvarientproductId])
      } else {
        const selectedVariant = Variants.find(
          (v) => v.VARIENT_ID === this.selectedVariantMap[product.ID]
        );

        if (selectedVariant) {
          this.unitIdMap[product.ID] = selectedVariant.UNIT_ID;
          let selectedvarientproductId = this.dataList.findIndex(
            (id) => id.ID === product.ID
          );
          this.dataList[selectedvarientproductId].CURRENT_STOCK_VARIENT =
            selectedVariant.CURRENT_STOCK ? selectedVariant.CURRENT_STOCK : 0;
          //  this.products[selectedvarientproductId].CURRENT_STOCK_VARIENT=firstVariant.CURRENT_STOCK
        }
      }
    }
  }
  trackByProductId(index: number, product: any): number {
    return product.ID;
  }
  showLoginModal() {
      const modalEl = document.getElementById('loginmodal');
    const modalInstance =
      bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);

    // Remove any leftover backdrops
    document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    modalInstance.show();
    // this.renderer.removeClass(document.body, 'modal-open');
    // document.body.classList.remove('modal-open');
    // // const loginModalEl = document.getElementById('loginmodal');
    // const backdrop = document.querySelector('.modal-backdrop');
    // if (backdrop) {
    //   backdrop.remove();
    // }
    // document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    // var d: any = document.getElementById('loginmodaltrack') as HTMLElement;
    // d.click();
  }
  selectedVariantMap: { [key: number]: number } = {};
  variantMap: { [key: number]: any[] } = {};
  variantStockMap: { [key: number]: number } = {};
  unitIdMap: { [key: number]: number } = {};
  productImageUrl: string = this.api.retriveimgUrl + 'productImages/';
  // imageIndices: { [productId: string]: number } = {};
  isLiked: boolean = false;
  // euserID: string = sessionStorage.getItem('userId') || '';
  // decyptedsessionKey: any;
  variantRateMap: { [productId: number]: number } = {};
  currentStockMap: { [productId: number]: number } = {};
  hasActiveVariants(productId: number): boolean {
    const variants = this.variantMap[productId] || [];
    return variants.some((v) => v.STATUS === 1);
  }
  toggleLike(product: any, event: any) {
    event.preventDefault(); // stop link navigation
    event.stopPropagation();
    this.userID = this.commonFunction.decryptdata(this.euserID);
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    this.decyptedsessionKey = this.commonFunction.decryptdata(sessionKey);
    const currentUserId = sessionStorage.getItem('userId');
    const isGuest = (sessionStorage.getItem('IS_GUEST') || 'false') === 'true';
    if (!currentUserId || isGuest) {
      this.showLoginModal();
      return;
    }
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
   totalFavourites: any;
  FavouritesData: any;
  getFavoriteProducts() {
    if (this.userID) {
      var filter = ` AND CUSTOMER_ID = ${this.userID}`;
    } else {
      let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
      this.decyptedsessionKey = this.commonFunction.decryptdata(sessionKey);
      var filter = ` AND SESSION_KEY = '${this.decyptedsessionKey}'`;
    }

    this.api.getFavoriteProducts(filter).subscribe(
      (data) => {
        if (data['code'] === 200) {
          this.totalFavourites = data['count'];
          this.FavouritesData = data['data'];
          localStorage.setItem('totalFavourites', this.totalFavourites);
          window.dispatchEvent(new Event('favouritesUpdated'));

          const favouriteProductIds = this.FavouritesData.map(
            (fav: any) => fav.PRODUCT_ID
          );

          this.products = this.products.map((product: any) => ({
            ...product,
            isLiked: favouriteProductIds.includes(product.ID),
          }));
        }
      },
      (err) => {
        console.log(err);
      }
    );
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
      this.currentStockMap[productId] = selected.CURRENT_STOCK
        ? selected.CURRENT_STOCK
        : 0;
      // this.updateTotalPrice();
    }
  }

   convertStringtoArray(str: string) {
    return JSON.parse(str);
  }
}
