const kintone = require('@kintone/kintone-js-sdk');
import {config} from './config'
import { WebClient } from '@slack/web-api';
import {SectionBlock, DividerBlock, Button, ActionsBlock} from '@slack/types';
const slackWebApi = new WebClient(config.slack.botToken);

const MAX_RECORD_SHOW = 1

class Common {
    record: any;
    constructor() {
        const auth = new kintone.Auth();
        auth.setPasswordAuth(config.kintone.username,config.kintone.password);
        const conn = new kintone.Connection(config.kintone.domain, auth);
        this.record = new kintone.Record(conn);
    }
    async getListProductMessage(offset: string) {
        try {
            let records = await this.record.getRecords(config.kintone.appID,  `limit ${MAX_RECORD_SHOW + 1} offset ${offset}`, undefined, true);
            records = records.records
            let numRecord = records.length > MAX_RECORD_SHOW ? MAX_RECORD_SHOW : records.length

            let blockTemplate = []
            for (let i = 0; i < numRecord; i++) {
                const item: SectionBlock = {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: this.getTextFormat(records[i].name.value, records[i].total.value, records[i].description.value)
                    },
                    accessory: {
                        type:'image',
                        image_url: 'https://api.slack.com/img/blocks/bkb_template_images/tripAgent_1.png',
                        alt_text: 'image'
                    }
                }
                const divider: DividerBlock = {
                    type: 'divider'
                }
                
                blockTemplate.push(item);
                blockTemplate.push(divider);
            }
            const buttonText = records.length > numRecord ? 'show next' : 'show previous'
            let action:ActionsBlock = {
                type: 'actions',
                elements: [this.getButtonAction(buttonText,`${(parseInt(offset) + MAX_RECORD_SHOW)}`)]
              };
              if (records.length > MAX_RECORD_SHOW) {
                blockTemplate.push(action);
              }
            
            return blockTemplate;
        } catch (error) {
            throw error
        }
    }

    getButtonAction(text: string, value: string) {
        const button: Button = {
            type: 'button',
            text: {
                type: 'plain_text',
                text: text,
                emoji: false
            },
            value: value,
        }
        return button;
    }

    getTextFormat(name: string, total: string, description: string) {
        return `*${name}*\n*Total*: ${total} \n_${description}_`
    }

    async sendListProductMessage(channerID: string) {
        try {
            let message = await this.getListProductMessage('0');
            let rsp = await slackWebApi.chat.postMessage({
                text: 'Hello world!',
                channel: channerID,
                'blocks': message
            });
            return rsp;
        } catch (error) {
            throw error;
        }
    }

    async updateListProductMessage(channerID: string, ts: string, offset: string) {
        try {
            let message = await this.getListProductMessage(offset);
            let rsp = await slackWebApi.chat.update({
                channel: channerID,
                text: 'update',
                ts: ts,
                blocks: message
            })
            return rsp;
        } catch (error) {
            throw error;
        }
    }

}
export {Common}