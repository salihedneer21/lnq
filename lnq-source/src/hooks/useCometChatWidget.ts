import { useCallback, useEffect, useState } from "react";
import { EnvConfig } from "../base/EnvConfig";
import { useSyncCometChatFriends, useUserData } from "../api/UserApi";
import { useAccessToken } from "../api/AuthApi";

declare global {
  interface Window {
    CometChatWidget: {
      init: (params: {
        appID: string;
        appRegion: string;
        authKey: string;
      }) => Promise<void>;
      login: (params: { uid: string }) => Promise<void>;
      launch: (params: {
        widgetID: string;
        target?: string;
        roundedCorners: "true" | "false";
        height: string;
        width: string;
        defaultID: string;
        defaultType: "user" | "group";
        docked: "true" | "false";
        alignment: "left" | "right";
      }) => Promise<void>;
      logout: () => Promise<void>;
      on: (
        event: "onMessageReceived" | "openChat" | "closeChat" | "onItemClick",
        callback: (args: any) => void,
      ) => void;
    };
  }
}

const useCometChatWidget = () => {
  const { data: currentUser } = useUserData();
  const { data: accessToken } = useAccessToken();
  const [loaded, setLoaded] = useState(false);
  const { mutateAsync: syncCometChatFriends } = useSyncCometChatFriends();
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://widget-js.cometchat.io/v3/cometchatwidget.js";
    script.defer = true;
    script.addEventListener("load", () => setLoaded(true));
    window.addEventListener("unload", () => setLoaded(false));
    window.document.body.appendChild(script);

    return () => {
      window.removeEventListener("unload", () => setLoaded(false));
      script.removeEventListener("load", () => setLoaded(true));
      window.document.body.removeChild(script);
    };
  }, []);

  const addCometChat = useCallback(async () => {
    const { CometChatWidget } = window;
    if (!CometChatWidget) {
      return;
    }
    const element = window.document.getElementById("cometchat__widget");
    if (element) {
      return;
    }
    await syncCometChatFriends();
    CometChatWidget.init({
      appID: EnvConfig.VITE_COMET_CHAT_APP_ID,
      appRegion: EnvConfig.VITE_COMET_CHAT_REGION,
      authKey: EnvConfig.VITE_COMET_CHAT_AUTH_KEY,
    }).then(
      () => {
        CometChatWidget.login({
          uid: currentUser?.cometChatId ?? "",
        }).then(
          () => {
            CometChatWidget.launch({
              widgetID: EnvConfig.VITE_COMET_WIDGET_ID,
              roundedCorners: "true",
              height: "600px",
              width: "800px",
              defaultID: "",
              defaultType: "user",
              docked: "true",
              alignment: "right",
            }).then(() => {
              const element = window.document.getElementById("cometchat__widget");
              element?.style.setProperty("height", "0");
              CometChatWidget.on("openChat", () => {
                syncCometChatFriends();
              });
            });
          },
          (error: any) => {
            console.log("CometChat user login failed with error:", error);
          },
        );
      },
      (error: any) => {
        console.log("CometChat initialization failed with error:", error);
      },
    );
  }, [currentUser?.cometChatId, syncCometChatFriends]);

  const removeCometChat = useCallback(() => {
    const { CometChatWidget } = window;
    if (!CometChatWidget) {
      return;
    }
    CometChatWidget.logout().then(() => {
      const element = window.document.getElementById("cometchat__widget");
      element?.remove();
    }),
      (error: any) => {
        console.log("CometChat user failed to logout with error: ", error);
      };
  }, []);

  useEffect(() => {
    if (loaded) {
      currentUser?.cometChatId && accessToken ? addCometChat() : removeCometChat();
    }
  }, [accessToken, addCometChat, currentUser?.cometChatId, loaded, removeCometChat]);
};

export default useCometChatWidget;
