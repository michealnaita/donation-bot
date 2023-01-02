import { SessionsClient } from '@google-cloud/dialogflow';

/**
 *
 * @param sessionId - conversation session id
 * @param message  - users message
 * @returns - reply message from dialog flow
 */
export default async function (
  sessionId: string,
  message: string
): Promise<string> {
  const projectId: string = process.env.DIALOGFLOW_PROJECT_ID;
  const client = new SessionsClient();
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
