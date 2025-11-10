import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from 'src/app/Service/api-service.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css'],
})
export class OrderDetailsComponent {
 orderId!: any;
cartDetails: any = {};
orderStatus = 'A';
selectedAddress: any;
photoURL = this.api.retriveimgUrl + 'productImages/';
imageIndices: { [productId: string]: number } = {};
showPaymentModal = false;
isLoading = true; // Add loader state
isDownloading = false;
subtotal = 0;

constructor(
  private route: ActivatedRoute,
  private router: Router,
  private api: ApiServiceService
) {}

ngOnInit() {
  // this.orderId = this.route.snapshot.paramMap.get('orderId')!;
    this.route.queryParamMap.subscribe(params => {
      this.orderId = params.get('orderId') || 0;
      // console.log('Order ID:', this.orderId);
      // You can now fetch your order details using this.orderId
    });
  this.photoURL = this.api.retriveimgUrl + 'productImages/';
  this.fetchOrderDetails();
}

initImageIndex(productId: number) {
  if (!(productId in this.imageIndices)) {
    this.imageIndices[productId] = 0;
  }
}

convertStringtoArray(str: string) {
  return JSON.parse(str);
}

fetchOrderDetails() {
  this.isLoading = true; // Start loading
  this.api.getOpenOrders(this.orderId).subscribe(
    (res) => {
      if (res.code == 200) {
        this.cartDetails.cartDetails = res.data;
        this.orderStatus = res.data[0].CURRENT_STAGE;
        this.calculateSubtotal();
      } else {
        // this.toastr.error('Failed to get details','')
      }
      this.isLoading = false; // Stop loading
    },
    (error) => {
      console.error('Error fetching order details:', error);
      this.isLoading = false; // Stop loading on error
    }
  );
}

getImageArray(item: any) {
  return item?.PHOTO_URL?.split(',') || [];
}

isStatusComplete(current: string, check: string) {
  const orderFlow = ['A', 'BP', 'SP', 'D', 'DD'];
  return orderFlow.indexOf(current) >= orderFlow.indexOf(check);
}

isStatusPending(current: string, check: string) {
  const orderFlow = ['A', 'BP', 'SP', 'D', 'DD'];
  return orderFlow.indexOf(current) < orderFlow.indexOf(check);
}

downloadInvoice() {
  this.isDownloading = true;

  const fileUrl =
    this.api.retriveimgUrl +
    'Invoice/' +
    this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] +
    '.pdf';

  setTimeout(() => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.target = '_blank';
    link.download = 'invoice.pdf';
    link.click();
    this.isDownloading = false;
  }, 5000);
}

goBack() {
  this.router.navigate(['/orders']);
}

calculateSubtotal() {
  const getArray = this.convertStringtoArray(
    this.cartDetails?.cartDetails?.[0]?.['CART_ITEMS']
  );

  if (Array.isArray(getArray)) {
    this.subtotal = getArray.reduce((sum, item) => {
      const discountAmount = parseFloat(item.ITEM_DISCOUNT_AMOUNT) || 0;
      return sum + discountAmount;
    }, 0);
  } else {
    this.subtotal = 0;
  }
}
 goToProductListing() {
    this.router.navigate(['/product-list']).then(() => {
      // this.visibleChange.emit(false);
      // this.orderPlaced.emit(true);
      // this.cartService.cartItems = [];
      // this.cartService.cartUpdated.next(this.cartService.cartItems);
      // this.cartService.updateCartCount();
      // window.location.reload();
    }); // change as needed
  }
  vareintImageUrl: string = this.api.retriveimgUrl + 'VarientImages/';
}
