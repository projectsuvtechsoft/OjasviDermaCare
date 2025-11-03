import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CartService } from 'src/app/Service/cart.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { LoaderService } from 'src/app/Service/loader.service';
import { ModalService } from 'src/app/Service/modal.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent {
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
  ) {}
    public commonFunction = new CommonFunctionService();
  producctImageurl: string = this.api.retriveimgUrl + 'productImages/';
  
  ngOnInit(): void {
    this.getFavoriteProducts();
  }

   getImageArray(product: any): string[] {
    try {
      const images = JSON.parse(product.Images);
      return images.map((img: any) => img.PHOTO_URL);
    } catch (e) {
      console.error('Invalid image format', e);
      return [];
    }
  }

totalFavourites:any;
FavouritesData:any;
euserID: string = sessionStorage.getItem('userId') || '';
decyptedsessionKey:any;
userID:any;
favoriteProductIds:any[]=[];
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
        this.favoriteProductIds = this.FavouritesData.map((item: any) => item.PRODUCT_ID);
        localStorage.setItem('totalFavourites', this.totalFavourites);
        window.dispatchEvent(new Event('favouritesUpdated'));
       if(this.favoriteProductIds.length>0){
         this.getProducts();
       }

        this.products = this.products.map((product: any) => ({
          ...product,
          isLiked: this.favoriteProductIds.includes(product.ID) 
        }));
        this.products.forEach((product: any) => {
         });
        
      }
    },
    (err) => {
      // console.log(err);
    }
  );
}


products:any
loadingProducts = false;
show=false;
varient:any;
selectedVariantId:any;
selectedPrice:any;
totalProducts:any;
showTotalProducts:any;

getvarientDetails(propertyId: any) {
  this.show = true;
  this.api.getAllVarient(
    1,
    10,
    'id',
    'desc',
    "AND STATUS = 1 AND PRODUCT_ID =" + propertyId,
  ).subscribe((data) => {
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
    if(this.favoriteProductIds.length>0){
      var filter =` AND ID IN (${this.favoriteProductIds}) AND IS_VERIENT_AVAILABLE = 1`
    }else{
      var filter =''
    }

    this.api
      .getAllProductMaster(
       this.currentPage,
        this.productsPerPage,
        this.sortKey || 'id',
        this.sortDirection || 'desc',
      filter
       ,
       ""
      )
      .subscribe(
        (res: any) => {
          if (res && res.data && Array.isArray(res.data)) {
            this.products = res.data;
            this.loadingProducts = false;
            this.totalProducts = res.count;
            this.showTotalProducts = res.count;
         this.products = this.products.map((product: any) => ({
          ...product,
          isLiked: this.favoriteProductIds.includes(product.ID) 
        }));
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
      const selectedVariant = variants.find(v => v.VARIENT_ID === selectedVariantId);

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
  productsPerPage = 8;
  sortKey: string | null = 'ID';
  sortDirection: string | null = 'desc';

setCurrentPage(page: number): void {
  if (this.totalPages === 0) {
    return; 
  }

  if (page < 1 || page > this.totalPages) {
    return;
  }

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

  //   get pagesArray(): number[] {
  //   return Array(this.totalPages)
  //     .fill(0)
  //     .map((x, i) => i + 1);
  // }
  get pagesArray(): number[] {
  const totalPages = Number(this.totalPages);

  if (!Number.isFinite(totalPages) || totalPages < 1) {
    return [];
  }

  return Array(totalPages)
    .fill(0)
    .map((_, i) => i + 1);
}

    get totalPages(): number {
    return Math.ceil(this.totalProducts / this.productsPerPage);
  }

price: number = 0; 
selectedVariantStock:any;
totalPrice:any
quantity = 1;
variantMap: { [key: number]: any[] } = {}; 
selectedVariantMap: { [key: number]: number } = {}; 
variantStockMap: { [key: number]: number } = {}; 
unitIdMap: { [key: number]: number } = {}; 

unitId:any;
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
    let Variants = variants?.filter((v: any) => v.STATUS === true || v.STATUS === 1) || [];
    this.variantMap[product.ID] = Variants;
    if (!this.selectedVariantMap[product.ID]) {
      const firstVariant = variants[0];
      this.selectedVariantMap[product.ID] = firstVariant.VARIENT_ID;
      this.variantRateMap[product.ID] = firstVariant.RATE || 0;
      this.variantStockMap[product.ID] = firstVariant.OPENING_STOCK || 0;
       this.unitIdMap[product.ID] = firstVariant.UNIT_ID;
       
    }else {
    const selectedVariant = Variants.find(v => v.VARIENT_ID === this.selectedVariantMap[product.ID]);
    if (selectedVariant) {
      this.unitIdMap[product.ID] = selectedVariant.UNIT_ID;
    }
  }
  }
}

change(selectedId: string, productId: number): void {
  const variants = this.variantMap[productId] || [];
  const selected = variants.find((v: any) => v.VARIENT_ID === Number(selectedId));

  if (selected) {
    this.selectedVariantMap[productId] = selected.VARIENT_ID;
    this.variantRateMap[productId] = selected.RATE || 0; 
    this.variantStockMap[productId] = selected.OPENING_STOCK || 0;
    this.unitIdMap[productId]= selected.UNIT_ID;
    this.updateTotalPrice();
  }
}


}
