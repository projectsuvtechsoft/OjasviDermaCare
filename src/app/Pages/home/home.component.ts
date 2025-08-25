import { Component,
  ViewChild,
  TemplateRef,
  ViewContainerRef,
  Renderer2,
  ElementRef,} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { ToastrService } from 'ngx-toastr';
import { CartService } from 'src/app/Service/cart.service';
import { DatePipe } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { ProductDataService } from 'src/app/Service/ProductData.service ';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DatePipe],
})
export class HomeComponent {
  isDrawerOpen = false;
  public commonFunction = new CommonFunctionService();
  emailaddress: any = '';
  loadingRecords: boolean = false;
  sortKey: string | null = 'ID';
  sortDirection: string | null = 'desc';
  variantRateMap: { [productId: number]: number } = {};
  currentStockMap: { [productId: number]: number } = {};

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private api: ApiServiceService,
    private toastr: ToastrService,
    private cartService: CartService,
    public datepipe: DatePipe,
    private cookie: CookieService,
    private route: ActivatedRoute,
    private productService:ProductDataService
  ) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }
  ngOnInit() {
    this.getFilters();
    this.getProducts();
    this.getsession();
    sessionStorage.setItem('IS_GUEST', 'false');
    //  document.body.classList.remove('modal-open');
    // document.querySelectorAll('.modal-backdrop').forEach((el) => el.remove());
    // if (this.categories?.length > 0) {
    //   this.selectedCategories = [this.categories[0]];
    // }
  }
  categories: any[] = [];
  products: any[] = [];
  selectedCategories: any = [];
  ingredients: any[] = [];

  visibleIngredients: any[] = []; // For displaying in UI
  itemsPerPage = 10;
  currentIndex = 0;

  selectedIngredient: any = [];
  // selectedSubCategory: any = null;
  loadingCategories = false;
  loadingProducts = false;
  loadingIngredients = false;
  currentPage = 1;
  productsPerPage = 9; // Though your HTML shows 1-9 of 42, your current static list only has 6. Adjust as needed.
  totalProducts = 42;

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  producctImageurl: string = this.api.retriveimgUrl + 'productImages/';

  getFilters() {
    this.api
      .getAllCategoryMaster(0, 0, 'SEQUENCE_NO', 'asc', ' AND STATUS=1')
      .subscribe(
        (res: any) => {
          // console.log('Categories fetched successfully:', res);
          this.loadingCategories = true;
          if (res && res.data && Array.isArray(res.data)) {
            this.categories = res.data;

            const id = this.route.snapshot.paramMap.get('categoryid');

            if (id) {
              // Find category from id
              const matchedCategory = this.categories.find(
                (cat) => cat.CATEGORY_ID == id
              );

              if (
                matchedCategory &&
                !this.selectedCategories.includes(matchedCategory)
              ) {
                // Manually create a mock event like a checkbox is checked
                const mockEvent = {
                  target: { checked: true },
                };

                this.onCategoryChange(mockEvent, matchedCategory);
              }
            }
            this.loadingCategories = false;
          } else {
            // conso('', '');
            this.categories = [];
            this.loadingCategories = false;
          }
        },
        (err: any) => {
          console.error('Error fetching categories:', err);
          this.loadingCategories = false;
          this.categories = [];
        }
      );
    this.api
      .getAllIngredientMaster(0, 0, 'id', 'asc', ' AND STATUS=1')
      .subscribe(
        (res: any) => {
          this.loadingIngredients = true;
          if (res && res.data && Array.isArray(res.data)) {
            this.ingredients = res.data;
            this.visibleIngredients = this.ingredients.slice(
              0,
              this.itemsPerPage
            );
            this.loadingIngredients = false;
          } else {
            // console.error('Invalid ingredient data format:', res);
            this.ingredients = [];
            this.loadingIngredients = false;
          }
        },
        (err: any) => {
          console.error('Error fetching ingredients:', err);
        }
      );
  }

  loadMore() {
    this.currentIndex += this.itemsPerPage;
    const nextItems = this.ingredients.slice(
      this.currentIndex,
      this.currentIndex + this.itemsPerPage
    );
    this.visibleIngredients = this.visibleIngredients.concat(nextItems);
  }
  showTotalProducts = 0;
  clearFilters() {
    this.selectedCategories = [];
    this.selectedIngredient = [];
    this.priceRange = 0;
    this.rangeQuery=""
    // this.selectedSubCategory = null;
    this.getProducts();
  }

  getProducts() {
    this.loadingProducts = true;

    var filter = '';
    if (this.selectedCategories.length > 0) {
      const selectedCategoryIds = this.selectedCategories.map(
        (category: any) => category.CATEGORY_ID
      );

      filter += ' AND CATEGORY_ID IN (' + selectedCategoryIds.join(',') + ')';
    }
    let selectedIngredientIds = [];
    if (this.selectedIngredient.length > 0) {
      selectedIngredientIds = this.selectedIngredient.map(
        (ingredient: any) => ingredient.ID
      );
    }
    this.api
      .getAllProductMaster(
        this.currentPage,
        this.productsPerPage,
        this.sortKey || 'id',
        this.sortDirection || 'desc',
        filter + this.rangeQuery + ' AND IS_VERIENT_AVAILABLE=1 AND STATUS=1',
        selectedIngredientIds?.join(',')
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

    this.getFavoriteProducts();
  }

  varient: any;
  selectedVariantId: any = null;
  price: number = 0;
  selectedVariantStock: any;
  selectedPrice: any;
  totalPrice: any;
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
        let selectedvarientproductId = this.products.findIndex(
          (id) => id.ID === product.ID
        );
        this.products[selectedvarientproductId].CURRENT_STOCK_VARIENT =
          firstVariant.CURRENT_STOCK ? firstVariant.CURRENT_STOCK : 0;
        //  console.log('selectedvarientproductId',this.products[selectedvarientproductId])
      } else {
        const selectedVariant = Variants.find(
          (v) => v.VARIENT_ID === this.selectedVariantMap[product.ID]
        );
        if (selectedVariant) {
          this.unitIdMap[product.ID] = selectedVariant.UNIT_ID;
          let selectedvarientproductId = this.products.findIndex(
            (id) => id.ID === product.ID
          );
          this.products[selectedvarientproductId].CURRENT_STOCK_VARIENT =
            selectedVariant.CURRENT_STOCK ? selectedVariant.CURRENT_STOCK : 0;
          //  this.products[selectedvarientproductId].CURRENT_STOCK_VARIENT=firstVariant.CURRENT_STOCK
        }
      }
      console.log('this.variantMap[product.ID]', this.variantMap[product.ID]);
    }
    // console.log(this.products)
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
      // let selectedvarientproductId=this.products.findIndex(id=> id.ID === productId && )
      //  this.products[selectedvarientproductId].CURRENT_STOCK_VARIENT=firstVariant.CURRENT_STOCK
      console.log(
        'this.unitIdMap[productId]jkkk',
        this.currentStockMap[productId]
      );
      // this
      this.updateTotalPrice();
    }
  }

  onCartDrawerClose(isVisible: boolean) {
    this.viewCart = isVisible;
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

  get totalPages(): number {
    return Math.ceil(this.totalProducts / this.productsPerPage);
  }
  trackByProductId(index: number, product: any): number {
    return product.ID;
  }

  get pagesArray(): number[] {
    return Array(this.totalPages)
      .fill(0)
      .map((x, i) => i + 1);
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

  setCurrentPage(page: number): void {
      if (this.totalPages === 0) {
    return; 
  }

  if (page < 1 || page > this.totalPages) {
    return;
  }
    this.currentPage = page;
    this.getProducts(); // Fetch products for the selected page
    // In a real application, you would fetch products for this page
  }

  // Dummy methods for quick view and add to cart for demonstration
  openQuickView(productId: number): void {
    // console.log(`Open quick view for product ${productId}`);
    // Implement your quick view modal logic here
  }
  showLoginModal() {
    var d: any = document.getElementById('loginmodaltrack') as HTMLElement;
    d.click();
  }

  @ViewChild('closelogin') closelogin!: ElementRef;
  openlogin() {
    this.closelogin.nativeElement.click();
    this.router.navigate(['/login']);
  }
  productsArray: any = [];
  viewCart = false;

  userId = sessionStorage.getItem('userId') || '';
  userID = this.commonFunction.decryptdata(this.userId);
  addToCart(product: any): void {
    // if(!this.userId){
    //    this.showLoginModal()
    // }
    // else{
    //   if(sessionStorage.getItem('userId')){
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
      // Product already exists, increment quantity
      // this.productsArray[existingProductIndex].quantity += 1;
      // this.toastr.success(`${product.name} added to cart`);
      this.cartService.addToCart(product);

      // this.cartService.addToCart(product);
    } else {
      // New product, add with quantity 1
      // this.toastr.success(`${product.name} added to cart`);
      const productWithQuantity = { ...product, quantity: 1 };
      this.productsArray = [...this.productsArray, productWithQuantity];
      // this.cartService.addToCart(product);
      this.cartService.addToCart(product);
    }

    this.viewCart = true;
    // }
    // else{
    //   this.toastr.error('Please login to add items to the cart');
    //   this.router.navigate(['/login']);
    // }
    //   }

    // Optional: Show a toast or notification
    // this.toastr.success(`${product.NAME} added to cart!`);
  }

  removeFromCart(productId: string) {
    // this.productsArray = this.productsArray.filter(
    //   (p: any) => p.ID !== productId
    // );
    this.cartService.removeFromCart(productId);
  }

  onCategoryChange(event: any, category: any) {
    console.log("clickcked")
    if (event.target.checked) {
      // Add only if not already present
      if (!this.selectedCategories.includes(category)) {
        this.selectedCategories.push(category);
      }
    } else {
      // Remove only if it's not the default category (optional safeguard)
      // const isDefault = category === this.categories[0];
      // if (!isDefault) {
      this.selectedCategories = this.selectedCategories.filter(
        (c: any) => c !== category
      );
      // }
    }
    this.getProducts();
    // console.log('Selected Categories:', this.selectedCategories);
  }
  onIngredientChange(event: any, ingredient: any) {
    if (event.target.checked) {
      // Add only if not already present
      if (!this.selectedIngredient.includes(ingredient)) {
        this.selectedIngredient.push(ingredient);
      }
    } else {
      // Remove only if it's not the default ingredient (optional safeguard)
      // const isDefault = ingredient === this.ingredients[0];
      // if (!isDefault) {
      this.selectedIngredient = this.selectedIngredient.filter(
        (i: any) => i !== ingredient
      );
      // }
    }
    this.getProducts();
    // console.log('Selected Ingredients:', this.selectedIngredient);
  }
 @ViewChild('mobileContent', { read: ViewContainerRef }) mobileContent!: ViewContainerRef; 
  @ViewChild('desktopFilters', { static: false }) desktopFilters!: ElementRef;
 @ViewChild('filtersTemplate') filtersTemplate!: TemplateRef<any>;
openMobileFilters(): void {
  if (this.filtersTemplate && this.mobileContent) {
    this.mobileContent.clear(); // Clear previous
    this.mobileContent.createEmbeddedView(this.filtersTemplate); // Render template
   this.isDrawerOpen = true;
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }
}

closeMobileFilters(): void {
  this.isDrawerOpen = false;
  this.renderer.removeStyle(document.body, 'overflow'); // re-enable scroll
}


  onDrawerClick(event: MouseEvent): void {
    const drawer = event.currentTarget as HTMLElement;
    if (event.target === drawer) {
      this.closeMobileFilters();
    }
  }
  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;

    if (value === 'default') {
      // apply default sort logic
      this.sortKey = 'ID';
      this.sortDirection = 'desc';
      this.getProducts();
    } else {
      const [key, direction] = value.split(':');
      if(key === 'RATE'){
        this.sortKey = 'JSON_EXTRACT(VARIENTS, \'$[0].RATE\')';
      }else{
        this.sortKey = key;
      }
      // this.sortKey = key;
      this.sortDirection = direction;
      this.getProducts();
      // example: call your sorting function
      // this.sortProducts(this.sortKey, this.sortDirection);
    }
  }
  priceRange: number = 0;
  rangeQuery = '';
