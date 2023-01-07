import { SessionsClient } from '@google-cloud/dialogflow';

export enum dialogflowEvent {
  GET_IMAGE = 'GET_IMAGE',
  GET_LOCATION = 'GET_LOCATION',
}
/**
 *
 * @param sessionId - conversation session id
 * @param message  - users message
 * @returns - reply message from dialog flow
 */
async function processReply(
  sessionId: string,
  message: string
): Promise<string> {
  const projectId: string = process.env.DIALOGFLOW_PROJECT_ID;
  const client: SessionsClient = new SessionsClient();
  const sessionPath = client.projectAgentSessionPath(projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en',
      },
    },
  };

  const responses = await client.detectIntent(request);
  const { fulfillmentText: reply } = responses[0].queryResult;

  return reply;
}

async function triggerEvent(sessionId: string, event: string): Promise<string> {
  console.log(event);
  const projectId: string = process.env.DIALOGFLOW_PROJECT_ID;
  const client: SessionsClient = new SessionsClient();
  try {
    const sessionPath = client.projectAgentSessionPath(projectId, sessionId);
    const request = {
      session: sessionPath,
      queryInput: {
        event: {
          name: event,
          languageCode: 'en',
        },
      },
    };
    const responses = await client.detectIntent(request);
    const { fulfillmentText: reply } = responses[0].queryResult;

    return reply;
  } catch (err) {
    console.log(err);
    return 'an error occured';
  }
}
const dialogflowUtils = {
  processReply,
  triggerEvent,
};
export default dialogflowUtils;
