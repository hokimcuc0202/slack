import express from 'express';
import {Common} from './common'
const common = new Common();

const router = express.Router();

router.post('/slack/actions', async (req: any, res: any) => {
  let payload = JSON.parse(req.body.payload)
  try {
    await common.updateListProductMessage(payload.channel.id, payload.message.ts, payload.actions[0].value)
  } catch (error) {
      console.log(error);
  }
  
  return res.json();
});
export {router};