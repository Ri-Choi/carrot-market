import db from "@/lib/db";
import loginUser from "@/lib/login";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return new Response(null, { status: 400 });
  }
  //2. 받은 코드로 다시 요청
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenUrl = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  const accessTokenResponse = await fetch(accessTokenUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  // 액세스 토큰 get
  const { error, access_token } = await accessTokenResponse.json();

  if (error) {
    return new Response(null, { status: 400 });
  }
  //액세스 토큰으로 유저 정보 get
  const userProfileResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: "no-cache",
  });
  const { id, avatar_url, login } = await userProfileResponse.json(); //login = 깃헙 유저네임

  const user = await db.user.findUnique({
    where: {
      github_id: id + "",
    },
    select: {
      id: true,
    },
  });

  // //이미 가입한 깃헙 사용자라면 로그인 시키기
  if (user) {
    await loginUser(user.id);
    return redirect("/profile");
  }

  // //신규회원이라면 유저 생성
  const newUser = await db.user.create({
    data: {
      username: login + id,
      github_id: id + "",
      avatar: avatar_url,
    },
    select: {
      id: true,
    },
  });

  await loginUser(newUser.id);
  return redirect("/profile");
}
