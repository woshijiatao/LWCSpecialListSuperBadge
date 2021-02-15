import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';

export default class BoatReviews extends NavigationMixin(LightningElement) {
  boatId;
  @track error;
  @track boatReviews;
  @track isLoading;
  
  @api
  get recordId() { 
      return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
    this.getReviews();
  }
  
  get reviewsToShow() { 
      if (this.boatReviews && this.boatReviews.length > 0) {
          return true;
      } else {
          return false;
      }
  }
  
  @api
  refresh() { 
      this.getReviews();
  }
  
  getReviews() { 
      if (!this.boatId) {
          return
      }
      this.isLoading = true;
      getAllReviews({boatId: this.boatId})
          .then(result => {
              this.boatReviews = result;
              this.isLoading = false;
          })
          .catch(error => {
              this.error = error;
          });
  }
  
  // Helper method to use NavigationMixin to navigate to a given record on click
  navigateToRecord(event) {  
      event.preventDefault();
      event.stopPropagation();
      this.recordId = event.target.dataset.recordId;
      this[NavigationMixin.Navigate]({
          type: 'standard__recordPage',
          attributes: {
              recordId: this.recordId,
              objectApiName: 'User',
              actionName: 'view'
          }
      });
  }
}