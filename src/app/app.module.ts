import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductpageComponent } from './Pages/productpage/productpage.component';
import { HeaderComponent } from './Pages/header/header.component';
import { FooterComponent } from './Pages/footer/footer.component';
import { UserProfileComponent } from './Pages/user-profile/user-profile.component';
import { FavoritesComponent } from './Pages/favorites/favorites.component';
import { HomeComponent } from './Pages/home/home.component';
import { CartDrawerComponent } from './Pages/cart-drawer/cart-drawer.component';
import { LoginComponent } from './Pages/login/login/login.component';
import { CommonLoaderComponent } from './Pages/common-loader/common-loader.component';
import { CookieService } from 'ngx-cookie-service';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LandingPageComponent } from './Pages/landing-page/landing-page.component';
import { ContactUsComponent } from './Pages/contact-us/contact-us.component';
import { AboutComponent } from './Pages/about/about.component';
import { CheckoutComponent } from './Pages/checkout/checkout.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductpageComponent,
    HeaderComponent,
    FooterComponent,
    UserProfileComponent,
    FavoritesComponent,
    HomeComponent,
    CartDrawerComponent,
    LoginComponent,
    CommonLoaderComponent,
    LandingPageComponent,
    ContactUsComponent,
    AboutComponent,
    CheckoutComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    // CarouselModule.forRoot(),
    HttpClientModule,
    // NgbDropdownModule,
    FormsModule,
    RouterModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      preventDuplicates: true,
    }),
     BrowserAnimationsModule,
    ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      timeOut: 3000,
      preventDuplicates: true,
    }),
  ],
  providers: [CookieService, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
