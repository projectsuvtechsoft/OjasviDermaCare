import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
 
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
 
 
  constructor(
    private router: Router,
    public toastr: ToastrService,
 private api: ApiServiceService,
  public datepipe: DatePipe,
     private cookie: CookieService,
  ) {}
 
 
   goToContactUs() {
    this.router.navigate(['/contact-us']);
  }
 
  loadingRecords: boolean = false;
    emailaddress: any = '';
      private commonFunction = new CommonFunctionService();
   SubsribeToNewsLetter() {
    if (
      this.emailaddress == undefined ||
      this.emailaddress == null ||
      this.emailaddress == ''
    ) {
      this.toastr.error('Please enter email ID', '');
    } else if (!this.commonFunction.emailpattern.test(this.emailaddress)) {
      this.toastr.error('Please enter valid email ID', '');
    } else {
      var data: any = {
        DATE: this.datepipe.transform(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        EMAIL_ID: this.emailaddress,
        DEVICE_ID: this.cookie.get('deviceId'),
 
        CLIENT_ID: 1,
      };
      this.loadingRecords = true;
 
      this.api.SubsribeToNewsLetterCreate(data).subscribe(
        (successCode) => {
          if (successCode['code'] === 200) {
            this.toastr.success('Subscribed successfully.', '');
            this.loadingRecords = false;
            this.emailaddress = '';
          } else if (successCode['code'] === 400) {
            this.toastr.error('Email ID already exists', '');
            this.loadingRecords = false;
          } else {
            this.loadingRecords = false;
          }
        },
        (err) => {
          this.toastr.error('Something Went Wrong try Again Later..', '');
          this.loadingRecords = false;
        }
      );
    }
  }
 
}