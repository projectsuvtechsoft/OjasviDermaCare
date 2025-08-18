import { Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import { ApiServiceService } from './api-service.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonFunctionService } from './CommonFunctionService';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class CartService {
  commonapikey = 'VnEgKy9sBEXscwr4zs7J18aSjW0YA4fY';
  commonapplicationkey = 'awlcQRwoZxAJQm7b';
  // private cartCountSource = new BehaviorSubject<number>(0);
  // cartCount$ = this.cartCountSource.asObservable();

  // private cartDetailsSource = new BehaviorSubject<any[]>([]);
  // cartDetails$ = this.cartDetailsSource.asObservable();

  // constructor(private apiService: ApiServiceService) {}

  // updateCartCount(count: number) {
  //   this.cartCountSource.next(count);
  // }

  // updateCartDetails(details: any[]) {
  //   this.cartDetailsSource.next(details);
  // }

  // // ⭐️ COMMON METHOD
  // fetchAndUpdateCartDetails(userID: number) {
  //   this.apiService.getCartDetails(userID).subscribe(
  //     (data: any) => {
  //       if (data['code'] === 200) {
  //         const cartDetails = data['data']['CART_DETAILS'];
  //         this.updateCartDetails(cartDetails);
  //         this.updateCartCount(cartDetails.length);
  //       } else {
  //         this.updateCartDetails([]);
  //         this.updateCartCount(0);
  //       }
  //     },
  //     (error) => {
  //       console.error('Error fetching cart details:', error);
  //       this.updateCartDetails([]);
  //       this.updateCartCount(0);
  //     }
  //   );
  // }

  private cartItems: any[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();
  private cartUpdated = new Subject<any[]>(); // Emits new cart when updated
  cartUpdated$ = this.cartUpdated.asObservable();
  private sectionChangeSubject = new Subject<string>();
  sectionChange$ = this.sectionChangeSubject.asObservable();

  showSection(id: string) {
    this.sectionChangeSubject.next(id);
  }

  private commonFunction = new CommonFunctionService(); // Assuming this is a service for common functions
  constructor(
    private http: HttpClient,
    private api: ApiServiceService,
    private toastr: ToastrService
  ) {
    this.quantityChange$
      .pipe(debounceTime(800)) // Wait 500ms after last change
      .subscribe((item) => {
        // this.updateQuantityApi(item);
        // console.log(item);
        this.currentProduct.QUANTITY = item.QUANTITY
          ? item.QUANTITY
          : item.quantity;
        this.currentProduct.CART_ID=item.CART_ID;
        this.currentProduct.CART_ITEM_ID=item.ID;
        this.updateCartToServer();
      });
  }
  euserID: string = sessionStorage.getItem('userId') || '';
  etoken: string = sessionStorage.getItem('token') || '';
  userID: any;
  token: any;
  quantityChange$ = new Subject<any>();
  ngOnInit() {
    if (this.euserID && this.etoken) {
      this.userID = this.commonFunction.decryptdata(this.euserID);
      // this.token = this.commonFunction.decryptdata(this.etoken);
    }
  }
  fetchCartFromServer(userId: any, token: string): void {
    // let data={
    //   SESSION_KEY:token,
    //   CUSTOMER_ID:userId
    // }
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    let decypted = this.commonFunction.decryptdata(sessionKey);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.etoken,
    });
    if (userId) {
      decypted = '';
    }
    this.http
      .post<any[]>(
        this.api.baseUrl + 'web/cartDetails/get',
        {
          SESSION_KEY: decypted,
          CUSTOMER_ID: userId,
        },
        {
          headers,
        }
      )
      .subscribe(
        (cartData: any) => {
          // console.log(cartData.cartItemDetails)
          if (!cartData?.data || cartData.data.length === 0) {
            // this.toastr.info('Cart is empty or not found');
          } else {
            this.cartItems = cartData.cartItemDetails.map((item: any) => ({
              ...item,
              quantity: item.QUANTITY || 1,
            }));
          }
          this.cartUpdated.next(this.cartItems);
          this.updateCartCount();
        },
        (err) => this.toastr.error('Error fetching cart:', err)
      );
  }

  getCartItems(): any[] {
    return this.cartItems;
  }
  currentProduct: any = {};
  addToCart(product: any): void {
    // console.log(product);

    const index = this.cartItems.findIndex((p) => p.ID === product.ID);
    if (index !== -1) {
      this.cartItems[index].quantity = this.cartItems[index].QUANTITY
        ? this.cartItems[index].QUANTITY
        : this.cartItems[index].quantity;
      this.currentProduct = this.cartItems[index];
    } else {
      this.currentProduct = { ...product, quantity: 1 };
      this.cartItems.push({ ...product, quantity: 1 });
    }

    this.updateCartCount();
    this.saveCartToServer(); // 🔄 Sync after change
    // setTimeout(() => {
    // }, 5000);
    // this.fetchCartFromServer(this.userID, this.etoken);
  }

  removeFromCart(productId: any): void {
    const index = this.cartItems.findIndex((p) => p.ID === productId.ID);
    // console.log(this.cartItems[index],productId);

    if (index !== -1) {
      // }
      this.currentProduct = this.cartItems[index];
      if (this.currentProduct.CART_ID && this.currentProduct.CART_ITEM_ID) {
        this.removeItemforServer();
        this.cartUpdated.next(this.cartItems);
      } else {
        this.cartItems.splice(index, 1);
        this.currentProduct.CART_ID = productId.CART_ID;
        this.currentProduct.CART_ITEM_ID = productId.CART_ITEM_ID
          ? productId.CART_ITEM_ID
          : productId.ID;
        this.removeItemforServer();
      }
      // console.log(this.currentProduct);

      // if (this.currentProduct.CART_ID && this.currentProduct.CART_ITEM_ID) {
      this.updateCartCount();
      // 🔄 Sync after change
    }
  }

  private updateCartCount(): void {
    const total = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    this.cartCountSubject.next(total);
  }

  private saveCartToServer(): void {
    this.userID = this.commonFunction.decryptdata(this.euserID);
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    let decypted = this.commonFunction.decryptdata(sessionKey);
    if (this.userID) {
      decypted = '';
    }
    // console.log(this.currentProduct);

    const payload = {
      // userId: userId,
      // items: this.cartItems.map((item) => ({
      //   // ID: item.ID,
      CUSTOMER_ID: this.userID ? this.userID : 0,
      SESSION_KEY: decypted,
      CLIENT_ID: 1,
      PRODUCT_ID: this.currentProduct.ID,
      VERIENT_ID: this.currentProduct.VERIENT_ID,
      QUANTITY: this.currentProduct.QUANTITY
        ? this.currentProduct.QUANTITY
        : this.currentProduct.quantity,
      SIZE: this.currentProduct.SIZE,
      COUNTRY_ID: 0,
      UNIT_ID: this.currentProduct.UNIT_ID,
      CART_ID:this.currentProduct.CART_ID?this.currentProduct.CART_ID:null,
      CART_ITEM_ID:this.currentProduct.CART_ITEM_ID?this.currentProduct.CART_ITEM_ID:null,
      // })),
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.etoken,
    });
    this.http
      .post(this.api.baseUrl + 'web/cart/addToCart', payload, { headers })
      .subscribe(
        (response: any) => {
          if (response.code === 200) {
            this.toastr.success('Cart updated successfully');
            this.fetchCartFromServer(this.userID, this.etoken);
          } else {
            this.toastr.error('Failed to update cart:', '');
          }
        },
        (error) => {
          this.toastr.error(
            'Something went wrong please try again later',
            error
          );
        }
      );
  }
  private updateCartToServer(): void {
    this.userID = this.commonFunction.decryptdata(this.euserID);
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    let decypted = this.commonFunction.decryptdata(sessionKey);
    if (this.userID) {
      decypted = '';
    }
    // console.log(this.currentProduct);

    const payload = {
      // userId: userId,
      // items: this.cartItems.map((item) => ({
      //   // ID: item.ID,
      CUSTOMER_ID: this.userID ? this.userID : 0,
      SESSION_KEY: decypted,
      CLIENT_ID: 1,
      PRODUCT_ID: this.currentProduct.ID,
      VERIENT_ID: this.currentProduct.VERIENT_ID,
      QUANTITY: this.currentProduct.QUANTITY
        ? this.currentProduct.QUANTITY
        : this.currentProduct.quantity,
      SIZE: this.currentProduct.SIZE,
      COUNTRY_ID: 0,
      UNIT_ID: this.currentProduct.UNIT_ID,
      CART_ID:this.currentProduct.CART_ID?this.currentProduct.CART_ID:null,
      CART_ITEM_ID:this.currentProduct.CART_ITEM_ID?this.currentProduct.CART_ITEM_ID:null,
      // })),
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.etoken,
    });
    this.http
      .post(this.api.baseUrl + 'web/cart/updateQuantity', payload, { headers })
      .subscribe(
        (response: any) => {
          if (response.code === 200) {
            this.toastr.success('Cart updated successfully');
            this.fetchCartFromServer(this.userID, this.etoken);
          } else {
            this.toastr.error('Failed to update cart:', '');
          }
        },
        (error) => {
          this.toastr.error(
            'Something went wrong please try again later',
            error
          );
        }
      );
  }
  private removeItemforServer(): void {
    this.userID = this.commonFunction.decryptdata(this.euserID);
    // if (!this.userID) return;

    const payload = {
      // userId: userId,
      // items: this.cartItems.map((item) => ({
      //   // ID: item.ID,
      CART_ID: this.currentProduct.CART_ID,
      CART_ITEM_ID: this.currentProduct.ID,
      // CUSTOMER_ID: this.userID,
      // SESSION_KEY: this.etoken,
      // CLIENT_ID: 1,
      // PRODUCT_ID: this.currentProduct.ID,
      // VERIENT_ID: this.currentProduct.VERIENT_ID,
      // QUANTITY: this.currentProduct.quantity,
      // SIZE: this.currentProduct.SIZE,
      // })),
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.etoken,
    });
    this.http
      .post(this.api.baseUrl + 'web/removeItem', payload, { headers })
      .subscribe(
        (response: any) => {
          if (response.code === 200) {
            this.toastr.info('Cart item removed successfully');
            this.fetchCartFromServer(this.userID, this.etoken); // Refresh cart after removal
          } else {
            this.toastr.error('Failed to update cart:', '');
          }
        },
        (error) => {
          this.toastr.error(
            'Something went wrong please try again later',
            error
          );
        }
      );
  }
  //     addToCart(product: any): void {
  //   const index = this.cartItems.findIndex((p) => p.ID === product.ID);

  //   if (index !== -1) {
  //     const existingProduct = this.cartItems[index];

  //     // Use the provided quantity if available, otherwise retain existing quantity
  //     const updatedQuantity = product.quantity != null ? product.quantity : existingProduct.quantity;

  //     this.cartItems[index] = {
  //       ...existingProduct,
  //       ...product,
  //       quantity: updatedQuantity
  //     };

  //     this.currentProduct = this.cartItems[index];
  //   } else {
  //     // Default to quantity 1 if not passed
  //     const newProduct = {
  //       ...product,
  //       quantity: product.quantity != null ? product.quantity : 1
  //     };

  //     this.cartItems.push(newProduct);
  //     this.currentProduct = newProduct;
  //   }

  //   this.updateCartCount();
  //   this.saveCartToServer(); // 🔄 Sync
  // }
}
