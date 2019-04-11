import { ChromeApi, ChromeStorageItems } from "../chrome";
import { GitHubState } from "./github";
import { Storage } from "./storage/helper";
import { LastCheck } from "./storage/last-check";
import { MuteConfiguration } from "./storage/mute";
import { Store } from "./storage/store";

describe("GitHubState", () => {
  it("does something", async () => {
    const chrome = fakeChrome();
    const store = mockStore();
    const github = new GitHubState(chrome.chromeApi, store);
    await github.load();
  });
});

function mockStore(): Store {
  return {
    lastError: mockStorage<string | null>(),
    lastCheck: mockStorage<LastCheck | null>(),
    muteConfiguration: mockStorage<MuteConfiguration>(),
    notifiedPullRequests: mockStorage<string[]>(),
    token: mockStorage<string | null>()
  };
}

function mockStorage<T>(): Storage<T> {
  return {
    load: jest.fn(),
    save: jest.fn()
  };
}

function fakeChrome() {
  const badge = {
    text: "",
    color: <string | chrome.browserAction.ColorArray>"default"
  };
  const fakeLocalStorage: ChromeStorageItems = {};
  const messageListeners: any[] = [];
  const sentMessages: any[] = [];
  const chromeApi = (<Partial<ChromeApi>>{
    browserAction: {
      setBadgeText(details: chrome.browserAction.BadgeTextDetails) {
        badge.text = details.text;
      },
      setBadgeBackgroundColor(
        details: chrome.browserAction.BadgeBackgroundColorDetails
      ) {
        badge.color = details.color;
      }
    },
    runtime: {
      sendMessage(message: any) {
        sentMessages.push(message);
      },
      onMessage: {
        addListener(listener: any) {
          messageListeners.push(listener);
        }
      }
    },
    storage: {
      local: {
        set(items: ChromeStorageItems, callback) {
          for (const [key, value] of Object.entries(items)) {
            fakeLocalStorage[key] = value;
          }
          if (callback) {
            callback();
          }
        },
        get(keys: string[], callback: (items: ChromeStorageItems) => void) {
          callback(
            keys.reduce<ChromeStorageItems>((acc, key) => {
              acc[key] = fakeLocalStorage[key];
              return acc;
            }, {})
          );
        }
      }
    }
  }) as ChromeApi;
  return {
    chromeApi,
    fakeLocalStorage,
    sentMessages
  };
}