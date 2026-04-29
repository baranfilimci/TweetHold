(() => {
  const STORAGE_KEY = "savedTweets";

  const listEl = document.getElementById("list");
  const clearBtn = document.getElementById("clearBtn");
  const statusEl = document.getElementById("status");

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function normalizeUsername(value) {
    return (value || "").replace(/^@+/, "").trim();
  }

  function createTweetCard(tweet) {
    const card = document.createElement("div");
    card.className = "tweet-card";

    const left = document.createElement("div");
    left.className = "card-left";

    const avatar = document.createElement("img");
    avatar.className = "author-avatar";
    avatar.alt = "Author profile image";
    avatar.loading = "lazy";
    avatar.src =
      tweet.authorProfilePicUrl ||
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' rx='48' fill='%23253649'/%3E%3Ccircle cx='48' cy='36' r='18' fill='%2348617d'/%3E%3Cpath d='M16 86c4-16 18-26 32-26s28 10 32 26' fill='%2348617d'/%3E%3C/svg%3E";
    left.appendChild(avatar);

    const right = document.createElement("div");
    right.className = "card-right";

    const authorMeta = document.createElement("div");
    authorMeta.className = "author-meta";

    const displayName = document.createElement("span");
    displayName.className = "author-display-name";
    displayName.textContent = tweet.authorDisplayName || "Unknown Author";

    const username = document.createElement("span");
    username.className = "author-username";
    const normalizedUsername = normalizeUsername(tweet.authorUsername);
    username.textContent = normalizedUsername ? `@${normalizedUsername}` : "@unknown";
    authorMeta.append(displayName, username);

    const tweetContent = document.createElement("div");
    tweetContent.className = "tweet-content";
    tweetContent.textContent = tweet.text || "";

    right.append(authorMeta, tweetContent);

    if (tweet.imageSrc) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "tweet-image-container";

      const mediaImage = document.createElement("img");
      mediaImage.className = "tweet-media-image";
      mediaImage.src = tweet.imageSrc;
      mediaImage.alt = "Tweet media";
      mediaImage.loading = "lazy";

      imageContainer.appendChild(mediaImage);
      right.appendChild(imageContainer);
    }

    const link = document.createElement("a");
    link.className = "tweet-link";
    link.href = tweet.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View original";

    right.appendChild(link);
    card.append(left, right);
    return card;
  }

  function renderTweets(tweets) {
    listEl.innerHTML = "";

    if (!tweets.length) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "No tweets saved yet. Scroll on X or Twitter to collect some.";
      listEl.appendChild(empty);
      setStatus("0 saved");
      return;
    }

    for (const tweet of tweets) {
      listEl.appendChild(createTweetCard(tweet));
    }
    setStatus(`${tweets.length} saved`);
  }

  function loadTweets() {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const tweets = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
      renderTweets(tweets);
    });
  }

  clearBtn.addEventListener("click", () => {
    chrome.storage.local.set({ [STORAGE_KEY]: [] }, () => {
      renderTweets([]);
    });
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message && message.action === "tweetSaved") {
      loadTweets();
    }
  });

  document.addEventListener("DOMContentLoaded", loadTweets);
})();
