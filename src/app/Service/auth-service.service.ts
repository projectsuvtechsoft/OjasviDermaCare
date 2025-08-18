import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn(): boolean {
    // Replace with real authentication check (e.g., token, session)
    return !!localStorage.getItem('userName');
  }
}
