import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation'

export default class BoatSearch extends NavigationMixin(LightningElement) {
  isLoading = false;

  handleLoading() {
    this.isLoading = true;
  }
  
  handleDoneLoading() {
    const boatSearchResultEle = this.template.querySelector('c-boat-search-results');
    boatSearchResultEle.refresh();
    this.isLoading = false;
  }
  
  searchBoats(event) {
    const boatTypeId = event.detail.boatTypeId
    const boatSearchResultEle = this.template.querySelector('c-boat-search-results');
    boatSearchResultEle.searchBoats(boatTypeId);
  }
  
  createNewBoat() {
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
          objectApiName: 'Boat__c',
          actionName: 'new'
      }
    });
  }
}