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
  ) { }

  steps = [
    { id: 1, status: 'P', label: 'Order Placed' },
    { id: 2, status: 'A', label: 'Accepted' },
    { id: 3, status: 'PD', label: 'Packaging Done' },
    { id: 4, status: 'DD', label: 'Dispatched' },
    { id: 5, status: 'OD', label: 'Delivered' },
  ];
  currentStep = 1;

  getStepDate(stepId: number) {
   
    switch (stepId) {
      case 1:
        return this.cartDetails.cartDetails[0]?.ORDER_DATETIME;
      case 2:
          return this.cartDetails.cartDetails[0]?.ORDER_CONFIRMED_DATETIME;
      case 3:
        return this.cartDetails.cartDetails[0]?.ACTUAL_PREPARE_PACKAGING_DATETIME;
      case 4:
        return this.cartDetails.cartDetails[0]?.ACTUAL_DISPATCH_DATETIME;
      case 5:
        return this.cartDetails.cartDetails[0]?.ACTUAL_DELIVERY_DATETIME;
      default:
        return null;
    }
  }
  ngOnInit() {
    // this.orderId = this.route.snapshot.paramMap.get('orderId')!;
    this.route.queryParamMap.subscribe((params) => {
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
  fallbackImage = 'assets/images/no-image.png'; // any placeholder image
  private failedImages = new Set<string>(); // cache to avoid reattempts

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img) return;

    // Prevent infinite loops
    if (!this.failedImages.has(img.src)) {
      this.failedImages.add(img.src);
      img.src = this.fallbackImage;
    }
  }

  getSafeImageUrl(url: string): string {
    // if previously failed, return fallback immediately
    return this.failedImages.has(url) ? this.fallbackImage : url;
  }

  trackByItemId(index: number, item: any): string {
    return item.ID;
  }
  convertStringtoArray(str: string) {
    return JSON.parse(str);
  }
  isRejected: any
  fetchOrderDetails() {
    this.isLoading = true; // Start loading
    this.api.getOpenOrders(this.orderId).subscribe(
      (res) => {
        if (res.code == 200) {
          this.cartDetails.cartDetails = res.data;
          this.isRejected = this.cartDetails.cartDetails[0].ORDER_STATUS === 'R';
          this.orderStatus = res.data[0].ORDER_STATUS;
          const stage = res.data[0].ORDER_STATUS;
          this.currentStep =
            this.steps.find((s) => s.status === stage)?.id || 1;
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
