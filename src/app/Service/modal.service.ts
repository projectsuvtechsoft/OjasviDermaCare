// modal.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
 
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new BehaviorSubject<boolean>(false);
  modalState$ = this.modalSubject.asObservable();
 
  private toggleSubject = new BehaviorSubject<boolean>(false);
  toggleState$ = this.toggleSubject.asObservable();
 
  private drawerSubject = new BehaviorSubject<{isOpen: boolean, payload: any}>({ isOpen: false, payload: null });
  drawerState$ = this.drawerSubject.asObservable();
 
  private triggerFunctionSubject = new Subject<void>();  // A Subject to act as a trigger
 
  // Observable to subscribe to
  triggerFunction$ = this.triggerFunctionSubject.asObservable();
 
 
 
  private addressUpdatedSource = new Subject<void>();
  addressUpdated$ = this.addressUpdatedSource.asObservable();
 
  // Method to emit an event when the address is saved or updated
  notifyAddressUpdated() {
    this.addressUpdatedSource.next();
  }
 
  triggerFunction() {
    this.triggerFunctionSubject.next();  // Emit the event to notify subscribers
  }
 
 
 
  openModal() {
    this.modalSubject.next(true);
    console.log(this.modalSubject, "servicereached");
 
  }
 
  closeModal() {
    this.modalSubject.next(false);
  }
 
  private userDataSubject = new BehaviorSubject<any>(null);
  userData$ = this.userDataSubject.asObservable();
 
  updateUserData(data: any) {
    this.userDataSubject.next(data);
  }
 
  toggle() {
    this.toggleSubject.next(!this.toggleSubject.value);
  }
 
  // Optionally, set the state to true (open) or false (closed) directly
  setToggleState(state: boolean) {
    this.toggleSubject.next(state);
  }
 
  toggleDrawer(payload: any = null) {
    const currentState = this.drawerSubject.value.isOpen;
    this.drawerSubject.next({ isOpen: !currentState, payload });  // Emit both state and data
  }
 
  // Optionally set the state and data directly
  setDrawerState(isOpen: boolean, payload: any = null) {
    this.drawerSubject.next({ isOpen, payload });  // Set both state and data directly
  }
 
}