import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';

export default class SimilarBoats extends NavigationMixin(LightningElement) {
  currentBoat;
  @track relatedBoats;
  boatId;
  error;
  
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    // sets the boatId value
    // sets the boatId attribute
    this.boatId = value;
  }
  
  @api
  similarBy;
  
  @wire(getSimilarBoats, {
    boatId: '$boatId',
    similarBy: '$similarBy',
  })
  similarBoats({ error, data }) {
    if (data) {
      this.error = undefined;
      this.relatedBoats = data;
      console.log(JSON.stringify(data, null, 4));
    } else if (error) {
      this.error = error;
      this.relatedBoats = undefined;
    }
  }

  get getTitle() {
    return 'Similar boats by ' + this.similarBy;
  }

  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  openBoatDetailPage(event) {
    this.currentBoat = event.detail.boatId;
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: event.detail.boatId,
        objectApiName: 'Boat__c',
        actionName: 'view',
      }
    });
  }
}