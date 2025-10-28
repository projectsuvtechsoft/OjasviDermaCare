import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiServiceService } from 'src/app/Service/api-service.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css'],
})
export class OrderDetailsComponent {
  orderId!: string;
  cartDetails: any = {};
  orderStatus = 'A'; // Replace with real API data
  selectedAddress: any;
  photoURL = this.api.retriveimgUrl + 'productImages/';
  // --- Drawer Management Functions ---
  imageIndices: { [productId: string]: number } = {};
  showPaymentModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiServiceService
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('key')!;
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
    // TODO: Fetch details using this.orderId
    this.api.getOpenOrders(this.orderId).subscribe((res) => {
      // console.log(res,'subscribeData')
      if (res.code == 200) {
        this.cartDetails.cartDetails = res.data;
        this.orderStatus = res.data[0].CURRENT_STAGE;
        this.calculateSubtotal();
        // console.log(this.cartDetails.cartDetails,'this.cartDetails.cartDetails')
      } else {
        // this.toastr.error('Failed to get details','')
      }
    });
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

  isDownloading = false;

  downloadInvoice() {
    this.isDownloading = true;

    const fileUrl =
      this.api.retriveimgUrl +
      'Invoice/' +
      this.cartDetails.cartDetails[0]['INVOICE_NUMBER'] +
      '.pdf';

    // Simulating delay (e.g. 5 seconds for invoice generation)
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.target = '_blank';
      link.download = 'invoice.pdf';
      link.click();
      this.isDownloading = false; // stop loader
    }, 5000);
  }

  goBack() {
    this.router.navigate(['/orders']);
  }
  subtotal = 0;

  calculateSubtotal() {
    // Convert stringified CART_ITEMS to array
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

    // console.log('Subtotal:', this.subtotal);
  }
}
