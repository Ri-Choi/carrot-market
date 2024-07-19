// route 파일로 URL의 특정 HTTP method handler를 만들 수 있다.
// HTML 이나 react.js 를 리턴하고싶지 않을 때
import { redirect } from "next/navigation";

export function GET() {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const params = {
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user, user:email",
    allow_signup: "true",
  };
  const formattedParams = new URLSearchParams(params).toString();
  const finalUrl = `${baseUrl}?${formattedParams}`;
  return redirect(finalUrl);
}
