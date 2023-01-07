import { mock, MockProxy, mockReset } from 'jest-mock-extended';
import { redisMock } from '../models/session/singleton';
import request from 'supertest';
import express, { Express } from 'express';
import twilioRouter, { MessageRequest } from './twilio';
import dialogflow from '../utils/dialogflow';
import { sessionType } from '../models/session';
import { pasreFormData } from '../utils/urlencoded';

const app: Express = express();
app.use(express.urlencoded({ extended: true }));
app.use('/twilio', twilioRouter);

jest.mock('../utils/dialogflow', () => ({
  default: mock<typeof dialogflow>(),
  __esModule: true,
}));
const dialogflowMock = dialogflow as unknown as MockProxy<typeof dialogflow>;

describe('api/twilio', () => {
  const WaId = '1234567890';
  const userState: sessionType = {
    firstname: 'user 1',
    image: 'image://',
    location: [2, 1],
    item: 'item',
  };
  const responseMessage = 'response message';

  beforeEach(() => {
    redisMock.exists.mockResolvedValue(1);
    redisMock.set.mockResolvedValue('OK');
    redisMock.get.mockResolvedValue(JSON.stringify(userState));
    mockReset(dialogflowMock);
  });

  it('should load users session on request', async () => {
    const reqBody: MessageRequest = {
      WaId,
      NumMedia: '0',
      Body: 'hello',
    };
    const searchParams = pasreFormData<MessageRequest>(reqBody);
    dialogflowMock.processReply.mockResolvedValue('hello');
    await request(app)
      .post('/twilio/handle-user-message')
      .send(searchParams)
      .set('Accept', 'text/xml');
    expect(redisMock.get).toHaveBeenCalledWith(WaId);
    expect(dialogflowMock.processReply).toHaveBeenCalledWith(
      reqBody.WaId,
      reqBody.Body
    );
  });
  it('should process response when user sends a message', async () => {
    const reqBody: MessageRequest = {
      WaId,
      NumMedia: '0',
      Body: 'hello',
    };
    const searchParams = pasreFormData<MessageRequest>(reqBody);

    dialogflowMock.processReply.mockResolvedValue(responseMessage);

    const res = await request(app)
      .post('/twilio/handle-user-message')
      .send(searchParams)
      .set('Accept', 'text/xml');
    expect(res.text).toMatch(responseMessage);
    expect(redisMock.get).toHaveBeenCalledWith(reqBody.WaId);
    expect(dialogflowMock.processReply).toHaveBeenCalledWith(
      reqBody.WaId,
      reqBody.Body
    );
    expect(dialogflowMock.triggerEvent).not.toHaveBeenCalled();
  });
  it('should trigger Dialogflow Image event when user sends an image', async () => {
    const reqBody: MessageRequest = {
      WaId,
      NumMedia: '1',
      Body: '',
      MediaUrl0: 'https://example.com/image/url',
    };
    const searchParams = pasreFormData<MessageRequest>(reqBody);
    dialogflowMock.triggerEvent.mockResolvedValue(responseMessage);

    const res = await request(app)
      .post('/twilio/handle-user-message')
      .send(searchParams)
      .set('Accept', 'text/xml');
    // expect(res.text).toMatch(responseMessage);
    expect(dialogflowMock.processReply).not.toHaveBeenCalled();
    expect(dialogflowMock.triggerEvent).toHaveBeenCalledWith(
      reqBody.WaId,
      'GET_IMAGE'
    );
  });
  it('should trigger Dialogflow Location event when user sends location pin', async () => {
    const reqBody: MessageRequest = {
      WaId,
      NumMedia: '0',
      Body: '',
      Latitude: '1',
      Longitude: '2',
    };
    const searchParams = pasreFormData<MessageRequest>(reqBody);
    dialogflowMock.triggerEvent.mockResolvedValue(responseMessage);
    const res = await request(app)
      .post('/twilio/handle-user-message')
      .send(searchParams)
      .set('Accept', 'text/xml');
    expect(res.text).toMatch(responseMessage);
    expect(dialogflowMock.processReply).not.toHaveBeenCalled();
    expect(dialogflowMock.triggerEvent).toHaveBeenCalledWith(
      reqBody.WaId,
      'GET_LOCATION'
    );
  });
  it('should update session as data is recieved', async () => {
    const reqBody: MessageRequest = {
      WaId,
      NumMedia: '1',
      Body: '',
      MediaUrl0: 'https://example.com/new/image/url',
    };
    const searchParams = pasreFormData<MessageRequest>(reqBody);
    dialogflowMock.triggerEvent.mockResolvedValue(responseMessage);
    const newsession: sessionType = {
      ...userState,
      image: reqBody.MediaUrl0,
    };
    await request(app)
      .post('/twilio/handle-user-message')
      .send(searchParams)
      .set('Accept', 'text/xml');
    expect(redisMock.set).toHaveBeenCalled();
    expect(dialogflowMock.triggerEvent).toHaveBeenCalled();
  });
});
