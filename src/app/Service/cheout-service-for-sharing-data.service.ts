import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class CheoutServiceForSharingDataService {
  cartDetails: any = new BehaviorSubject<any>(null);
  subtotal: any = new BehaviorSubject<any>(null);
  addressDrawerOpen: any = new BehaviorSubject<any>(null);
  userId: any = new BehaviorSubject<any>(null);

  constructor() { }

  getCartDetails() {
    return this.cartDetails.asObservable();
  }

  setCartDetails(data: any) {
    this.cartDetails.next(data);
  }

  getSubtotal() {
    return this.subtotal.asObservable();
  }

  setSubtotal(data: any) {
    this.subtotal.next(data);
  }

  getAddressDrawerOpen() {
    return this.addressDrawerOpen.asObservable();
  }

  setAddressDrawerOpen(data: any) {
    this.addressDrawerOpen.next(data);
  }

  getUserId() {
    return this.userId.asObservable();
  }

  setUserId(data: any) {
    this.userId.next(data);
  }
}
