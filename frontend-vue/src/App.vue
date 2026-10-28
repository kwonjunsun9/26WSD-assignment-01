<script setup>
import { ref, onMounted } from "vue";
import { api, login, getSession, clearSession, canEdit } from "./api";
const posts = ref([]),
  selected = ref(null),
  title = ref(""),
  content = ref(""),
  editing = ref(null);
const email = ref("alice@class.test"),
  password = ref("Classroom!2026"),
  user = ref(null),
  busy = ref(false),
  message = ref("게시판을 불러오는 중입니다.");
const refresh = async () => {
  posts.value = await api.list();
};

// 전달받은 작업을 실행하고 성공·오류 메시지를 표시합니다.
// 401은 오류별로 안내하고, 404는 선택을 해제한 뒤 목록을 갱신합니다.
// 작업 종료 시 메모리 세션의 사용자 정보를 화면에 반영합니다.
async function run(action, success) {
  busy.value = true;

  try {
    await action();
    message.value = success;
  } catch (e) {
    // 401 오류의 code에 따라 로그인 실패, 토큰 누락, 변조, 만료를 안내합니다.
    const authMessages = {
      INVALID_CREDENTIALS:
        "이메일 또는 비밀번호를 확인한 뒤 다시 로그인하세요.",
      TOKEN_REQUIRED:
        "로그인이 필요합니다. 로그인 후 다시 시도하세요.",
      INVALID_TOKEN:
        "로그인 정보가 유효하지 않습니다. 다시 로그인하세요.",
      TOKEN_EXPIRED:
        "로그인 시간이 만료되었습니다. 다시 로그인하세요.",
    };

    message.value =
      e.status === 401
        ? authMessages[e.code] || "인증에 실패했습니다. 다시 로그인하세요."
        : e.message;

    // 없는 글이면 상세,수정 선택을 해제하고 목록을 다시 조회합니다. 목록 재조회도 실패하면 원래 오류와 재조회 오류를 함께 안내합니다.
    if (e.status === 404 && e.code === "NOT_FOUND") {
      selected.value = null;
      editing.value = null;

      try {
        await refresh();
      } catch (refreshError) {
        message.value =
          `${e.message} 목록을 다시 불러오지 못했습니다. ` +
          refreshError.message;
      }
    }
  } finally {
    user.value = getSession().user;
    busy.value = false;
  }
}

onMounted(() => run(refresh, "게시판이 준비되었습니다."));

function reset() {
  title.value = "";
  content.value = "";
  editing.value = null;
}

// 비로그인 상태에서 저장을 누르면 API 호출 전에 로그인 안내를 표시합니다.
function save() {
  if (!getSession().user) {
    message.value = "글을 작성하려면 먼저 로그인하세요.";
    return;
  }

  run(async () => {
    const input = { title: title.value, content: content.value };
    selected.value = editing.value
      ? await api.update(editing.value, input)
      : await api.create(input);
    reset();
    await refresh();
  }, "게시글을 저장했습니다.");
}

function edit() {
  editing.value = selected.value.id;
  title.value = selected.value.title;
  content.value = selected.value.content;
}

function remove() {
  if (confirm("게시글을 삭제할까요?"))
    run(async () => {
      await api.remove(selected.value.id);
      selected.value = null;
      reset();
      await refresh();
    }, "게시글을 삭제했습니다.");
}

// 기존 세션 해제에 작성,수정 초기화와 로그아웃 안내를 추가했습니다. 
function logout() {
  clearSession();
  user.value = null;
  reset();
  message.value = "로그아웃 되었습니다.";
}

function me() {
  run(async () => {
    const u = await api.me();
    alert(`${u.name} (${u.email})`);
  }, "내 정보 조회를 완료했습니다.");
}

// 서비스 제목과 소개 문구, 안내 문구 등을 수정하였습니다. 로그인 안내 문구를 추가하고, 게시글 작성 안내 문구를 수정했습니다.
</script>
<template>
  <main>
    <header>
      <span class="eyebrow">맛잇게 먹으면 0칼로리. "배부르면 행복합니다!"에 오신걸 환영합니다!</span>
      <h1>배부르면 행복합니다! - 맛집 공유 게시판</h1>
      <p class="muted">
        식당 이름,위치 그리고 정성스러운 후기를 적어 맛집을 공유해 주세요.
      </p>
    </header>
    <p class="banner">
      맛집을 알고 싶은 자, 누구나에게 열려 있습니다.
      <br/>글 작성은 로그인 후 가능하며, 수정과 삭제는 작성자 본인만 가능합니다.
    </p>
    <div role="status" class="message">{{ message }}</div>
    <div class="grid">
      <aside>
        <section class="card">
          <h2>로그인</h2>
          <p>{{ user ? `${user.name}님이 로그인 중입니다.` : "현재 로그아웃 상태입니다." }}</p>
          <form
            @submit.prevent="
              run(() => login(email, password), '로그인을 성공했습니다.')
            "
          >
            <label>이메일<input type="email" v-model="email" required /></label
            ><label
              >비밀번호<input type="password" maxlength="128" v-model="password" required
            /></label>
            <!-- 로그아웃 버튼은 로그인 중에만 표시하고 요청 중에는 비활성화합니다. -->
            <div class="actions">
              <button :disabled="busy">로그인</button
              ><button v-if="user" type="button" class="secondary" :disabled="busy" @click="logout">
                로그아웃
              </button>
            </div>
          </form>
          <p>
          </p>
          <button class="secondary" :disabled="busy" @click="me">
            내 정보 조회
          </button>
        </section>
        <section class="card">
          <h2>{{ editing ? "게시글 수정" : "새 글 작성" }}</h2>
          <!-- 로그아웃 상태에서 글쓰기 전에 로그인 안내를 표시합니다. -->
          <p v-if="!user" class="muted">
          글을 작성하려면 먼저 로그인이 필요합니다.
          </p>
          <form @submit.prevent="save">
            <label>제목<input maxlength="100" v-model="title" required /></label
            ><label
              >내용<textarea maxlength="5000" v-model="content" required />
            </label>
            <div class="actions">
              <button :disabled="busy">
                {{ editing ? "수정 저장" : "등록" }}</button
              ><button type="button" class="secondary" @click="reset">
                입력 초기화
              </button>
            </div>
          </form>
        </section>
      </aside>
      <div>
        <section class="card">
          <h2>
            게시글 목록 <small>{{ posts.length }}개</small>
          </h2>
          <p v-if="!posts.length">첫 번째 게시글을 남겨주세요.</p>
          <article class="post" v-for="p in posts" :key="p.id">
            <button
              class="post-title"
              :disabled="busy"
              @click="
                run(
                  async () => (selected = await api.detail(p.id)),
                  '게시글을 불러왔습니다.',
                )
              "
            >
              {{ p.title }}
            </button>
            <p>
              <small
                >{{ p.authorName }} ·
                {{ new Date(p.createdAt).toLocaleString() }}</small
              >
            </p>
          </article>
        </section>
        <section class="card">
          <h2>게시글 상세</h2>
          <template v-if="selected"
            ><h3>{{ selected.title }}</h3>
            <p class="content">{{ selected.content }}</p>
            <p>
              <small>작성자 {{ selected.authorName }}</small>
            </p>
            <div class="actions" v-if="canEdit(selected)">
              <button class="secondary" @click="edit">수정</button
              ><button class="danger" :disabled="busy" @click="remove">
                삭제
              </button>
            </div></template
          >
          <p class="muted" v-else>목록에서 제목을 클릭하세요.</p>
        </section>
      </div>
    </div>
  </main>
</template>
