import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  id?: number;
}

export default function getSession() {
  return getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-carrot",
    password: process.env.COOKIE_PASSWORD!,
    // ! = 무조건 COOKIE_PASSWORD 값이 존재할것임
    //패스워드로 쿠키 값을 암호화 하는 것, 다시 나중에 복호화 가능
  });
}
