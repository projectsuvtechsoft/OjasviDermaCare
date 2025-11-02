import { ViewportScroller } from '@angular/common';
import {
  Component,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CartService } from 'src/app/Service/cart.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { ProductDataService } from 'src/app/Service/ProductData.service ';
interface Product {
  name: string;
  category: string;
  price: string;
  description: string;
  image: string;
}
declare const products: { [id: string]: Product };

@Component({
  selector: 'app-productpage',
  templateUrl: './productpage.component.html',
  styleUrls: ['./productpage.component.css'],
})
export class ProductpageComponent {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiServiceService,
    private cartService: CartService,
    private toastr: ToastrService,
    private productService: ProductDataService,
    private vps: ViewportScroller
  ) {
     this.cartService.cartUpdated$.subscribe((cartItems) => {
      this.items = cartItems;
      
      // this.toastr.success('Item Added to cart', 'Success')
      // this.loadingProducts = false;
      // this.cd.detectChanges(); // Optional but ensures view update
    });
    this.cartService.loaderUpdate$.subscribe((isLoading) => { 
      this.isLoading = isLoading;
    });
  }
  selectedPrice: any;
  totalPrice: any;
  propertyId: any;
  Imgurl: any;
  varientId: any;
  similarProducts: any[] = [];
  items:any=[]
  //  vaishnavi
  ngOnInit() {
    this.Imgurl = this.IMAGEuRL + 'CustomerProfile/';
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.varientId = Number(this.route.snapshot.paramMap.get('variantId'));
    // this.scrollToSection('top')
    this.items=this.cartService.getCartItems();
    // if(this.productId && this.varientId){
    //   // console.log(this.hasItemsInCart(this.productId,this.varientId))
    // }
    this.getcustomerProductReviews();
    this.forceTop();
    this.updateResponsiveSettings();
    if (this.userID != null && this.userID != undefined && this.userID != '') {
      this.getViewDetails();
    }
    this.getFAQDetails();
    // this.getProductData();
    // this.router.events.subscribe((event) => {
    //   console.log(event);

    //   if (event instanceof NavigationEnd) {
    // window.scrollTo(0, 0);
    // console.log(window.history,'Window');

    //   }
    // });
    this.route.paramMap.subscribe((paramMap) => {
      this.propertyId = paramMap.get('id');
      const projectId = paramMap.get('id');
      this.varientId = Number(this.route.snapshot.paramMap.get('variantId'));
      // console.log(this.propertyyData);
      // this.getProductData();
      this.getpropertyDetails(this.propertyId)

      // if (this.propertyId) {
      //   this.varientId = Number(this.route.snapshot.paramMap.get('variantId'));
      //   this.getpropertyDetails(this.propertyId);
      // }
      // this.getvarientDetails(projectId)
      this.getingerdientDetails(projectId);

      let project = sessionStorage.getItem('propertyId');
      this.userID = this.commonFunction.decryptdata(this.userId);
    });
    this.calculateStarCounts();
    // this.hasItemsInCart()
  }
  private forceTop() {
    // 1) window/html/body
    try {
      window.scrollTo(0, 0);
    } catch {}
    try {
      this.vps.scrollToPosition([0, 0]);
    } catch {}
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 2) Reset any scrollable container inside the app
    // const sc = this.findScrollableContainer();
    // if (sc) sc.scrollTop = 0;
  }
  // scrollToSection(sectionId: string) {
  //   const element = document.getElementById(sectionId);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   }
  // }
  @ViewChild('closeBtn') closeBtn!: ElementRef<HTMLButtonElement>;

  reviewForm = {
    rating: 0,
    text: '',
  };
  euserID: string = sessionStorage.getItem('userId') || '';
  decyptedsessionKey: any;
  isLoading: boolean = false;
  redirecttoCart(){
    this.router.navigate(['/cart'])
  }
  setRating(value: number) {
    this.reviewForm.rating = value;
  }
  productId: any;

  reviewLoading: boolean = false;
  submitReview() {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));

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
      PRODUCT_ID: this.productId,
    };

    this.api.addProductreview(Data).subscribe(
      (res) => {
        if (res['code'] === 200) {
          this.toastr.success('Review Added Successfully');
          this.getcustomerProductReviews();
          this.reviewLoading = true;
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
  shouldShowTooltip: boolean[] = [];
  //kundan
  currentSlide = 0;
  showNavigation = true;
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
    // console.log(
    //   'this.maxSlideIndex',
    //   this.maxSlideIndex,
    //   'this.currentSlide',
    //   this.currentSlide
    // );

    if (this.currentSlide < this.maxSlideIndex) {
      this.currentSlide++;
    }
    // else {
    //   console.log(
    //     'this.visibleCards',
    //     this.visibleCards,
    //     'this.ReviewData?.length',
    //     this.ReviewData?.length
    //   );
    //   this.showNavigation = (this.ReviewData?.length ?? 0) > this.visibleCards;
    // }
    // console.log(
    //   'this.maxSlideIndex',
    //   this.maxSlideIndex,
    //   'this.currentSlide',
    //   this.currentSlide
    // );
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    }
  }
  // @ViewChildren('reviewText') reviewTextElements!: QueryList<ElementRef>;
  // updateResponsiveSettings() {
  //   const width = window.innerWidth;

  //   if (width >= 1024) {
  //     this.visibleCards = 3;
  //   } else if (width >= 768) {
  //     this.visibleCards = 2;
  //   } else {
  //     this.visibleCards = 1;
  //   }

  //   this.showNavigation = (this.ReviewData?.length ?? 0) > this.visibleCards;
  //   const max = this.maxSlideIndex;
  //   if (this.currentSlide > max) {
  //     this.currentSlide = max;
  //   }
  // }

  // get maxSlideIndex(): number {
  //   if (!this.ReviewData?.length || this.visibleCards === 0) return 0;
  //   return Math.max(
  //     0,
  //     Math.ceil(this.ReviewData.length / this.visibleCards) - 1
  //   );
  // }

  // nextSlide() {
  //   if (this.currentSlide < this.maxSlideIndex) {
  //     this.currentSlide++;
  //   }
  // }

  // prevSlide() {
  //   if (this.currentSlide > 0) {
  //     this.currentSlide--;
  //   }
  // }

  getcustomerProductReviews() {
    this.api
      .getcustomerProductReviews(` AND PRODUCT_ID = ${this.productId}`)
      .subscribe(
        (data) => {
          if (data['code'] === 200) {
            this.reviewLoading = false;
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
        (err) => console.log(err)
      );
  }

  //  changeMainImage(event: Event, src: string): void {
  //   const mainImage = document.getElementById("main-image") as HTMLImageElement;
  //   const target = event.target as HTMLElement;

  //   if (mainImage) {
  //     mainImage.src = src;
  //   }

  //   document.querySelectorAll(".thumbnail").forEach((thumb) => {
  //     thumb.classList.remove("border-primary");
  //     thumb.classList.add("border-transparent");
  //   });

  //   target.classList.remove("border-transparent");
  //   target.classList.add("border-primary");
  // }

  initToast(): void {
    document.addEventListener('DOMContentLoaded', () => {
      const addToCartBtn = document.getElementById(
        'addToCartBtn'
      ) as HTMLElement;
      const toast = document.getElementById('toastMessage') as HTMLElement;
      const toastImage = document.getElementById(
        'toastImage'
      ) as HTMLImageElement;
      const toastProductName = document.getElementById(
        'toastProductName'
      ) as HTMLElement;

      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          addToCartBtn.style.display = 'none';

          const productName =
            addToCartBtn.getAttribute('data-product-name') || '';
          const productImage =
            addToCartBtn.getAttribute('data-product-image') || '';

          toastProductName.textContent = productName;
          toastImage.src = productImage;

          toast.style.display = 'block';

          setTimeout(() => {
            toast.style.display = 'none';
          }, 3000);
        });
      }
    });
  }

  showToast(productImage = '', productName = ''): void {
    const toast = document.getElementById('toastMessage') as HTMLElement;
    const image = document.getElementById('toastImage') as HTMLImageElement;
    const name = document.getElementById('toastProductName') as HTMLElement;

    image.src = productImage;
    name.textContent = productName;

    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  initProductDetails(): void {
    document.addEventListener('DOMContentLoaded', () => {
      const productDetailsPage = document.getElementById(
        'productDetailsPage'
      ) as HTMLElement;
      const backToProducts = document.getElementById(
        'backToProducts'
      ) as HTMLElement;

      const detailsLinks = document.querySelectorAll('.product-details-link');
      detailsLinks.forEach((link) => {
        link.addEventListener('click', function (e: Event) {
          // const target = this as HTMLElement;
          // if (target.dataset.allowNavigation !== "true") {
          //   e.preventDefault();
          //   const productId = target.getAttribute("data-product")!;
          //   const product = products[productId];
          //   (document.getElementById("detailsName") as HTMLElement).textContent = product.name;
          //   (document.getElementById("detailsCategory") as HTMLElement).textContent = product.category;
          //   (document.getElementById("detailsPrice") as HTMLElement).textContent = product.price;
          //   (document.getElementById("detailsDescription") as HTMLElement).textContent = product.description;
          //   const mainImg = document.getElementById("detailsMainImage") as HTMLImageElement;
          //   mainImg.src = product.image;
          //   mainImg.alt = product.name;
          //   productDetailsPage.classList.remove("hidden");
          //   document.body.style.overflow = "hidden";
          // }
        });
      });

      backToProducts?.addEventListener('click', () => {
        productDetailsPage.classList.add('hidden');
        document.body.style.overflow = 'auto';
      });
    });
  }

  quantity = 1;

  showTab(event: Event, tabName: string): void {
    document.querySelectorAll('.tab-content').forEach((content) => {
      content.classList.remove('active');
    });

    document.querySelectorAll('.tab-button').forEach((button) => {
      button.classList.remove('active');
    });

    const tab = document.getElementById(tabName);
    tab?.classList.add('active');

    const target = event.target as HTMLElement;
    target.classList.add('active');
  }

  toggleAccordion(event: Event): void {
    const button = event.currentTarget as HTMLElement;
    const content = button.nextElementSibling as HTMLElement;
    const icon = button.querySelector('.accordion-icon');

    const isOpen = content.classList.contains('active');

    // Toggle visibility
    content.classList.toggle('active', !isOpen);

    // Toggle icon
    icon?.classList.toggle('ri-arrow-down-s-line', isOpen);
    icon?.classList.toggle('ri-arrow-up-s-line', !isOpen);
  }
 

  collapseAllAccordionsOnLoad(): void {
    window.addEventListener('load', () => {
      const allContents = document.querySelectorAll('.accordion-content');
      allContents.forEach((content) => {
        (content as HTMLElement).style.display = 'none';
      });
    });
  }
   hasActiveVariants(productId: number): boolean {
    const variants = this.variantMap[productId] || [];
    return variants.some((v) => v.STATUS === 1);
  }
  show: any;
  propertyyData: any = [];
  Gallery: any;
  selectedVariantId1: any;
  // vaishnavi
  getpropertyDetails(propertyId: any) {
    this.show = true;
    this.loadingProducts = true;
    this.api
      .getAllProductMaster(1, 1, 'id', 'desc', 'AND ID =' + propertyId, '')
      .subscribe((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          this.propertyyData = data.data;
          this.loadingProducts = false;

          // this.propertyyData.forEach((product: any) => {
          this.loadProductVariantsFromData(this.propertyyData[0]);
          let variants = this.propertyyData[0].VARIENTS;

          if (typeof variants === 'string') {
            try {
              variants = JSON.parse(variants);
            } catch (e) {
              variants = [];
            }
          }

          if (Array.isArray(variants) && variants.length > 0) {
            const matchingVariant = variants.find(
              (v: any) => v.VARIENT_ID === this.varientId
            );

            this.variantRateMap[this.propertyyData[0].ID] =
              matchingVariant.RATE;
            this.selectedVariantMap[this.propertyyData[0].ID] = this.varientId;
          } else {
            this.variantRateMap[this.propertyyData[0].ID] = 0;
          }
          // });

          if (this.propertyyData.length > 0) {
            this.selectedVariantId1 = this.propertyyData[0].ID;
            // this.totalPrice = this.propertyyData[0].RATE || 0;
            this.totalPrice =
              this.variantRateMap[this.propertyyData[0].ID] || 0;
            // Load similar products by category of current product
            const categoryId = this.propertyyData[0]?.CATEGORY_ID;
            if (categoryId) {
              this.loadSimilarProductsByCategory(categoryId);
            }
          }
          this.show = false;
        }
      });
  }
  FAQData: any = [];
  getFAQDetails() {
    this.api
      .getFAQDetails(' AND PRODUCT_ID=' + this.productId)
      .subscribe((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          // handle your FAQ data here
          this.FAQData = data.data;
          console.log('FAQ Details:', this.FAQData);
        } else {
          console.error('Something Went Wrong.', '');
        }
      });
  }
  ViewData: any = [];
  getViewDetails() {
    this.api
      .getViewDetails(this.productId, this.userID)
      .subscribe((data: any) => {
        // if (data && data.data && Array.isArray(data.data)) {
        //   // handle your FAQ data here
        //   this.ViewData = data;
        //   this.getpropertyDetails1();
        //   console.log('ViewData Details:', this.ViewData);
        // } else {
        //   console.error('Something Went Wrong.', '');
        // }
        if (data && data.data) {
          let ids: string[] = [];
          if (typeof data.data === 'string') {
            ids = data.data.split(',').map((id: string) => id.trim());
          } else if (Array.isArray(data.data)) {
            ids = data.data;
          }
          this.ViewData = { data: ids }; // normalize into array
          this.getpropertyDetails1();
          console.log('ViewData Details:', this.ViewData);
        } else {
          console.error('Something Went Wrong.');
        }
      });
  }
  goToImage(productId: string, index: number) {
    this.imageIndices[productId] = index;
  }

  // Helper function to generate star icons
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

  // vaishnavi
  varient: any;
  selectedVariantId: any = null;
  price: number = 0;
  selectedVariantStock: any;
  variantMap: { [key: number]: any[] } = {};
  variantMap1: { [key: number]: any[] } = {};
  selectedVariantMap: { [key: number]: number } = {};
  selectedVariantMap1: { [key: number]: number } = {};
  variantStockMap: { [key: number]: number } = {};

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
        const matchingVariant = variants.find(
          (v: any) => v.VARIENT_ID === this.varientId
        );

        if (matchingVariant) {
          this.selectedVariantMap[product.ID] = matchingVariant.VARIENT_ID;
          this.variantRateMap[product.ID] = matchingVariant.RATE || 0;
          this.variantStockMap[product.ID] = matchingVariant.OPENING_STOCK || 0;
          this.selectedVariantStock = matchingVariant.CURRENT_STOCK || 0;
          console.log('Matching ', matchingVariant);
          console.log('propertyData', this.propertyyData);
        } else {
          const firstAvailable = variants.find((v: any) => v.STATUS === 1);
          if (firstAvailable) {
            this.selectedVariantMap[product.ID] = firstAvailable.VARIENT_ID;
            this.variantRateMap[product.ID] = firstAvailable.RATE || 0;
            this.variantStockMap[product.ID] =
              firstAvailable.OPENING_STOCK || 0;
            this.selectedVariantStock = firstAvailable.CURRENT_STOCK || 0;
            console.log('first Available', firstAvailable);
          }
        }
      }
    }
  }

  change(selectedId: string, productId: number, isDetailchange: boolean): void {
    if (isDetailchange) {
      this.router.navigate(['/product_details', productId, selectedId]);
      this.varientId = Number(this.route.snapshot.paramMap.get('variantId'));
      const variants = this.variantMap[productId] || [];
      const selected = variants.find(
        (v: any) => v.VARIENT_ID === Number(selectedId)
      );
      if (selected) {
        this.selectedVariantMap[productId] = selected.VARIENT_ID;
        this.variantRateMap[productId] = selected.RATE || 0;
        this.selectedVariantStock = selected.CURRENT_STOCK || 0;
        this.selectedPrice = selected.RATE || 0;
        this.selectedVarientrecent[productId] = selected;
        this.updateTotalPrice();
      }
    } else {
      const variants = this.variantMap1[productId] || [];
      const selected = variants.find(
        (v: any) => v.VARIENT_ID === Number(selectedId)
      );

      if (selected) {
        this.selectedVariantMap1[productId] = selected.VARIENT_ID;
        this.variantRateMap1[productId] = selected.RATE || 0;
        this.variantStockMap[productId] = selected.OPENING_STOCK || 0;
        this.selectedPrice = selected.RATE || 0;
        this.selectedVarientrecent[productId] = selected;
        this.updateTotalPrice();
      }
    }
    // console.log(this.selectedVarientrecent);
  }

  // change(selectedId: string): void {
  //   const selected = this.varient.find((v: any) => v.ID === Number(selectedId));
  //   if (selected) {
  //     this.selectedPrice = selected.RATE;
  //       this.selectedVariantStock = selected?.OPENING_STOCK || 0;
  //   }
  //   this.updateTotalPrice()
  // }

  propertyyData1: any;
  loadingProducts = false;

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
            this.quantity = 1;
            this.updateTotalPrice();
          }

          this.show = false;
        }
      });
  }

  variantRateMap: { [productId: number]: number } = {};
  variantRateMap1: { [productId: number]: number } = {};
  selectedVarientrecent: any = {};
  benefitsArray = [];

  filter: any;
  getpropertyDetails1() {
    this.show = true;
    this.loadingProducts = true;
    // if (this.ViewData && this.ViewData.data && this.ViewData.data.length > 0) {
    // join array values into comma separated string
    if (this.ViewData && this.ViewData.data && this.ViewData.data.length > 0) {
      // join array values into comma separated string
      const ids = this.ViewData.data.join(',');

      this.filter = `AND IS_VERIENT_AVAILABLE = 1 AND STATUS = 1`;
      // only add ID filter if ids exist
      if (ids) {
        this.filter += ` AND ID IN (${ids})`;
      }
    }
    this.api
      .getAllProductMaster(0, 0, 'id', 'desc', this.filter, '')
      .subscribe((data) => {
        if (data && data.data && Array.isArray(data.data)) {
          this.propertyyData1 = data.data;
          this.loadingProducts = false;
          // console.log(' this.propertyyData1', this.propertyyData1);

          // this.propertyyData1.forEach((product: any) => {
          //   const filter = `AND PRODUCT_ID = ${product.ID}`;
          //   this.getFavoriteProducts();
          //   this.api
          //     .getAllVarient(1, 1, 'id', 'desc', filter)
          //     .subscribe((res: any) => {
          //       if (res && res.data && res.data.length > 0) {
          //         this.variantRateMap[product.ID] = res.data[0].RATE;
          //       }
          //     });
          // });

          const product = this.propertyyData1.find(
            (p: any) => p.ID === this.productId
          );

          if (product?.BENIFITS) {
            // Split comma-separated benefits into array
            this.benefitsArray = product.BENIFITS.split(',').map((b: string) =>
              b.trim()
            );
            console.log(this.benefitsArray, 'this.benefitsArray');
          } else {
            // No benefits found
            this.benefitsArray = [];
          }
          this.propertyyData1.forEach((product: any) => {
            // this.loadProductVariantsFromData(product);
            let variants = product.VARIENTS;

            if (typeof variants === 'string') {
              try {
                variants = JSON.parse(variants);
              } catch (e) {
                variants = [];
              }
            }

            if (Array.isArray(variants) && variants.length > 0) {
              this.variantRateMap1[product.ID] = variants[0].RATE;
              this.selectedVariantMap1[product.ID] = variants[0].VARIENT_ID;
              let Variants =
                variants?.filter(
                  (v: any) => v.STATUS === true || v.STATUS === 1
                ) || [];
              this.variantMap1[product.ID] = Variants;
              this.selectedVarientrecent[product.ID] = variants[0];
            } else {
              this.variantRateMap1[product.ID] = 0;
              this.selectedVarientrecent = {};
            }
          });
          this.show = false;
        }
        // console.log(this.selectedVarientrecent);
      });
  }

  getLogoUrl(filename: string): string {
    if (!filename) {
      return 'assets/images/no-image-available.png'; // fallback
    }
    return `${this.producctImageurl}ingredientLogo/${filename}`;
  }

  ingrdeient: any;
  getingerdientDetails(propertyId: any) {
    this.show = true;
    this.api
      .getAllIngrdeint(1, 1, 'id', 'desc', 'AND PRODUCT_ID =' + propertyId)
      .subscribe((data) => {
        if (data) {
          this.ingrdeient = data.data;
          this.show = false;
        }
      });
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

  producctImageurl: string = this.api.retriveimgUrl;
  producctImageurl2: string = this.api.retriveimgUrl + 'prdoctImages/';

  IMAGEuRL = this.api.retriveimgUrl;

  getImageUrl(photo: string): string {
    if (!photo) {
      return 'assets/images/no-image-house.png';
    }
    return `${this.producctImageurl}productImages/${photo}`;
  }
  selectedImages: { [index: number]: string } = {};
  changeMainImage(photoUrl: string, index: number): void {
    // this.selectedImages[index] = photoUrl;
    this.selectedImages = { ...this.selectedImages, [index]: photoUrl };
  }

  getImages(data: any): { PHOTO_URL: string }[] {
    try {
      if (Array.isArray(data.Images)) {
        return data.Images;
      }

      return JSON.parse(data.Images || '[]');
    } catch (e) {
      console.error('Invalid image JSON:', e);
      return [];
    }
  }
  updateTotalPrice(): void {
    // console.log(this.selectedPrice,this.quantity);

    this.totalPrice = this.selectedPrice * this.quantity;
  }

  increaseQuantity(): void {
    // console.log(this.selectedVariantMap,this.selectedVariantId1)
    const productId = Object.keys(this.selectedVariantMap)[0];
    const varientId = this.selectedVariantMap[Number(productId)];
    // console.log(productId,'proid',varientId,'varientId');
    const data = this.propertyyData.find(
      (data: any) => data.ID === Number(productId)
    );
    // console.log(data,'data');
    if (data.IS_VERIENT_AVAILABLE === 1 && data.VARIENTS) {
      const varients = JSON.parse(data.VARIENTS);
      // console.log(varients,'varients');
      const selectedVarientdata = varients.find(
        (data: any) => data.VARIENT_ID === Number(varientId)
      );
      // console.log(selectedVarientdata,'selectedVarientdata');
      if (selectedVarientdata) {
        const nextQuantity = this.quantity + 1; // simulate the next step
        const nextTotalSize = selectedVarientdata.CURRENT_STOCK/(selectedVarientdata.SIZE * nextQuantity);
        // const varientStock = selectedVarientdata.CURRENT_STOCK;
        // console.log(nextQuantity, nextTotalSize);

        if (nextTotalSize>=1) {
        this.quantity++;
        // item.QUANTITY++;
        this.updateTotalPrice();
          } else {
          this.toastr.info('Maximum quantity reached', 'Info');
        }
      }
    }

    // this.quantity++;
    // this.updateTotalPrice();
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateTotalPrice();
    }
  }

  initImageIndex(productId: string) {
    if (!(productId in this.imageIndices)) {
      this.imageIndices[productId] = 0;
    }
  }

  trackByProductId(index: number, product: any): number {
    return product.ID;
  }
  productsArray: any = [];
  viewCart = false;

  producctImageurl1: string = this.api.retriveimgUrl + 'productImages/';
  @ViewChild('closelogin') closelogin!: ElementRef;
  showLoginModal() {
    var d: any = document.getElementById('loginmodaltrack') as HTMLElement;
    d.click();
  }
  private commonFunction = new CommonFunctionService();

  openlogin() {
    this.closelogin.nativeElement.click();
    this.router.navigate(['/login']);
  }
  userId = sessionStorage.getItem('userId') || '';
  userID = this.commonFunction.decryptdata(this.userId);
  currentStockMap: { [productId: number]: number } = {};
  addToCart(product: any, isdetailschange: boolean): void {
    this.isLoading=true
    // console.log(product);
    // console.log(product.COUNTRY_ID);
    // console.log(product.ADDRESS_ID);
    // if (!this.userID) {
    //   this.showLoginModal();
    // } else {
    
    product.quantity = this.quantity;
    product.QUANTITY = this.quantity;
    // console.log(product)
    // this.hasItemsInCart(product.ID,product.VARIENT_ID)
    
    const existingProductIndex = this.productsArray.findIndex(
      (p: any) => p.ID === product.ID
    );
    if (isdetailschange) {
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
    } else {
      const selectedVariantId = this.selectedVariantMap1[product.ID];
      const variants = this.variantMap1[product.ID] || [];
      const selectedVariant = variants.find(
        (v) => v.VARIENT_ID === selectedVariantId
      );

      if (selectedVariant) {
        product.UNIT_ID = selectedVariant.UNIT_ID;
        product.VERIENT_ID = selectedVariantId;
        product.SIZE = selectedVariant.SIZE;
      }
    }
    const quantity = this.quantity;
    const rate = this.selectedPrice;
    const totalPrice = rate;

    const productWithTotal = {
      ...product,
      quantity: quantity,
      // PRICE1: totalPrice,
      RATE: totalPrice,
    };
    if (existingProductIndex !== -1) {
      this.cartService.addToCart(productWithTotal);
      // this.isLoading=false
      // this.toastr.success(`${product.NAME} updated in cart`, '');
      setTimeout(() => {
        this.isLoading = false;
      },300)
      this.viewCart = true;
    } else {
      // this.productsArray = [...this.productsArray, productWithTotal];
      this.cartService.addToCart(productWithTotal);
      // this.toastr.success(`${product.NAME} added to cart`);
          setTimeout(() => {
        this.isLoading = false;
      },300)
      this.viewCart = true;
    }
    this.quantity = 1; // or 0 depending on your default
    if (this.varient?.length > 0) {
      const firstVariant = this.varient[0];

      this.selectedVariantId = firstVariant.ID;
      this.selectedPrice = firstVariant.RATE || 0;
      this.quantity = 1; // set initial quantity
      this.updateTotalPrice();
    }
    // this.hasItemsInCart()
    //  this.getpropertyDetails(this.propertyId)
    // }
  }
  onCartDrawerClose(isVisible: boolean) {
    this.viewCart = isVisible;
  }
  getImageArray1(product: any): string[] {
    try {
      const images = JSON.parse(product.Images);
      return images.map((img: any) => img.PHOTO_URL);
    } catch (e) {
      console.error('Invalid image format', e);
      return [];
    }
  }

  isLiked: boolean = false;

  // toggleLike(product: any) {
  //   this.userID = this.commonFunction.decryptdata(this.euserID);
  //   let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
  //   this.decyptedsessionKey = this.commonFunction.decryptdata(sessionKey);

  //   if (this.userID) {
  //     this.decyptedsessionKey = '';
  //   }

  //   const Data = {
  //     PRODUCT_ID: product.ID,
  //     CUSTOMER_ID: this.userID || 0,
  //     SESSION_KEY: this.decyptedsessionKey,
  //   };

  //   if (product.isLiked) {
  //     this.api.removeFavoriteProduct(Data).subscribe(
  //       (res) => {
  //         if (res['code'] === 200) {
  //           this.toastr.success('Removed from Favourites');
  //           product.isLiked = false;
  //           this.getFavoriteProducts();
  //         } else {
  //           this.toastr.error('Failed to remove from favourites.');
  //         }
  //       },
  //       (err) => {
  //         this.toastr.error('Something went wrong. Try again later.');
  //       }
  //     );
  //   } else {
  //     const addData = { ...Data, CLIENT_ID: 1 };

  //     this.api.addFavoriteProduct(addData).subscribe(
  //       (res) => {
  //         if (res['code'] === 200) {
  //           this.toastr.success('Added to Favourites');
  //           product.isLiked = true;
  //           this.getFavoriteProducts();
  //         } else {
  //           this.toastr.error('Failed to add to favourites.');
  //         }
  //       },
  //       (err) => {
  //         this.toastr.error('Something went wrong. Try again later.');
  //       }
  //     );
  //   }
  // }

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

          this.propertyyData1 = this.propertyyData1.map((product: any) => ({
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
  addtodetail(product: any) {
    this.productService.setProduct(product);
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));

    if (this.selectedVariantMap1[product.ID]) {
      this.router.navigate([
        '/product_details',
        product.ID,
        this.selectedVariantMap1[product.ID],
      ]);
      this.forceTop();
    } else {
      this.router.navigate(['/product_details', product.ID]);
    }
  }

  getProductData() {
    // console.log(this.items,'items')

    let productData = this.productService.getProduct();
    // console.log(productData);
    if (!productData) {
      const productDataStr = sessionStorage.getItem('selectedProduct');
      if (productDataStr) {
        productData = JSON.parse(productDataStr);
      }
    }
    // console.log('productData', productData);

    if (productData) {
      const parsedArray = Array.isArray(productData)
        ? productData
        : [productData];

      this.propertyyData = parsedArray.map((item: any) =>
        typeof item === 'string' ? JSON.parse(item) : item
      );

      this.loadProductVariantsFromData(this.propertyyData[0]);

      let variants = this.propertyyData[0].VARIENTS;
      if (typeof variants === 'string') {
        try {
          variants = JSON.parse(variants);
        } catch {
          variants = [];
        }
      }

      if (Array.isArray(variants) && variants.length > 0) {
        const matchingVariant = variants.find(
          (v: any) => v.VARIENT_ID === this.varientId
        );
        this.variantRateMap[this.propertyyData[0].ID] =
          matchingVariant?.RATE || 0;
        this.selectedVariantMap[this.propertyyData[0].ID] = this.varientId;
        this.selectedPrice = matchingVariant?.RATE || 0;
      } else {
        this.variantRateMap[this.propertyyData[0].ID] = 0;
        this.selectedPrice = this.variantRateMap[this.propertyyData[0].ID] = 0;
      }

      if (this.propertyyData.length > 0) {
        this.selectedVariantId1 = this.propertyyData[0].ID;
        this.selectedPrice = this.variantRateMap[this.propertyyData[0].ID] || 0;
        this.totalPrice = this.variantRateMap[this.propertyyData[0].ID] || 0;
        // Load similar products by category of current product
        const categoryId = this.propertyyData[0]?.CATEGORY_ID;
        if (categoryId) {
          this.loadSimilarProductsByCategory(categoryId);
        }
      }
      
    } else {
      this.getpropertyDetails(this.propertyId);
    }
  }

  chunkArray(arr: any[], chunkSize: number) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  }

  guest = 'false';
  verifylogin() {
    // Refresh the userId from sessionStorage
    const currentUserId = sessionStorage.getItem('userId');
    this.guest = sessionStorage.getItem('IS_GUEST') || 'false';
    console.log('Updated userId:', this.userId);

    if (!currentUserId && this.guest == 'false') {
      this.showLoginModal();
    } else {
      // User is logged in
      console.log('User is logged in');
    }
  }
  getThumbnailStyle(photoUrl: string, i: number, data: any) {
    const isSelected =
      this.selectedImages[i] === photoUrl ||
      (!this.selectedImages[i] &&
        this.getImages(data)[0]?.PHOTO_URL === photoUrl);
    return {
      'box-shadow': isSelected ? '0px 0px 4px 1px #00000040' : 'none',
    };
  }
  getRoundedRating(value: number): number {
    return Math.round(value);
  }

  starCounts: { [key: number]: number } = {};
  calculateStarCounts() {
    // Initialize counts
    this.starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Count ratings
    this.ReviewData.forEach((review) => {
      const rating = review.RATINGS;
      if (rating >= 1 && rating <= 5) {
        this.starCounts[rating]++;
      }
    });
  }

  // Return count for a given star
  // Calculate count of reviews for a specific rating
  getRatingCount(rating: number): number {
    if (!this.ReviewData || this.ReviewData.length === 0) return 0;
    return this.ReviewData.filter((review) => review.RATINGS === rating).length;
  }

  // Calculate percentage for the rating bar
  getRatingPercentage(rating: number): number {
    if (!this.ReviewData || this.ReviewData.length === 0) return 0;
    const count = this.getRatingCount(rating);
    return (count / this.ReviewData.length) * 100;
  }

   toggleLike(product: any, event: any) {
    event.preventDefault(); // stop link navigation
    event.stopPropagation();
    // Gate behind login: if not logged in or logged in as guest, show login modal
    const currentUserId = sessionStorage.getItem('userId');
    const isGuest = (sessionStorage.getItem('IS_GUEST') || 'false') === 'true';
    if (!currentUserId || isGuest) {
      this.showLoginModal();
      return;
    }
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



shareProduct(product: any): void {
  const productUrl = `${window.location.origin}/product_details/${product.ID}`;

  if (navigator.share) {
    navigator.share({
      title: product.NAME,
      text: `Check out ${product.NAME}!`,
      url: productUrl
    }).then(() => {
      console.log('Product shared successfully');
    }).catch((error) => {
      console.log('Error sharing:', error);
      this.fallbackShare(productUrl);
    });
  } else {
    this.fallbackShare(productUrl);
  }
}
fallbackShare(url: string): void {
  navigator.clipboard.writeText(url).then(() => {
    this.showShareToast('Link copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    alert('Failed to copy link. Please copy manually: ' + url);
  });
}

showShareToast(message: string): void {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    color: #16a34a;
    border: 2px solid #16a34a;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 9999;
    font-family: Assistant, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    animation: slideInRight 0.4s ease;
  `;
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <i class="ri-share-line" style="font-size: 20px;"></i>
      <span style="font-weight: 600; font-size: 14px;">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.4s ease';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 400);
  }, 3000);
}

 loadSimilarProductsByCategory(categoryId: number) {
    const filter = `AND STATUS = 1 AND IS_VERIENT_AVAILABLE = 1 AND CATEGORY_ID = ${categoryId} AND ID <> ${this.productId}`;
    this.api
      .getAllProductMaster(0, 0, 'id', 'desc', filter, '')
      .subscribe((res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          this.similarProducts = res.data.slice(0, 4);
          // prepare variant maps for price/stock display
          this.similarProducts.forEach((product: any) => {
            let variants = product.VARIENTS;
            if (typeof variants === 'string') {
              try {
                variants = JSON.parse(variants);
              } catch (e) {
                variants = [];
              }
            }
            if (Array.isArray(variants) && variants.length > 0) {
              this.variantRateMap1[product.ID] = variants[0].RATE;
              this.selectedVariantMap1[product.ID] = variants[0].VARIENT_ID;
              const activeVariants = variants.filter((v: any) => v.STATUS === true || v.STATUS === 1) || [];
              this.variantMap1[product.ID] = activeVariants;
              this.selectedVarientrecent[product.ID] = variants[0];
            } else {
              this.variantRateMap1[product.ID] = 0;
            }
            // ensure an image index exists per product for safe access
            if (!(product.ID in this.imageIndices)) {
              this.imageIndices[product.ID] = 0;
            }
          });
        } else {
          this.similarProducts = [];
        }
      });
  }
hasItemsInCart(productId: number, productData: any): boolean {
  const itemsFromService = this.cartService.getCartItems();
  const items = this.items?.length > 0 ? this.items : itemsFromService;

  if (!items || items.length === 0) return false;

  // Parse product variants (may come as string)
  const variants =
    typeof productData?.VARIENTS === 'string'
      ? JSON.parse(productData?.VARIENTS)
      : productData?.VARIENTS || [];

  // Check if any variant of the product is already in cart
  return variants.some((variant: any) =>
    items.some(
      (item: any) =>
        item.PRODUCT_ID === productId && item.VERIENT_ID === variant.VARIENT_ID && this.selectedVariantMap[productId] == variant.VARIENT_ID
    )
  );
}


}
