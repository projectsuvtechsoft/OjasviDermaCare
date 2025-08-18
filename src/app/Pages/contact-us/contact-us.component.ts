import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiServiceService } from 'src/app/Service/api-service.service';
import { CommonFunctionService } from 'src/app/Service/CommonFunctionService';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',

  styleUrls: ['./contact-us.component.css'],
  providers: [DatePipe],
})
export class ContactUsComponent {
  contactData = {
    NAME: '',
    EMAIL_ID: '',
    MOBILE_NO: '',
    SUBJECT: '',
    MESSAGE: '',
  };
  public commonFunction = new CommonFunctionService();
emailaddress:any='';
loadingRecords: boolean = false;
//  private commonFunction = new CommonFunctionService();
  constructor(private api: ApiServiceService, private toastr: ToastrService, public datepipe: DatePipe, private cookie:CookieService) {}

  isOk: boolean = false;
  isSpinning: boolean = false;

  onSubmit(contactData: NgForm): void {
    this.isOk = true;

    if (
      this.contactData.NAME == undefined ||
      this.contactData.NAME == null
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter  Name', '');
    } else if (
      this.contactData.EMAIL_ID == undefined ||
      this.contactData.EMAIL_ID == '' ||
      this.contactData.EMAIL_ID.trim() == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter Email', '');
    } else if (
      this.contactData.MOBILE_NO == null ||
      this.contactData.MOBILE_NO == undefined ||
      this.contactData.MOBILE_NO == '' ||
      this.contactData.MOBILE_NO.trim() == ''
    ) {
      this.isOk = false;
      // console.log(this.toastr)
      this.toastr.error('Please Enter Mobile No', '');
    } else if (
      this.contactData.SUBJECT == undefined ||
      this.contactData.SUBJECT == null ||
      this.contactData.SUBJECT == '' ||
      this.contactData.SUBJECT.trim() == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter Subject', '');
    } else if (
      this.contactData.MESSAGE == undefined ||
      this.contactData.MESSAGE == null ||
      this.contactData.MESSAGE == '' ||
      this.contactData.MESSAGE.trim() == ''
    ) {
      this.isOk = false;
      this.toastr.error('Please Enter Message', '');
    }
    if (this.isOk) {  
      this.isSpinning = true;
      {
        this.api.SendMessage(this.contactData).subscribe(
          (successCode) => {
            console.log("contactData",this.contactData);
            if (successCode.code == 200) {
              this.isSpinning = false;
              this.toastr.success(
              
                'Contact Information Saved  Successfully...',
                ''
              );
            } else {
              this.toastr.error('Cannot Save this Information...', '');
              this.isSpinning = false;
            }
          },
          (err) => {
            this.toastr.error('Something Went Wrong try Again Later..', '');
            this.isSpinning = false;
          }
        );
      }
    }
  }

   
 SubsribeToNewsLetter() {
  if(this.emailaddress==undefined || this.emailaddress==null || this.emailaddress==''){
    console.log("1",this.emailaddress)
   
    this.toastr.error("Please enter email ID",'')
  }else if(!this.commonFunction.emailpattern.test(this.emailaddress)){
   this.toastr.error("Please enter valid email ID",'')
  }else{
    console.log("11")
 
var data:any={
      DATE:
     this.datepipe.transform(new Date(),'yyyy-MM-dd HH:mm:ss'),
EMAIL_ID:this.emailaddress,
DEVICE_ID: this.cookie.get('deviceId'),
 
CLIENT_ID:1
    }
    this.loadingRecords = true;
 
    this.api.SubsribeToNewsLetterCreate(data).subscribe(
          (successCode) => {
            if (successCode['code'] === 200) {
   this.toastr.success("Subscribed successfully.",'')
          this.loadingRecords = false;
          this.emailaddress='';
        }else if(successCode['code'] === 400){
           this.toastr.error("Email ID already exists",'')
          this.loadingRecords = false;
        } else {
          this.loadingRecords = false;
        }
          },
          (err) => {
            this.toastr.error('Something Went Wrong try Again Later..', '');
                 this.loadingRecords = false;
          });
  }
  }
 
}
