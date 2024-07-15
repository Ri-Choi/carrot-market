import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

interface Routes {
  [key: string]: Boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/create_account": true,
  "/sms": true,
};

export default async function middleware(request: NextRequest) {
  const session = await getSession();
  const exist = publicOnlyUrls[request.nextUrl.pathname];

  if (!session.id) {
    if (!exist) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (exist) {
      return NextResponse.redirect(new URL("/product", request.url));
    }
  }
}

export const config = {
  //미들웨어를 실행하고 싶은 path를 입력하거나 미들웨어를 실행하기 싫은 URL을 필터링 할 정규식을 입력
  // matcher: ["/", "/profile", "/create-account", "/user/:path*"],
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
