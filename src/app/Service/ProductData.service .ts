import { Injectable } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ProductDataService {
  private product: any;
  private productsDetails: any;

  setProduct(product: any) {
    this.product = product;
  }

  getProduct() {
    return this.product;
  }
   setProductsDetails(product: any) {
    this.productsDetails = product;
  }

  getProductsDetails() {
    return this.productsDetails;
  }
  
}
