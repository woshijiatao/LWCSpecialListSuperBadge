import { LightningElement, wire, api, track } from 'lwc';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'

const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {
  @api boatTypeId = '';

  @track mapMarkers = [];

  latitude;
  longitude;
  isRendered = false;
  isLoading = true;

  @wire(getBoatsByLocation, {
    latitude: '$latitude',
    longitude: '$longitude',
    boatTypeId: '$boatTypeId',
  })
  wiredBoatsJSON({error, data}) {
    this.isLoading = true;
    if (data) {
      const boats = JSON.parse(data);
      this.createMapMarkers(boats);
    } else if (error) {
      this.dispatchEvent(
        new ShowToastEvent({
          title: ERROR_TITLE,
          message: error,
          variant:ERROR_VARIANT,
        })
      );
      this.mapMarkers = [];
    }
    this.isLoading = false;
  }
  
  getLocationFromBrowser() {
    navigator.geolocation.getCurrentPosition((position) => {
      if (posision && position.coords) {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      }
    }, (err) => {
      console.log(333333);
      console.log(err.code, err.message);
    });
  }

  get center() {
    return this.mapMarkers.length > 0 ? this.mapMarkers[0] : [];
  }

  renderedCallback() {
    if (this.isRendered) {
      return;
    }
    this.isRendered = true;
    this.getLocationFromBrowser();
  }

  createMapMarkers(boats) {
    const newMarkers = boats.map(boat => {
      return {
        title: boat.Name,
        icon: ICON_STANDARD_USER,
        location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s,
        }
      }
    });
    newMarkers.unshift({
      title: LABEL_YOU_ARE_HERE,
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude,
      }
    });
    this.mapMarkers = newMarkers;
  }
}