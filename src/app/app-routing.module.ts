import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavoritesComponent } from './Pages/favorites/favorites.component';
import { HomeComponent } from './Pages/home/home.component';
import { LoginComponent } from './Pages/login/login/login.component';
import { UserProfileComponent } from './Pages/user-profile/user-profile.component';
import { LandingPageComponent } from './Pages/landing-page/landing-page.component';
import { ContactUsComponent } from './Pages/contact-us/contact-us.component';
import { ProductpageComponent } from './Pages/productpage/productpage.component';
import { AboutComponent } from './Pages/about/about.component';
import { ForgotPasswordComponent } from './Pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './Pages/reset-password/reset-password.component';

const routes: Routes = [
  { path: 'favorites', component: FavoritesComponent },
  { path: 'product-list', component: HomeComponent },
  { path: 'home', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  {path:'profile', component: UserProfileComponent}, // Add the user profile route
{ path: 'contact-us', component: ContactUsComponent },
  { path: 'product_details/:id', component: ProductpageComponent },
{ path: 'product_details/:id/:variantId', component: ProductpageComponent },
    {path:'about-us', component: AboutComponent}, // Assuming you have an AboutComponent
  // Redirect empty path to home (if you have a home component)
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'product-list/:categoryid', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
