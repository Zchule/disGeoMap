import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mapRef = null;
  directionsService: any = null;
  directionsDisplay: any = null;
  bounds: any = null;
  myLatLng: any;
  waypoints: any[];

  constructor(
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController
  ) {
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.bounds = new google.maps.LatLngBounds();
    this.waypoints = [
      {
        location: { lat: 1.223109, lng: -77.281550 }, // 1.223109, -77.281550
        stopover: true,
      },
      {
        location: { lat: 1.220835, lng: -77.282183 },
        stopover: true,
      },
      {
        location: { lat: 1.218175, lng: -77.282687 },
        stopover: true,
      },
      {
        location: { lat: 1.220316, lng: -77.284751 },
        stopover: true,
      }
    ];
  }

  ngOnInit() {
    this.loadMap();
  }

  async loadMap() {
    const loading = await this.loadingCtrl.create();
    loading.present();
    this.myLatLng = await this.getLocation();

    const mapEle: HTMLElement = document.getElementById('map');
    const panelEle: HTMLElement = document.getElementById('panel');

    this.mapRef = new google.maps.Map(mapEle, {
      center: this.myLatLng,
      zoom: 12
    });

    this.directionsDisplay.setMap(this.mapRef);
    this.directionsDisplay.setPanel(panelEle);

    google.maps.event.addListenerOnce(this.mapRef, 'idle', () => {
      loading.dismiss();
      this.addMaker(this.myLatLng.lat, this.myLatLng.lng);
      mapEle.classList.add('show-map');
      this.calulateRoute();
    });
  }

  private addMaker(lat: number, lng: number) {
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.mapRef,
      title: 'Hello World!'
    });
  }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    return {
      lat: rta.coords.latitude,
      lng: rta.coords.longitude
    };
  }

  calulateRoute() {
    this.bounds.extend(this.myLatLng);

    this.waypoints.forEach(waypoint => {
      const point = new google.maps.LatLng(waypoint.location.lat, waypoint.location.lng);
      this.bounds.extend(point);
    });

    this.mapRef.fitBounds(this.bounds);

    this.directionsService.route({
      origin: new google.maps.LatLng(this.myLatLng.lat, this.myLatLng.lng),
      destination: new google.maps.LatLng(this.myLatLng.lat, this.myLatLng.lng),
      waypoints: this.waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
      avoidTolls: true
    }, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        console.log(response);
        this.directionsDisplay.setDirections(response);
      } else {
        alert('Could not display directions due to: ' + status);
      }
    });
  }
}

