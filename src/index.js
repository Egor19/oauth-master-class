


const authorize = ({
  default_avatar_id: defaultAvatarId,
  display_name: displayName,
  real_name: realName
  
  
}) => {
  const avatarHtml = `<div class="avatar" style="background-image:url('https://avatars.yandex.net/get-yapic/${defaultAvatarId}/islands-middle')"></div>`;
  const nameHtml = `<div class="name">${displayName}</div>`;

  document.getElementById("greeting").innerText = `Привет, ${realName}! Добро пожаловать на сайт!`;

  document.getElementById("auth").innerHTML = `${avatarHtml}${nameHtml}`;

  document.getElementById("logout").addEventListener("click", logout);
};

const fetchYandexData = (token) =>
  fetch(`https://login.yandex.ru/info?format=json&oauth_token=${token}`).then(
    (res) => res.json()
  );

  const saveToken = (token) => {
    localStorage.setItem("yandex_token", token);
};

const getToken = () => {
    return localStorage.getItem("yandex_token");
};

const logout = () => {
    localStorage.removeItem("yandex_token");
    location.reload();
};

window.onload = async () => {
  const savedToken = getToken();

    if (savedToken) {
        const userData = await fetchYandexData(savedToken);
        if (userData.display_name) {
            authorize(userData);
            return;
        } else {
            logout(); // Если токен невалидный, выходим
        }
    }

    document.getElementById("suggest").onclick = () => {
        YaAuthSuggest.init(
            {
                client_id: "7cd4e6df492d4ce3b3245a151ec61604",
                response_type: "token",
                redirect_uri: "https://oauth-master-class-one.vercel.app/token.html",
            },
            "https://oauth-master-class-one.vercel.app"
        )
        .then(({ handler }) => handler())
        .then(async (data) => {
            saveToken(data.access_token);
            const result = await fetchYandexData(data.access_token);
            authorize(result);
        })
        .catch((error) => console.log("Ошибка авторизации: ", error));
    };
};
