import { ApiError } from "./errors.js";
import jwt from "jsonwebtoken";
import { findPublic } from "./users.js";
// JWT 서명, 검증 라이브러리와 실제 사용자 조회 함수를 연결하고 환경변수의 JWT_SECRET이 64자리 16진수인지 서버 시작 시 검사한다.

const secretHex = process.env.JWT_SECRET;

if (typeof secretHex !== "string" || !/^[0-9a-fA-F]{64}$/.test(secretHex)) {
  throw new Error("JWT_SECRET에 새로 생성한 64자리 16진수 키를 설정하세요.");
}

// 64자리 16진수 문자열을 발급·검증에 사용할 32바이트 키로 변환한다.
const jwtKey = Buffer.from(secretHex, "hex");
// TTL은 초 단위이며, 발급자(iss)와 대상(aud)는 발급·검증에 같은 값을 사용한다.
const tokenTtl = Number(process.env.TOKEN_TTL || 90);
const issuer = process.env.JWT_ISSUER || "webservice-class";
const audience = process.env.JWT_AUDIENCE || "board-api";

// TTL 설정 오류를 로그인 요청 전에 발견하도록 양의 안전한 정수인지 검사한다.
if (!Number.isSafeInteger(tokenTtl) || tokenTtl <= 0) {
  throw new Error("TOKEN_TTL은 초 단위의 양의 정수여야 합니다.");
}

// 초기의 미구현 오류 반환을 HS256 JWT 발급으로 교체했습니다.
// 사용자 ID는 문자열 sub로 넣고 exp·iss·aud를 설정합니다.
export function issueToken(user) {
  return jwt.sign({}, jwtKey, {
    algorithm: "HS256",
    subject: String(user.id),
    expiresIn: tokenTtl,
    issuer,
    audience,
  });
}

// Bearer JWT를 검증한 실제 사용자 ID를 반환합니다. 토큰 누락, 형식 오류, 유효하지 않은 토큰, 만료를 각각 구분한다.

export function currentUserId(req) {
  const authorization = req.get("Authorization");
  const match =
    typeof authorization === "string"
      ? /^Bearer +(\S+)$/i.exec(authorization)
      : null;

  if (!match) {
    throw new ApiError(401, "TOKEN_REQUIRED", "Bearer 토큰을 보내세요.");
  }

  const token = match[1];
  const options = {
    algorithms: ["HS256"],
    issuer,
    audience,
  };

  let payload;
  let expired = false;

  try {
    try {
      payload = jwt.verify(token, jwtKey, options);
    } catch (error) {
      if (!(error instanceof jwt.TokenExpiredError)) {
        throw error;
      }

      // 만료 오류이면 만료 검사만 제외하고 다시 검증합니다. 다른 검증도 통과해야 마지막에 TOKEN_EXPIRED로 구분하며, 인증을 허용하지 않는다.

      payload = jwt.verify(token, jwtKey, {
        ...options,
        ignoreExpiration: true,
      });
      expired = true;
    }
  } catch {
    throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");
  }

  // exp의 존재, 유한한 숫자인지, 양의 정수 문자열 sub를 검사합니다.
  if (
    !payload ||
    typeof payload !== "object" ||
    !Number.isFinite(payload.exp) ||
    typeof payload.sub !== "string" ||
    !/^[1-9]\d*$/.test(payload.sub)
  ) {
    throw new ApiError(
      401,
      "INVALID_TOKEN",
      "토큰의 필수 클레임을 확인하세요.",
    );
  }

  const userId = Number(payload.sub);

  if (!Number.isSafeInteger(userId) || !findPublic(userId)) {
    throw new ApiError(401, "INVALID_TOKEN", "사용자를 확인할 수 없습니다.");
  }

  if (expired) {
    throw new ApiError(
      401,
      "TOKEN_EXPIRED",
      "로그인 시간이 만료되었습니다. 다시 로그인하세요.",
    );
  }

  return userId;
}

// 타인의 수정, 삭제를 403으로 거부하도록 하였습니다. userId는 검증된 JWT에서, authorId는 서버가 조회한 게시글에서 가져옵니다.

export function assertOwner(userId, authorId) {
  if (userId !== authorId) {
    throw new ApiError(403, "FORBIDDEN", "작성자만 수정·삭제할 수 있습니다.");
  }
}