showTooltip = false;
tooltipTimeout: any;

onSliderInput() {
  this.showTooltip = true;

  // Hide tooltip shortly after sliding stops
  if (this.tooltipTimeout) {
    clearTimeout(this.tooltipTimeout);
  }
  this.tooltipTimeout = setTimeout(() => {
    this.showTooltip = false;
  }, 4000);

  this.onPriceChange(); // existing logic
}




onPriceChange() {
  if (this.priceRange != null) {
    this.showTooltip=true
    // Build rangeQuery for API
    this.rangeQuery = ` AND ((IS_VERIENT_AVAILABLE=1 AND JSON_EXTRACT(VARIENTS, '$[0].RATE') <= ${this.priceRange}) OR (IS_VERIENT_AVAILABLE=0 AND RATE <= ${this.priceRange}))`;

    this.getProducts(); // Call API with updated rangeQuery
  } else {
    this.rangeQuery = ''; // Reset filter
    this.getProducts(); // Reload all products
  }
}


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

  isLiked: boolean = false;
  euserID: string = sessionStorage.getItem('userId') || '';
  decyptedsessionKey: any;
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
  addtodetail(product: any) {
    this.productService.setProduct(product);
    sessionStorage.setItem('selectedProduct', JSON.stringify(product));
  }
  // scrollTotop(){
  //    window.scrollTo(0, 0);
  // }
}
