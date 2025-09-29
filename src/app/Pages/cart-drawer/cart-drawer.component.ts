import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CartService } from 'src/app/Service/cart.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';

@Component({
  selector: 'app-cart-drawer',
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CartDrawerComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  isCheckoutVisible = false;
  senddatatoCheckout: any = {};
  constructor(
    private api: ApiServiceService,
    private cartService: CartService,
    private toastr: ToastrService,
    private cd: ChangeDetectorRef
  ) {} // Replace 'any' with the actual type of your API service
  euserID: string = sessionStorage.getItem('userId') || '';
  etoken: string = sessionStorage.getItem('token') || '';
  userID: string = '';
  private commonFunction = new CommonFunctionService(); // Assuming this is a service for common functions
  loadingProducts: boolean = true; // Flag to show loader
  SESSION_KEYS: string = sessionStorage.getItem('SESSION_KEYS') || '';
  ngOnInit() {
    // this.cartItems = [];
    if (this.euserID) {
      this.userID = this.commonFunction.decryptdata(this.euserID);
      // this.token = this.commonFunction.decryptdata(this.etoken);
      // setTimeout(() => {
      // this.cartService.fetchCartFromServer(this.userID, '');
      // this.loadingProducts = false;
      // }, 5000);
      this.cartItems = this.cartService.getCartItems();
      // this.loadingProducts = false;
      // setTimeout(() => {
      // this.cartService.fetchCartFromServer(this.userID, this.etoken);
      this.cartService.cartUpdated$.subscribe((cartItems) => {
        this.cartItems = cartItems;

        // this.toastr.success('Item Added to cart', 'Success')
        this.loadingProducts = false;
        console.log('cart items', this.cartItems);
        this.cd.detectChanges(); // Optional but ensures view update
      });
      // this.loadingProducts = false; // Hide loader after fetching cart items
      // }, 5000);
      // this.cd.detectChanges(); // Optional but ensures view update

      // this.cartItems = this.cartService.getCartItems();
      // this.cartItems = this.cartService.getCartItems();

      // console.log()
    } else {
      this.cartService.fetchCartFromServer(0, this.SESSION_KEYS);
      this.cartService.cartUpdated$.subscribe((cartItems) => {
        this.cartItems = cartItems;
        console.log(this.cartItems);

        // this.toastr.success('Item Added to cart', 'Success')
        this.loadingProducts = false;
        // console.log(this.cartItems);
        this.cd.detectChanges(); // Optional but ensures view update
      });
      // this.loadingProducts = false;
    }
    setTimeout(() => {
      this.loadingProducts = false;
    }, 500);
    // this.cartItems = this.cartService.getCartItems();
  }
  close() {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    // window.location.reload();
  }
  onCheckoutDrawerClose(isVisible: boolean) {
    // console.log('Cart drawer closed:', isVisible);

    this.close();
    this.isCheckoutVisible = isVisible;
  }
  // Sample cart items — you can replace with real data
  @Input() cartItems: any = [];
  // cartItems = [
  //   {
  //     id: 1,
  //     name: 'Ayurvedic Fusion Body Butter',
  //     price: 2100,
  //     quantity: 1,
  //     image:
  //       'https://readdy.ai/api/search-image?query=Ayurvedic%20body%20butter%20cream%20in%20elegant%20glass%20jar%2C%20natural%20ingredients%20visible%2C%20professional%20product%20photography%2C%20soft%20lighting%2C%20minimalist%20style%2C%20clean%20background%2C%20high-end%20cosmetic%20product%20presentation&width=400&height=400&seq=product1&orientation=squarish',
  //   },
  //   {
  //     id: 2,
  //     name: 'Ayurvedic Fusion Face Cream',
  //     price: 2770,
  //     quantity: 1,
  //     image:
  //       'https://readdy.ai/api/search-image?query=Ayurvedic%20face%20cream%20in%20elegant%20glass%20jar%2C%20natural%20ingredients%20visible%2C%20professional%20product%20photography%2C%20soft%20lighting%2C%20minimalist%20style%2C%20clean%20background%2C%20high-end%20cosmetic%20product%20presentation&width=400&height=400&seq=product2&orientation=squarish',
  //   },
  // ];
  producctImageurl: string = this.api.retriveimgUrl + 'productImages/';
  getImageArray(product: any): string {
    try {
      const images = product.Images
        ? JSON.parse(product.Images)
        : JSON.parse(product.PHOTO_URL);
      // console.log(images);
      return images[0].PHOTO_URL ? images[0].PHOTO_URL : images[0];
      // this.producctImageurl+= images[0].PHOTO_URL;
      // return images.map((img: any) => img.PHOTO_URL);
    } catch (e) {
      console.error('Invalid image format', e);
      return '';
    }
  }
  proceedToCheckout() {
    // this.close()
    if (this.quantity > this.varientStock) {
      this.toastr.error('Maximum quantity reached', 'Error');
      return;
    } else {
      this.isCheckoutVisible = true;
      // this.visible=false
      this.senddatatoCheckout = {
        cartDetails: this.cartItems,
        subtotal: this.subtotal,
      };
    }
    // console.log('Proceeding to checkout with data:', this.senddatatoCheckout);
    // Emit the data to the parent component or handle it as needed
  }
  decreaseQty(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      item.QUANTITY--;
      this.cartService.quantityChange$.next(item);
      this.cartService.cartUpdated$.subscribe((cartItems) => {
        this.cartItems = cartItems;

        // this.toastr.success('Item Added to cart', 'Success')
        // this.loadingProducts = false;
        // console.log(this.cartItems);
        this.cd.detectChanges(); // Optional but ensures view update
      });
    }
  }
  varientStock = 0;
  quantity = 0;
  maxQuantity = 0;
  increaseQty(item: any) {
    // const nextQuantity = item.quantity + 1; // simulate the next step
    // const nextTotalSize = item.VERIENT_SIZE * nextQuantity;
    // this.varientStock=item.VERIENT_CURRENT_STOCK
    // if (nextQuantity <= this.varientStock && nextTotalSize <= this.varientStock) {
    item.quantity++;
    item.QUANTITY++;
    this.cartService.quantityChange$.next(item);

    this.cartService.cartUpdated$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      this.cd.detectChanges();
    });
    // } else {
    //   this.toastr.info('Maximum quantity reached', 'Info');
    // }
  }

  @Output() remove = new EventEmitter<string>(); // string = product ID

  deleteItem(productId: any) {
    // const index = this.cartItems.find((item: any) => item.ID == productId.ID);
    // console.log('Deleting item with ID:', productId.ID);
    // if (index === -1) {
    //   console.log(this.cartItems[index])
    //   return;
    // }
    // console.log('Cart items after deletion:', this.cartItems);
    // Emit the product ID to the parent component
    // this.remove.emit(productId);
    // Optionally, you can also call a service method to handle the deletion
    // console.log('Deleting item with ID:', productId);
    // this.remove.emit(productId);
    this.cartService.removeFromCart(productId);
    // this.toastr.info('Item removed from cart', 'Info');
    // this.cartService.fetchCartFromServer(this.userID, this.etoken);
    this.loadingProducts = false; // Hide loader after fetching cart items

    this.cartService.cartUpdated$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      // this.loadingProducts = false;
      // console.log(this.cartItems);
      this.cd.detectChanges(); // Optional but ensures view update
    });
    // console.log('Item removed from cart:', productId
  }

  get subtotal() {
    return this.cartItems?.reduce(
      (sum: any, item: any) =>
        sum + (item.RATE ? item.RATE : item.VERIENT_RATE) * item.quantity,
      0
    );
  }

  onOrderPlaced(success: boolean) {
    if (success) {
      // console.log('Order has been successfully placed!');
      // Here you would typically:
      // 1. Navigate to an order confirmation page.
      // 2. Clear the cart (if not already done by backend).
      // 3. Potentially show a global success message.
      this.isCheckoutVisible = success; // Hide the address manager section
      this.close(); // Close the cart drawer
      // Example: this.router.navigate(['/order-success']);
      this.toastr.success('Order has been successfully placed!', 'Success');
    } else {
      this.isCheckoutVisible = success; // Hide the address manager section
      this.close(); // Close the cart drawer
      this.toastr.error('Order placement failed or was cancelled.');
      // Handle failure if needed, though the address manager already shows toasts for errors.
    }
    // this.isCheckoutVisible = success;
  }
}
