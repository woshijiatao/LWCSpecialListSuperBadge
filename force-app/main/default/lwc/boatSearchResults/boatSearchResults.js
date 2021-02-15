import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import {
  MessageContext,
  publish,
  APPLICATION_SCOPE
} from 'lightning/messageService';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE   = 'Error';
const CONST_ERROR   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [
    { label: 'Name', fieldName: 'Name',  editable: true },
    { label: 'Length', fieldName: 'Length__c', editable: true },
    { label: 'Price', fieldName: 'Price__c', type: 'currency', editable: true },
    { label: 'Description', fieldName: 'Description__c', editable: true },
  ];
  boatTypeId = '';
  @track boats;
  @track draftValues;
  isLoading = false;
  
  @wire(MessageContext)
  messageContext;

  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(result) {
    this.boats = result;
    this.notifyLoading(false);
  }
  
  @api
  searchBoats(boatTypeId) {
    this.boatTypeId = boatTypeId;
    this.notifyLoading(true);
  }
  
  @api
  async refresh() {
    this.notifyLoading(true);
    refreshApex(this.boats);
  }
  
  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(event.detail.boatId);
  }
  
  sendMessageService(boatId) { 
    publish(
      this.messageContext,
      BOATMC,
      { recordId: boatId },
      { scope: APPLICATION_SCOPE},
    );
  }

  async handleSave(event) {
    this.notifyLoading(true);
    const recordInputs = event.detail.draftValues.slice().map(draft=>{
      const fields = Object.assign({}, draft);
      return {fields};
    });
    const promises = recordInputs.map(recordInput => updateRecord(recordInput));
    Promise.all(promises).then(response => {
      this.dispatchEvent(
        new ShowToastEvent({
            title: SUCCESS_TITLE,
            message: MESSAGE_SHIP_IT,
            variant: SUCCESS_VARIANT,
        })
      );
      this.draftValues = [];
      this.refresh();
    }).catch(() => {
      this.dispatchEvent(
        new ShowToastEvent({
            title: ERROR_TITLE,
            message: CONST_ERROR,
            variant: ERROR_VARIANT,
        })
      );
    }).finally(() => {
      this.notifyLoading(false);
    });
  }

  notifyLoading(isLoading) {
    const eventName = isLoading ? 'loading' : 'doneloading';
    this.dispatchEvent(new CustomEvent(eventName));
  }
}