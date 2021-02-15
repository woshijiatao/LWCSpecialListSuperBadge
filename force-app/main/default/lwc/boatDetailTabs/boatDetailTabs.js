import { LightningElement, wire } from 'lwc';
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation'

import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';
import BOAT_PRICE_FIELD from '@salesforce/schema/Boat__c.Price__c';
import BOAT_DESCRIPTION_FIELD from '@salesforce/schema/Boat__c.Description__c';
import BOAT_TYPE_FIELD from '@salesforce/schema/Boat__c.BoatType__r.Name';

import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import {
  MessageContext,
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
} from 'lightning/messageService';

const BOAT_FIELDS = [
  BOAT_ID_FIELD,
  BOAT_NAME_FIELD,
  BOAT_PRICE_FIELD,
  BOAT_DESCRIPTION_FIELD,
  BOAT_TYPE_FIELD,
];

export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;

  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord;

  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  
  activeTabValue;

  get detailsTabIconName() {
    return this.wiredRecord.data ? 'utility:anchor' : null;
  }
  
  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }
  
  subscription = null;

  @wire(MessageContext)
  messageContext;
  
  subscribeMC() {
    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => this.boatId = message.recordId,
      { scope: APPLICATION_SCOPE }
    );
  }
  
  connectedCallback() {
    if (this.subscription) {
      return;
    }
    this.subscribeMC();
  }

  disconnectCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }
  
  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          recordId: this.boatId,
          objectApiName: 'Boat__c', //
          actionName: 'view'
      }
    });
  }

  handleReviewCreated() {
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
    this.template.querySelector('c-boat-reviews').refresh();
  }
}