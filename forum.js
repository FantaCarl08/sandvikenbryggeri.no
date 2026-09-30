(function () {
  var form = document.getElementById("forum-form");
  var authorInput = document.getElementById("forum-author");
  var bodyInput = document.getElementById("forum-body");
  var websiteInput = document.getElementById("forum-website");
  var submitButton = document.getElementById("forum-submit");
  var composeDialog = document.getElementById("compose-dialog");
  var openComposeButton = document.getElementById("open-compose");
  var closeComposeButton = document.getElementById("close-compose");
  var postList = document.getElementById("forum-posts");
  var emptyMessage = document.getElementById("forum-empty");
  var statusMessage = document.getElementById("forum-status");
  var errorMessage = document.getElementById("forum-error");
  var pageSize = 500;
  var client;

  function initForumLogo() {
    var logo = document.getElementById("forum-title");
    if (!logo) return;

    var layerCount = 32;
    var step = 0.013;
    var half = (layerCount * step) / 2;
    for (var index = 0; index < layerCount; index++) {
      var layer = document.createElement("span");
      layer.className = "layer" + (index === 0 ? "" : " back");
      layer.setAttribute("aria-hidden", "true");
      layer.textContent = "Forum";
      layer.style.transform = "translateZ(" + (half - index * step) + "em)";
      layer.style.color = index === 0 ? "var(--front)" : "var(--side)";
      logo.appendChild(layer);
    }
  }

  initForumLogo();

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

  async function loadPosts() {
    setError("");
    setStatus("Laster innlegg …");

    var posts = [];
    var offset = 0;
    var result;
    do {
      result = await client
        .from("forum_posts")
        .select("id, author, body, created_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (result.error) {
        setStatus("");
        setError("Kunne ikke hente innlegg. Prøv å laste siden på nytt.");
        return;
      }

      posts = posts.concat(result.data);
      offset += result.data.length;
    } while (result.data.length === pageSize);

    postList.replaceChildren();
    posts.forEach(function (post) {
      postList.appendChild(createPostElement(post));
    });
    emptyMessage.hidden = posts.length > 0;
    setStatus("");
  }

  openComposeButton.addEventListener("click", function () {
    composeDialog.showModal();
    authorInput.focus();
  });
  closeComposeButton.addEventListener("click", function () { composeDialog.close(); });
  composeDialog.addEventListener("click", function (event) {
    if (event.target === composeDialog) composeDialog.close();
  });

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
    composeDialog.close();
    await loadPosts();
    setStatus("Innlegget er publisert.");
  });
})();
