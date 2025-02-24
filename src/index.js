const CLIENT_ID = "7cd4e6df492d4ce3b3245a151ec61604"; // Укажите ваш client_id
const CLIENT_SECRET = "8c1226eddce045bfaf5e8c51025b2b85"; // Укажите ваш client_secret
const REDIRECT_URI = "https://oauth-master-class-one.vercel.app/"; // Ваш redirect_uri

const authorize = ({ default_avatar_id: defaultAvatarId, display_name: displayName, real_name: realName }) => {
    const authContainer = document.getElementById("auth");
    const buttonsContainer = document.querySelector(".buttons");

    if (!authContainer || !buttonsContainer) {
        console.error("Элементы #auth или .buttons не найдены в DOM");
        return;
    }

    const avatarHtml = `<div class="avatar" style="background-image:url('https://avatars.yandex.net/get-yapic/${defaultAvatarId}/islands-middle')"></div>`;
    const nameHtml = `<div class="name">${displayName}</div>`;
    const logoutButton = `<button id="logout">Выйти</button>`;

    document.getElementById("greeting").innerText = `Привет, ${realName}! Добро пожаловать на сайт!`;

    authContainer.innerHTML = `${avatarHtml}${nameHtml}`;
    buttonsContainer.innerHTML = logoutButton;

    document.getElementById("logout").addEventListener("click", logout);
};

const fetchYandexData = (token) =>
    fetch(`https://login.yandex.ru/info?format=json&oauth_token=${token}`)
        .then((res) => res.json());

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

// Функция обмена кода на токен
const exchangeCodeForToken = async (code) => {
    const tokenUrl = "https://oauth.yandex.ru/token";
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("redirect_uri", REDIRECT_URI);

    try {
        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        });

        const data = await response.json();
        console.log("Ответ от сервера:", data);

        if (data.access_token) {
            saveToken(data.access_token);
            const result = await fetchYandexData(data.access_token);
            authorize(result);
        } else {
            console.error("Ошибка при обмене кода:", data);
        }
    } catch (error) {
        console.error("Ошибка запроса токена:", error);
    }
};

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get("code"); // Извлекаем код из URL

    if (authCode) {
        console.log("Получен код авторизации:", authCode);
        await exchangeCodeForToken(authCode);
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

    document.getElementById("suggest1").onclick = () => {
        YaAuthSuggest.init(
            {
                client_id: CLIENT_ID,
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
        const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=login:email login:info`;
        
        localStorage.setItem("last_auth_url", authUrl);
        console.log(authUrl);

        window.location.href = authUrl;
    });
};


