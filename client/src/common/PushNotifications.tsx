import * as PusherPushNotifications from "@pusher/push-notifications-web";
import BablyApi from "../api";

const BASE_URL =
  import.meta.env.VITE_API_URL;

let beamsClient: PusherPushNotifications.Client | null = null;
if (
  /iPad|iPhone|iPod/.test(navigator.userAgent)
  // || window.location.hostname.indexOf("bably") === -1
) {
  beamsClient = null;
  console.log("Beams client not initialized for iOS or local development");
} else {
  beamsClient = new PusherPushNotifications.Client({
    instanceId: "0c2efc77-8e04-4f45-a1ac-558892357612",
  });
  console.log("Beams client initialized");
}

function startBeams(email: string) {
  if (!email || sessionStorage.getItem("beamsUser") === "denied") {
    console.log("Beams not started: no email or permission denied");
    return;
  }
  if (email === "demo@demo.com") {
    console.log("Beams not started for demo user");
    return
  }
  if (!beamsClient) {
    console.error("Beams client is not initialized");
    return
  }
  if (sessionStorage.getItem("beamsUser") !== email) {
    const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
      url: `${BASE_URL}/users/pusher/beams-auth`,
      headers: {
        Authorization: `Bearer ${BablyApi.token}`,
      },
    });
    beamsClient
      .start()
      .then(() => beamsClient!.setUserId(email, beamsTokenProvider))
      .then(() => {
        console.log("Beams client started");
        sessionStorage.setItem("beamsUser", email);
      })
      .catch((e: Error) => {
        if (
          e.toString() === "AbortError: Registration failed - permission denied"
        ) {
          sessionStorage.setItem("beamsUser", "denied");
        } else console.error(e);
      });
  }
}

function stopBeams() {
  if (!beamsClient) return;
  beamsClient
    .clearAllState()
    .then(() => console.log("Beams state has been cleared"))
    .catch((e: Error) => console.error("Could not clear Beams state", e));
  sessionStorage.removeItem("beamsUser");
}

export { startBeams, stopBeams };
