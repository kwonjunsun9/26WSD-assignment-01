let session = { accessToken: "", user: null };
export const getSession = () => session;
export function clearSession() {
  session = { accessToken: "", user: null };
}

// 빈 객체를 반환하던 코드를 Bearer 인증 헤더 생성으로 교체했습니다. 메모리에 토큰이 없으면 헤더를 추가하지 않습니다.
function authorizationHeaders() {
  const token = session.accessToken;

  if (!token) {return {};}

  return {Authorization: `Bearer ${token}`,};
}

export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(),
      ...options.headers,
    },
  });

  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {

    // 인증 실패(401)시 메모리 세션을 비웁니다. 403 일때는 유지합니다. 화면의 로그인 표시는 App.vue의 run()이 이 세션을 다시 읽어 갱신합니다.
    if (response.status === 401) {
      clearSession();
    }
    const error = new Error(
      data.message || data.code || `HTTP ${response.status}`,
    );
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

// 로그인 API를 호출하도록 하였습니다. 성공한 응답의 accessToken과 user를 기존 메모리 session에 저장합니다.
export async function login(email, password) {
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  session = {
    accessToken: data.accessToken,
    user: data.user,
  };

  return session.user;
}

// 항상 true던 반환값을 로그인 사용자와 작성자 ID를 비교하도록 하였습니다. 버튼 표시를 위한 검사이며, 실제 수정과 삭제 권한은 서버에서도 검사하도록 합니다.
export function canEdit(post) {
  const user = session.user;

  if (!user || !post) { return false; }

  return user.id === post.authorId;
}

export const api = {
  list: () => request("/posts"),
  detail: (id) => request(`/posts/${id}`),
  create: (input) =>
    request("/posts", { method: "POST", body: JSON.stringify(input) }),
  update: (id, input) =>
    request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  me: () => request("/me"),
};
