import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocationService {

  // importScripts(
  //   "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"
  // );
  // importScripts(
  //   "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js"
  // );
   
  // firebase.initializeApp({
  //   apiKey: "AIzaSyA5p3rU3z-A0QwV5_fEryVvQh4CFvlJckg",
  //   authDomain: "pockit-df54e.firebaseapp.com",
  //   projectId: "pockit-df54e",
  //   storageBucket: "pockit-df54e.firebasestorage.app",
  //   messagingSenderId: "658839127239",
  //   appId: "1:658839127239:web:9d5101fb9718275b116ae2",
  //   measurementId: "G-N76JL181BX"
  // });
  private firebaseUrl = 'https://pockit-df54e-default-rtdb.firebaseio.com/Jobs';

  constructor(private http: HttpClient) {}

  getLocation(jobCardId: string): Observable<{ latitude: number; longitude: number } | null> {
    console.log(jobCardId);
    
    return this.http
      .get<any>(`${this.firebaseUrl}/${jobCardId}/location.json`)
      .pipe(map((loc) => (loc ? { latitude: loc.latitude, longitude: loc.longitude } : null)));
  }

  // getLocation(jobCardId: string): Observable<{ latitude: number; longitude: number }> {
  //   return this.http.get<any>(`${this.firebaseUrl}/${jobCardId}/location.json`).pipe(
  //     map((loc) =>
  //       loc
  //         ? { latitude: loc.latitude, longitude: loc.longitude }
  //         : { latitude: 17.102012141647386, longitude: 74.67076772391789 } // Dummy location
  //     )
  //   );
  // }
  
}
