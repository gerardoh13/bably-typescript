import axios from "axios";

const BASE_URL = window.location.hostname.indexOf("bably") !== -1 ? import.meta.env.VITE_API_URL : "http://localhost:8080";


class BablyApi {

  static token: string;

  static async request(endpoint: string, data = {}, method = "get") {
    // console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
    const headers = { Authorization: `Bearer ${BablyApi.token}` };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        console.error("API Error:", err.response);
        let message = err.response.data.error.message;
        throw Array.isArray(message) ? message : [message];
      } else {
        console.error("API Error:", err);
        throw ["An unknown error occurred"];
      }
    }
  }

  // Individual API routes

  // ------------------USERS---------------------------
  static async login(data: any) {
    let res = await this.request("users/token", data, "post");
    return res.token;
  }

  static async registerUser(data: any) {
    let res = await this.request("users/register", data, "post");
    return res.token;
  }

  static async getCurrUser(email: string) {
    let res = await this.request(`users/${email}`);
    return res.user;
  }

  static async resetPwd(token: string, data: any) {
    let res = await this.request(
      `users/new-password?token=${token}`,
      data,
      "post"
    );
    return res;
  }

  static async requestPwdReset(data: any) {
    let res = await this.request("users/reset", data, "post");
    return res;
  }

  static async updateReminders(email: string, data: any) {
    let res = await this.request(`users/reminders/${email}`, data, "patch");
    return res;
  }

  static async updateNotifications(userId: string, infantId: string, data: any) {
    let res = await this.request(`users/notify-admin/${userId}/${infantId}`, data, "patch");
    return res.notify;
  }

  static async updateAcess(userId: string, infantId: string, data: any) {
    let res = await this.request(`users/access/${userId}/${infantId}`, data, "patch");
    return res.access;
  }

  static async removeAcess(userId: string, infantId: string) {
    let res = await this.request(`users/access/${userId}/${infantId}`, {}, "delete");
    return res.removedAccess;
  }
  // static async updateUser(email, data) {
  //   let res = await this.request(`users/${email}`, data, "patch");
  //   return res.user;
  // }

  // ------------------INFANTS-----------------------
  static async registerInfant(userId: string, data: any) {
    let res = await this.request(`infants/register/${userId}`, data, "post");
    return res.infant;
  }

  static async getCurrChild(id: string) {
    let res = await this.request(`infants/${id}`);
    return res.infant;
  }

  static async getTodaysData(infant_id: string, start: string, end: string) {
    let res = await this.request(`infants/today/${infant_id}/${start}/${end}`);
    return res.today;
  }

  static async updateInfant(infant_id: string, data: any) {
    let res = await this.request(`infants/${infant_id}`, data, "patch");
    return res.infant;
  }

  static async addUser(infant_id: string, data: any) {
    let res = await this.request(`infants/add-user/${infant_id}`, data, "post");
    return res.details;
  }

  static async getAuthorizedUsers(infant_id: string) {
    let res = await this.request(`infants/auth-users/${infant_id}`);
    return res.users;
  }
  // ------------------FEEDS-----------------------
  static async addFeed(data: any) {
    let res = await this.request("feeds", data, "post");
    return res.feed;
  }

  static async getFeed(infant_id: string, feed_id: string) {
    let res = await this.request(`feeds/${infant_id}/${feed_id}`);
    return res.feed;
  }

  static async updateFeed(infant_id: string, feed_id: string, data: any) {
    let res = await this.request(
      `feeds/${infant_id}/${feed_id}`,
      data,
      "patch"
    );
    return res.feed;
  }

  static async deleteFeed(infant_id: string, feed_id: string) {
    let res = await this.request(`feeds/${infant_id}/${feed_id}`, {}, "delete");
    return res;
  }

  static async scheduleReminder(email: string, data: any) {
    let res = await this.request(`feeds/reminders/${email}`, data, "post");
    return res;
  }
  // ------------------DIAPERS-----------------------
  static async addDiaper(data: any) {
    let res = await this.request("diapers", data, "post");
    return res.diaper;
  }

  static async getDiaper(infant_id: string, diaper_id: string) {
    let res = await this.request(`diapers/${infant_id}/${diaper_id}`);
    return res.diaper;
  }

  static async updateDiaper(infant_id: string, diaper_id: string, data: any) {
    let res = await this.request(
      `diapers/${infant_id}/${diaper_id}`,
      data,
      "patch"
    );
    return res.diaper;
  }

  static async deleteDiaper(infant_id: string, diaper_id: string) {
    let res = await this.request(
      `diapers/${infant_id}/${diaper_id}`,
      {},
      "delete"
    );
    return res;
  }
  // ------------------EVENTS-----------------------
  static async getEvents(infant_id: string, start: number, end: number) {
    let res = await this.request(`infants/events/${infant_id}/${start}/${end}`);
    return res.events;
  }
}

export default BablyApi;
