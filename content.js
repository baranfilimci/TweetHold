(() => {
  const STORAGE_KEY = "savedTweets";
  const MAX_TWEETS = 50;
  const TWEET_SELECTOR = 'article[data-testid="tweet"]';
  const STATUS_LINK_SELECTOR = 'a[href*="/status/"]';
  const TWEET_TEXT_SELECTOR = '[data-testid="tweetText"]';
  const TWEET_PHOTO_SELECTOR = '[data-testid="tweetPhoto"] img';
  const USER_NAME_SELECTOR = '[data-testid="User-Name"]';
  const AVATAR_IMAGE_SELECTOR = '[data-testid="Tweet-Avatar"] img';

  const seenArticleElements = new WeakSet();
  let saveQueue = [];
  let saveTimer = null;
  let cachedHref = "";
  let cachedCanCollect = false;

  function toAbsoluteUrl(href) {
    try {
      return new URL(href, location.origin).toString();
    } catch (error) {
      return "";
    }
  }

  function getTweetData(articleEl) {
    const tweetText = articleEl.querySelector(TWEET_TEXT_SELECTOR)?.innerText?.trim() || "";
    const rawLink = articleEl.querySelector(STATUS_LINK_SELECTOR)?.getAttribute("href") || "";
    const tweetLink = rawLink ? toAbsoluteUrl(rawLink) : "";
    const imageSrc = articleEl.querySelector(TWEET_PHOTO_SELECTOR)?.getAttribute("src") || null;
    const { authorDisplayName, authorUsername } = extractAuthorMeta(articleEl);
    const authorProfilePicUrl =
      articleEl.querySelector(AVATAR_IMAGE_SELECTOR)?.getAttribute("src") || null;

    return {
      tweetText,
      tweetLink,
      imageSrc,
      authorDisplayName,
      authorUsername,
      authorProfilePicUrl
    };
  }

  function extractAuthorMeta(articleEl) {
    const userNameEl = articleEl.querySelector(USER_NAME_SELECTOR);
    if (!userNameEl) {
      return {
        authorDisplayName: "",
        authorUsername: ""
      };
    }

    const fullText = userNameEl.innerText?.replace(/\s+/g, " ").trim() || "";
    const usernameMatch = fullText.match(/@([A-Za-z0-9_]{1,15})/);
    const authorUsername = usernameMatch ? usernameMatch[1] : "";

    const spanTexts = Array.from(userNameEl.querySelectorAll("span"))
      .map((span) => span.innerText?.trim() || "")
      .filter(Boolean);
    const displayFromSpans = spanTexts.find((value) => !value.startsWith("@"));

    let authorDisplayName = displayFromSpans || "";
    if (!authorDisplayName && fullText) {
      authorDisplayName = fullText
        .replace(/@([A-Za-z0-9_]{1,15})/, "")
        .replace(/\s+·.*/, "")
        .trim();
    }

    return {
      authorDisplayName,
      authorUsername
    };
  }

  function canCollectOnCurrentPage() {
    const href = window.location.href;
    if (href === cachedHref) {
      return cachedCanCollect;
    }

    cachedHref = href;
    const { pathname } = window.location;
    const isStatusPage = pathname.includes("/status/");
    const isHomePage = pathname === "/home";
    const isListPage = pathname.startsWith("/i/lists");
    const isExplorePage = pathname.startsWith("/explore");

    cachedCanCollect = !isStatusPage && (isHomePage || isListPage || isExplorePage);
    console.log("[RecentTweetsMemory] Page eligibility:", cachedCanCollect, pathname);
    return cachedCanCollect;
  }

  function enqueueTweetSave(tweet) {
    saveQueue.push(tweet);
    if (saveTimer) {
      return;
    }

    // Debounce batched writes for smooth scrolling performance.
    saveTimer = window.setTimeout(flushTweetQueue, 250);
  }

  function flushTweetQueue() {
    const queuedTweets = saveQueue;
    saveQueue = [];
    saveTimer = null;

    if (!queuedTweets.length) {
      return;
    }

    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const current = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
      const urls = new Set(current.map((item) => item.url));
      const next = [...current];
      let addedCount = 0;

      // LIFO: newest first.
      for (let i = queuedTweets.length - 1; i >= 0; i -= 1) {
        const tweet = queuedTweets[i];
        if (!tweet.url || urls.has(tweet.url)) {
          continue;
        }
        urls.add(tweet.url);
        next.unshift(tweet);
        addedCount += 1;
      }

      if (next.length > MAX_TWEETS) {
        next.length = MAX_TWEETS;
      }

      chrome.storage.local.set({ [STORAGE_KEY]: next }, () => {
        if (addedCount > 0) {
          console.log("[RecentTweetsMemory] Saved to storage:", addedCount, "new tweet(s)");
          chrome.runtime.sendMessage({ action: "tweetSaved" });
        } else {
          console.log("[RecentTweetsMemory] No new tweets to save (duplicates or invalid)");
        }
      });
    });
  }

  function collectTweetFromArticle(articleEl) {
    if (!canCollectOnCurrentPage()) {
      return;
    }

    if (seenArticleElements.has(articleEl)) {
      console.log("[RecentTweetsMemory] Skipping already seen article");
      return;
    }
    seenArticleElements.add(articleEl);

    console.log("[RecentTweetsMemory] Tweet detected");

    const { tweetText, tweetLink, imageSrc, authorDisplayName, authorUsername, authorProfilePicUrl } =
      getTweetData(articleEl);
    console.log("[RecentTweetsMemory] URL extracted:", tweetLink || "none");
    console.log("[RecentTweetsMemory] Text extracted:", tweetText ? "yes" : "no");
    console.log("[RecentTweetsMemory] Image found:", imageSrc ? "yes" : "no");

    if (!tweetLink || !tweetText) {
      console.log("[RecentTweetsMemory] Skipping tweet due to missing link or text");
      return;
    }

    enqueueTweetSave({
      url: tweetLink,
      text: tweetText,
      imageSrc,
      authorDisplayName,
      authorUsername,
      authorProfilePicUrl,
      savedAt: Date.now()
    });
    console.log("[RecentTweetsMemory] Queued tweet for saving");
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!canCollectOnCurrentPage()) {
        return;
      }

      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }
        collectTweetFromArticle(entry.target);
      }
    },
    {
      root: null,
      threshold: 0.5
    }
  );

  function observeExistingTweets() {
    const tweetArticles = document.querySelectorAll(TWEET_SELECTOR);
    for (const article of tweetArticles) {
      observer.observe(article);
    }
  }

  const mutationObserver = new MutationObserver(() => {
    observeExistingTweets();
  });

  observeExistingTweets();
  mutationObserver.observe(document.body, { childList: true, subtree: true });
})();
