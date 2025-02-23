const authorize = ({
  default_avatar_id: defaultAvatarId,
  display_name: displayName,
}) => {
  const avatarHtml = `<div class="avatar" style="background-image:url('https://avatars.mds.yandex.net/getyapic/${defaultAvatarId}/islands-middle')"></div>`;
  const nameHtml = `<div class="name">${avatarHtml}${nameHtml}`;

  document.getElementById("auth").innerHTML = `${avatarHtml}${nameHtml}`;
};

const fetchYandexData = (token) =>
  fetch(`https://login.yandex.ru/info?format=json&oauth_token=${token}`).then(
    (res) => res.json()
  );


window.onload = () => {
  document.getElementById("suggest").onclick = () => {
    window.YaAuthSuggest.init(
      {
        client_id: "7cd4e6df492d4ce3b3245a151ec61604",
        response_type: "token",
        redirect_uri: "https://oauth-master-class-one.vercel.app?do=auth-social&provider=yandex",
      },
      "https://oauth-master-class-one.vercel.app",
      
    )
      .then(({ handler }) => handler())
      .then(async(data) => {
        const result = await fetchYandexData(data.access_token);

        authorize(result);

        console.log(result, data);
      })
      .catch((error) => console.log("Что-то пошло не так: ", error));
  };
};
