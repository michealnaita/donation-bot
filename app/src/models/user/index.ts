import submitDonation from '../../utils/submitDonation';
import Session, { sessionType } from '../session/index';

export default class User {
  public sessionId?: string;
  public item?: string = null;
  public firstname?: string = null;
  public image?: string = null;
  public location?: [number, number] = null;
  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }
  async loadSession(): Promise<void> {
    const session = await Session.load(this.sessionId);
    if (session) {
      const { item, firstname, image, location }: sessionType = session;
      this.item = item;
      this.firstname = firstname;
      this.image = image;
      this.location = location;
    }
  }
  cancel() {}
  async submit(): Promise<{
    success: boolean;
    err_message: any;
  }> {
    const res = await submitDonation({
      phone: this.sessionId,
      item: this.item,
      firstname: this.firstname,
      image: this.image,
      location: this.location,
    });
    return res;
  }
  missing(): string[] {
    const missingProps: string[] = [];
    Object.keys(this).forEach((prop) => {
      if (!this[prop]) {
        missingProps.push(prop);
      }
    });
    return missingProps;
  }
  async save() {
    const res = await Session.save(this.sessionId, {
      item: this.item,
      firstname: this.firstname,
      image: this.image,
      location: this.location,
    });
    return res;
  }
}
