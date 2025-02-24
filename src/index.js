const clientId = "7cd4e6df492d4ce3b3245a151ec61604"; 
const clientSecret = "8c1226eddce045bfaf5e8c51025b2b85"; // Замени на свой
const redirectUri = "https://oauth-master-class-one.vercel.app/";

const authorize = ({ default_avatar_id: defaultAvatarId, display_name: displayName, real_name: realName }) => {
  const authContainer = document.getElementById("auth");
  const buttonsContainer = document.querySelector(".buttons"); // Контейнер кнопки авторизации

  if (!authContainer || !buttonsContainer) {
      console.error("Элементы #auth или .buttons не найдены в DOM");
      return;
  }

  const avatarHtml = `<div class="avatar" style="background-image:url('https://avatars.yandex.net/get-yapic/${defaultAvatarId}/islands-middle')"></div>`;
  const nameHtml = `<div class="name">${displayName}</div>`;
  const logoutButton = `<button id="logout">Выйти</button>`;

  document.getElementById("greeting").innerText = `Привет, ${realName}! Добро пожаловать на сайт!`;

  // Обновляем блок авторизации
  authContainer.innerHTML = `${avatarHtml}${nameHtml}`;

  // Убираем кнопку "Авторизоваться" и добавляем "Выйти"
  buttonsContainer.innerHTML = logoutButton;

  // Добавляем обработчик выхода
  document.getElementById("logout").addEventListener("click", logout);
};

const fetchYandexData = (token) =>
  fetch(`https://login.yandex.ru/info?format=json&oauth_token=${token}`).then((res) => res.json());

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

const exchangeCodeForToken = async (code) => {
   // Должно совпадать с указанным в Яндекс OAuth

  const tokenUrl = "https://oauth.yandex.ru/token";
  
  const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
  });

  try {
      const response = await fetch(tokenUrl, {
          method: "POST",
          headers: {
              "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
      });

      const data = await response.json();

      if (data.access_token) {
          console.log("Получен токен:", data.access_token);
          saveToken(data.access_token);

          const userData = await fetchYandexData(data.access_token);
          authorize(userData);

          // Очистка URL от ?code=...
          window.history.replaceState(null, "", "/");
      } else {
          console.error("Ошибка получения токена:", data);
      }
  } catch (error) {
      console.error("Ошибка обмена кода на токен:", error);
  }
};



window.onload = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const authCode = urlParams.get("code"); // Извлекаем код из URL

    if (authCode) {
        console.log("Получен код авторизации:", authCode);
        await exchangeCodeForToken(authCode); // Обмен кода на токен
        return;
    }

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


  // Если пользователь не авторизован, показываем кнопку входа
  document.querySelector(".buttons").innerHTML = 
  `<button id="suggest1">Авторизоваться через Яндекс</button>
   <button id="suggest2">Авторизоваться через запрос Oauth-токена</button>`;

  document.getElementById("suggest1").onclick = () => {
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

  document.getElementById("suggest2").addEventListener("click", function () {
    const clientId = "7cd4e6df492d4ce3b3245a151ec61604"; // Замените на ваш client_id
    const redirectUri = "https://oauth-master-class-one.vercel.app/"; // URL, куда Яндекс отправит код
    const scope = "login:email login:info"; // Разрешения

    const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
    
    localStorage.setItem("last_auth_url", authUrl); // Сохранение перед редиректом
    console.log(authUrl);

    window.location.href = authUrl;
});


};
