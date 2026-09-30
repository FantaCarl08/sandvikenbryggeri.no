(function () {
  var form = document.getElementById("forum-form");
  var authorInput = document.getElementById("forum-author");
  var bodyInput = document.getElementById("forum-body");
  var websiteInput = document.getElementById("forum-website");
  var submitButton = document.getElementById("forum-submit");
  var postList = document.getElementById("forum-posts");
  var emptyMessage = document.getElementById("forum-empty");
  var loadMoreButton = document.getElementById("load-more");
  var statusMessage = document.getElementById("forum-status");
  var errorMessage = document.getElementById("forum-error");
  var pageSize = 50;
  var loadedCount = 0;
  var client;

  function setStatus(message) {
    statusMessage.textContent = message;
  }

  function setError(message) {
    errorMessage.textContent = message;
  }

  function createPostElement(post) {
    var item = document.createElement("li");
    var article = document.createElement("article");
    var meta = document.createElement("div");
    var author = document.createElement("span");
    var time = document.createElement("time");
    var body = document.createElement("p");
    var date = new Date(post.created_at);

    item.className = "post";
    meta.className = "post-meta";
    author.className = "post-author";
    author.textContent = post.author;
    time.dateTime = date.toISOString();
    time.textContent = new Intl.DateTimeFormat("nb-NO", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
    body.className = "post-body";
    body.textContent = post.body;
    meta.append(author, time);
    article.append(meta, body);
    item.appendChild(article);
    return item;
  }

  async function loadPosts(append) {
    setError("");
    if (!append) setStatus("Laster innlegg …");

    var start = append ? loadedCount : 0;
    var result = await client
      .from("forum_posts")
      .select("id, author, body, created_at")
      .order("created_at", { ascending: false })
      .range(start, start + pageSize - 1);

    if (result.error) {
      setStatus("");
      setError("Kunne ikke hente innlegg. Prøv å laste siden på nytt.");
      return;
    }

    if (!append) {
      postList.replaceChildren();
      loadedCount = 0;
    }

    result.data.forEach(function (post) {
      postList.appendChild(createPostElement(post));
      loadedCount += 1;
    });
    emptyMessage.hidden = loadedCount > 0;
    loadMoreButton.hidden = result.data.length < pageSize;
    setStatus("");
  }

  var config = window.FORUM_CONFIG || {};
  if (!window.supabase || !config.url || !config.anonKey) {
    setError("Forumet er ikke koblet til databasen ennå. Følg forum-oppsettet i forum-setup.md.");
    return;
  }

  client = window.supabase.createClient(config.url, config.anonKey);
  submitButton.disabled = false;
  loadPosts(false);

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    setError("");
    if (websiteInput.value) return;

    var author = authorInput.value.trim() || "Anonym";
    var body = bodyInput.value.trim();
    if (!body) {
      setError("Skriv en kommentar før du publiserer.");
      bodyInput.focus();
      return;
    }

    submitButton.disabled = true;
    setStatus("Publiserer …");
    var result = await client.from("forum_posts").insert({ author: author, body: body });
    submitButton.disabled = false;

    if (result.error) {
      setStatus("");
      setError("Innlegget kunne ikke publiseres. Prøv igjen.");
      return;
    }

    form.reset();
    setStatus("Innlegget er publisert.");
    await loadPosts(false);
  });

  loadMoreButton.addEventListener("click", function () {
    loadMoreButton.disabled = true;
    loadPosts(true).finally(function () {
      loadMoreButton.disabled = false;
    });
  });
})();
