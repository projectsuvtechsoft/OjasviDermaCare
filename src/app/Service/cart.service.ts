import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ApiServiceService } from './api-service.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonFunctionService } from './CommonFunctionService';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class CartService {
  //Testing
  commonapikey = 'VnEgKy9sBEXscwr4zs7J18aSjW0YA4fY';
  commonapplicationkey = 'awlcQRwoZxAJQm7b';

  //Live
  // commonapikey = 'BEZhBltbyzL11SPV9YFdH4YgYUKZ6Fla';
  // commonapplicationkey = '26lLNSmaKlcFziHH';
  // commonapikey = 'BEZhBltbyzL11SPV9YFdH4YgYUKZ6Fla';
  // commonapplicationkey = '26lLNSmaKlcFziHH';
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

  cartItems: any[] = [];
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();
  cartUpdated = new Subject<any[]>(); // Emits new cart when updated
  cartUpdated$ = this.cartUpdated.asObservable();
  private sectionChangeSubject = new Subject<string>();
  sectionChange$ = this.sectionChangeSubject.asObservable();
  loaderUpdate = new Subject<boolean>();
  loaderUpdate$ = this.loaderUpdate.asObservable();
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
        this.currentProduct.CART_ID = item.CART_ID;
        this.currentProduct.CART_ITEM_ID = item.ID;
        this.currentProduct.VERIENT_ID = item.VERIENT_ID;
        this.currentProduct.VERIENT_SIZE = item.VERIENT_SIZE;
        this.currentProduct.SIZE = item.SIZE;
        this.currentProduct.PRODUCT_ID = item.PRODUCT_ID;
        this.currentProduct.PRODUCT_UNIT_ID = item.VARIENT_UNIT_ID;
        this.currentProduct.UNIT_ID=item.VARIENT_UNIT_ID ?? item.UNIT_ID ?? item.PRODUCT_UNIT_ID
        this.updateCartToServer();
      });
  }
  euserID: any = sessionStorage.getItem('userId') || 0;
  etoken: any = sessionStorage.getItem('token') || '';
  userID: any;
  token: any;
  quantityChange$ = new Subject<any>();
  ngOnInit() {
    this.euserID = sessionStorage.getItem('userId') || 0;
    this.etoken = sessionStorage.getItem('token');
    // console.log(
    //   this.commonFunction.decryptdata(this.euserID),
    //   this.commonFunction.decryptdata(this.etoken)
    // );

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
          this.cartItems = [];
          this.cartCountSubject.next(0);
          this.loaderUpdate.next(true)
          if (!cartData?.data || cartData.data.length === 0) {
            // this.toastr.info('Cart is empty or not found');
          } else {
            var PACKAGING_CHARGES = cartData.data[0]['PACKAGING_CHARGES'];
            var DELIVERY_CHARGES = cartData.data[0]['ADDON_AMOUNT'];
            var TOTAL_PRICE = cartData.data[0]['TOTAL_PRICE'];
            var NET_AMOUNT = cartData.data[0]['NET_AMOUNT'];
            // console.log(cartData);
            var DATA = cartData.data[0];
            this.cartItems = cartData.cartItemDetails.map((item: any) => {
              const category = cartData.categoryDetails?.find(
                (cat: any) => cat.NAME === item.PRODUCT_NAME
              );

              return {
                ...item,
                CATEGORY_NAME: category ? category.CATEGORY_NAME : 'Unknown',
                quantity: item.QUANTITY || 1,
                PACKAGING_CHARGES,
                DELIVERY_CHARGES,
                NET_AMOUNT,
                TOTAL_PRICE,
                DATA,
              };
            });
            // console.log(this.cartItems);
            this.cartUpdated.next(this.cartItems);
            this.loaderUpdate.next(false)
            this.updateCartCount();
          }
        },
        (err) => this.toastr.error('Error fetching cart:', '')
      );
  }

  getCartItems(): any[] {
    return this.cartItems;
  }
  currentProduct: any = {};

  addToCart(product: any): void {
    this.loaderUpdate.next(true);
    // console.log(product);
    // if()
    this.euserID = sessionStorage.getItem('userId') || 0;
    this.userID = this.commonFunction.decryptdata(this.euserID) || 0;
    if (this.userID) {
      this.currentProduct.CUSTOMER_ID = this.userID;
      this.currentProduct.SESSION_KEY = '';
    }
    const index = this.cartItems.findIndex((p) => p.ID === product.ID);
    if (index !== -1) {
      this.cartItems[index].CUSTOMER_ID = this.userID;
      this.cartItems[index].quantity = this.cartItems[index].QUANTITY
        ? this.cartItems[index].QUANTITY
        : this.cartItems[index].quantity;
      this.currentProduct = this.cartItems[index];
      this.currentProduct.CUSTOMER_ID = this.userID;
    } else {
      this.currentProduct = {
        ...product,
        quantity: 1,
        CUSTOMER_ID: this.userID,
      };
      this.cartItems.push({
        ...product,
        quantity: 1,
        CUSTOMER_ID: this.userID,
      });
    }

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
        // this.cartUpdated.next(this.cartItems);
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
  removeFromCartnotoast(productId: any): void {
    const sessionCartItemsStr = sessionStorage.getItem('sessionCart');
    const sessionCartItems = sessionCartItemsStr
      ? JSON.parse(sessionCartItemsStr)
      : [];
    const index = sessionCartItems.findIndex((p: any) => p.ID === productId.ID);
    // console.log(this.cartItems[index],productId);

    if (index !== -1) {
      // }
      this.currentProduct = sessionCartItems[index];
      if (this.currentProduct.CART_ID && this.currentProduct.CART_ITEM_ID) {
        this.removeItemforServerwithouttoast();
        this.cartUpdated.next(this.cartItems);
      } else {
        sessionCartItems.splice(index, 1);
        this.currentProduct.CART_ID = productId.CART_ID;
        this.currentProduct.CART_ITEM_ID = productId.CART_ITEM_ID
          ? productId.CART_ITEM_ID
          : productId.ID;
        this.removeItemforServerwithouttoast();
      }
      // console.log(this.currentProduct);

      // if (this.currentProduct.CART_ID && this.currentProduct.CART_ITEM_ID) {
      this.updateCartCount();
      // 🔄 Sync after change
    }
  }
  updateCartCount(): void {
    // Create a map to store unique items by ID
    const uniqueItemsMap = new Map<number | string, any>();
    // console.log(this.cartItems);
    this.cartItems.forEach((item) => {
      if (!uniqueItemsMap.has(item.ID)) {
        uniqueItemsMap.set(item.ID, item);
      }
    });

    // Count the number of unique items
    const totalUniqueItems = uniqueItemsMap.size;
    // console.log(totalUniqueItems,'totalUniqueItems')
    this.cartCountSubject.next(totalUniqueItems);
  }

  private saveCartToServer(): void {
    this.euserID = sessionStorage.getItem('userId') || 0;
    // this.etoken = sessionStorage.getItem('token') || '';
    this.userID = this.commonFunction.decryptdata(this.euserID) || 0;
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
      CUSTOMER_ID: this.userID ? this.userID : this.currentProduct.CUSTOMER_ID,
      SESSION_KEY: decypted,
      CLIENT_ID: 1,
      PRODUCT_ID: this.currentProduct.ID,
      VERIENT_ID: this.currentProduct.VERIENT_ID ?? 0,
      QUANTITY: this.currentProduct.QUANTITY
        ? this.currentProduct.QUANTITY
        : this.currentProduct.quantity,
      SIZE: this.currentProduct.SIZE,
      COUNTRY_NAME: sessionStorage.getItem('address'),
      PINCODE: sessionStorage.getItem('pincode'),
      UNIT_ID: this.currentProduct.UNIT_ID,
      CART_ID: this.currentProduct.CART_ID ? this.currentProduct.CART_ID : null,
      CART_ITEM_ID: this.currentProduct.CART_ITEM_ID
        ? this.currentProduct.CART_ITEM_ID
        : null,
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
            this.toastr.success(`${this.currentProduct.NAME} added to cart`);
            this.loaderUpdate.next(false);
            this.updateCartCount();
            // this.toastr.success('Cart updated successfully');
            this.fetchCartFromServer(this.userID, this.etoken);
          } else if (response.code === 400) {
            this.toastr.error('Not Enough Stock');
            this.fetchCartFromServer(this.userID, this.etoken);
            this.loaderUpdate.next(false);
          } else {
            this.fetchCartFromServer(this.userID, this.etoken);
            this.loaderUpdate.next(false);
            this.toastr.error(`Failed to add ${this.currentProduct.NAME}`, '');
          }
        },
        (error) => {
          this.toastr.error(
            'Something went wrong please try again later',
            error
          );
          this.loaderUpdate.next(false);
        }
      );
  }

  updateCartToServer(): void {
    this.euserID = sessionStorage.getItem('userId') || 0;
    // this.etoken = sessionStorage.getItem('token') || '';
    this.userID = this.commonFunction.decryptdata(this.euserID) || 0;
    let sessionKey = sessionStorage.getItem('SESSION_KEYS') || '';
    let decypted = this.commonFunction.decryptdata(sessionKey);
    if (this.userID) {
      decypted = '';
    }
    // console.log(this.currentProduct);
    this.loaderUpdate.next(true)
    const payload = {
      // userId: userId,
      // items: this.cartItems.map((item) => ({
      //   // ID: item.ID,
      CUSTOMER_ID: this.userID ? this.userID : 0,
      SESSION_KEY: decypted,
      CLIENT_ID: 1,
      PRODUCT_ID: this.currentProduct.PRODUCT_ID,
      VERIENT_ID: this.currentProduct.VERIENT_ID,
      QUANTITY: this.currentProduct.QUANTITY
        ? this.currentProduct.QUANTITY
        : this.currentProduct.quantity,
      SIZE: this.currentProduct.VERIENT_SIZE,
      COUNTRY_NAME: sessionStorage.getItem('address'),
      PINCODE: sessionStorage.getItem('pincode'),
      UNIT_ID: this.currentProduct.VARIENT_UNIT_ID ?? this.currentProduct.UNIT_ID ?? this.currentProduct.PRODUCT_UNIT_ID,
      CART_ID: this.currentProduct.CART_ID ? this.currentProduct.CART_ID : null,
      CART_ITEM_ID: this.currentProduct.CART_ITEM_ID
        ? this.currentProduct.CART_ITEM_ID
        : null,
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
          } else if (response.code === 400) {
            this.loaderUpdate.next(false)
            this.toastr.error('Not Enough Stock');
            // this.fetchCartFromServer(this.userID, this.etoken);
          } else {
            this.loaderUpdate.next(false)
            this.toastr.error('Failed to update cart:', '');
          }
        },
        (error) => {
            this.loaderUpdate.next(false)
          this.toastr.error(
            'Something went wrong please try again later',
            error
          );
        }
      );
  }
  updateCartToServewithouttoastrr(): void {
    this.euserID = sessionStorage.getItem('userId') || 0;
    // this.etoken = sessionStorage.getItem('token') || '';
    this.userID = this.commonFunction.decryptdata(this.euserID) || 0;
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
      PRODUCT_ID: this.currentProduct.PRODUCT_ID,
      VERIENT_ID: this.currentProduct.VERIENT_ID,
      QUANTITY: this.currentProduct.QUANTITY
        ? this.currentProduct.QUANTITY
        : this.currentProduct.quantity,
      SIZE: this.currentProduct.VERIENT_SIZE,
      COUNTRY_NAME: sessionStorage.getItem('address'),
      PINCODE: sessionStorage.getItem('pincode'),
      UNIT_ID: this.currentProduct.VARIENT_UNIT_ID ?? this.currentProduct.UNIT_ID ?? this.currentProduct.PRODUCT_UNIT_ID,
      CART_ID: this.currentProduct.CART_ID ? this.currentProduct.CART_ID : null,
      CART_ITEM_ID: this.currentProduct.CART_ITEM_ID
        ? this.currentProduct.CART_ITEM_ID
        : null,
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
            // this.toastr.success('Cart updated successfully');
            this.fetchCartFromServer(this.userID, this.etoken);
          } else if (response.code === 400) {
            // this.toastr.error('Not Enough Stock');
            // this.fetchCartFromServer(this.userID, this.etoken);
          } else {
            // this.toastr.error('Failed to update cart:', '');
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
  private removeItemforServerwithouttoast(): void {
    const encryptedId=sessionStorage.getItem('userId')
    const decryptedId=encryptedId?this.commonFunction.decryptdata(encryptedId):''
    // this.userID = this.commonFunction.decryptdata(this.euserID);
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
            // this.toastr.info('Cart item removed successfully');
            sessionStorage.removeItem('sessionCart');
            this.fetchCartFromServer(decryptedId, this.etoken);
             // Refresh cart after removal
          } else {
            // this.toastr.error('Failed to update cart:', '');
          }
        },
        (error) => {
          // this.toastr.error(
          //   'Something went wrong please try again later',
          //   error
          // );
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
  // Alternative approach using Promise or simple tap
  migrateSessionCartToCustomer(
    sessionCartItems: any[],
    customerId: string
  ): Observable<any> {
    if (!sessionCartItems || sessionCartItems.length === 0) {
      return new Observable((observer) => {
        observer.next({
          success: true,
          // message: 'No items to migrate',
          migratedCount: 0,
        });
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      applicationkey: this.commonapplicationkey,
      apikey: this.commonapikey,
      token: this.etoken,
    });

    // Migrate items sequentially to ensure same CART_ID
    return this.migrateItemsSequentially(sessionCartItems, customerId, headers);
  }

  /**
   * Migrate items sequentially to ensure they all get the same CART_ID
   */
  private migrateItemsSequentially(
    sessionCartItems: any[],
    customerId: string,
    headers: HttpHeaders
  ): Observable<any> {
    if (sessionCartItems.length === 0) {
      return of({
        success: true,
        // message: 'No items to migrate',
        migratedCount: 0,
      });
    }

    // Prepare first item payload
    const firstItemPayload = {
      CUSTOMER_ID: customerId,
      SESSION_KEY: '',
      CLIENT_ID: 1,
      PRODUCT_ID: sessionCartItems[0].PRODUCT_ID,
      VERIENT_ID: sessionCartItems[0].VERIENT_ID ?? 0,
      QUANTITY:
        sessionCartItems[0].QUANTITY || sessionCartItems[0].quantity || 1,
      SIZE: sessionCartItems[0].SIZE || sessionCartItems[0].VERIENT_SIZE,
      COUNTRY_NAME: sessionStorage.getItem('address'),
      PINCODE: sessionStorage.getItem('pincode'),
      UNIT_ID:
        sessionCartItems[0].VARIENT_UNIT_ID || sessionCartItems[0].VARIENT_UNIT_ID,
    };

    // console.log('Adding first item to create cart:', firstItemPayload);

    // Add first item - this will create a new CART_ID
    return this.http
      .post(this.api.baseUrl + 'web/cart/addToCart', firstItemPayload, {
        headers,
      })
      .pipe(
        switchMap((firstResponse: any) => {
          const cartId = firstResponse.CART_ID;
          // console.log('Created cart with ID:', cartId);

          // If only one item, we're done
          if (sessionCartItems.length === 1) {
            return of({
              success: true,
              // message: 'Successfully migrated 1 item to your cart',
              migratedCount: 1,
              cartId: cartId,
            }).pipe(
              tap(() => {
                // console.log('Refreshing cart from server...');
                this.fetchCartFromServer(customerId, this.etoken);
              })
            );
          }

          // Add remaining items with the same CART_ID
          const remainingOperations = sessionCartItems
            .slice(1)
            .map((item, index) => {
              const payload = {
                CUSTOMER_ID: customerId,
                SESSION_KEY: '',
                CLIENT_ID: 1,
                PRODUCT_ID: item.PRODUCT_ID,
                VERIENT_ID: item.VERIENT_ID ?? 0,
                QUANTITY: item.QUANTITY || item.quantity || 1,
                SIZE: item.SIZE || item.VERIENT_SIZE,
                COUNTRY_NAME: sessionStorage.getItem('address'),
                PINCODE: sessionStorage.getItem('pincode'),
                UNIT_ID: item.VARIENT_UNIT_ID || item.VARIENT_UNIT_ID,
                CART_ID: cartId, // ✅ Use the same CART_ID from first item
              };

              // console.log(`Adding item ${index + 2} with CART_ID:`, cartId);

              return this.http.post(
                this.api.baseUrl + 'web/cart/addToCart',
                payload,
                { headers }
              );
            });

          // Execute all remaining additions in parallel
          return forkJoin(remainingOperations).pipe(
            map((results) => ({
              success: true,
              // message: `Successfully migrated ${sessionCartItems.length} items to your cart`,
              migratedCount: sessionCartItems.length,
              cartId: cartId,
            })),
            tap(() => {
              // console.log('All items migrated. Refreshing cart from server...');
              this.fetchCartFromServer(customerId, this.etoken);
            }),
            catchError((error) => {
              // console.error('Error adding remaining items:', error);
              return of({
                // success: true, // First item was added successfully
                // message: `Partially migrated ${sessionCartItems.length} items. Please refresh.`,
                migratedCount: 1,
                cartId: cartId,
                partialError: true,
              });
            })
          );
        }),
        catchError((error) => {
          // console.error('Migration error on first item:', error);
          return of({
            success: false,
            // message: 'Failed to migrate cart items',
            migratedCount: 0,
            error: error,
          });
        })
      );
  }
}
