
import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController, LoadingController } from 'ionic-angular';
import { Camera,PictureSourceType} from '@ionic-native/camera';
import { GoogleCloudVisionServiceProvider } from '../../providers/google-cloud-vision-service/google-cloud-vision-service';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
 
  selectedImage: string = '';
  resultJsonData: any;
  
  constructor(public navCtrl: NavController,
              private camera: Camera, 
              private actionSheetCtrl: ActionSheetController,
              private vision: GoogleCloudVisionServiceProvider,
              public alertCtrl: AlertController,
              public loadingCtrl: LoadingController) {

  }

  selectSource() {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Use Library',
          handler: () => {
            this.getPicture1(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }, {
          text: 'Capture Image',
          handler: () => {
            this.getPicture1(this.camera.PictureSourceType.CAMERA);
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }
  
  getPicture1(sourceType: PictureSourceType) {
    this.camera.getPicture({
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }).then((imageData) => {
      const loader = this.loadingCtrl.create({
        content: "Please wait...",
        duration: 3000
      });
      loader.present();
      this.vision.getLabels(imageData).subscribe((result) => {
        this.resultJsonData = result;
        // console.log(this.resultJsonData.responses[0].labelAnnotations);
        for(var i = 0; i<this.resultJsonData.responses[0].labelAnnotations.length; i++){
          if(this.resultJsonData.responses[0].labelAnnotations[i].description == "White") {
            loader.dismiss();  
            const alert = this.alertCtrl.create({
                title: 'Warning!',
                subTitle: 'Na na, you have scanned blank page...!',
                buttons: ['OK']
              });
              alert.present();
              this.selectedImage = '';
            break;
          } else {
            loader.dismiss();
            this.selectedImage = `data:image/jpeg;base64,${imageData}`;
          }
        }
      }, err => {
        alert(err);
      });
      
    });
  }
  
}
