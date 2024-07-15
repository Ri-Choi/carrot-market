"use server"; // 이 함수가 서버에서만 실행되도록
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import getSession from "@/lib/session";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  return Boolean(user);
};

const formSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase()
    .refine(checkEmailExists, "이메일을 사용하는 계정이 존재하지 않습니다."),
  password: z.string({
    required_error: "비밀번호를 입력하세요.",
  }),
  // .min(PASSWORD_MIN_LENGTH)
  // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

const login = async (preState: any, formData: FormData) => {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = await formSchema.spa(data); //refine 에서 aync/await이 필요하기 때문에 spa

  if (!result.success) {
    return result.error.flatten();
  } else {
    //1. 입력한 email을 가진 유저를 찾는다. 없으면 에러 -> 유효성 검사 파트로 GO
    //2. 유저가 있다면 비밀번호가 맞는지 확인한다.
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    const ok = await bcrypt.compare(
      result.data.password,
      user!.password ?? "xxxx"
    );

    //3. 로그인
    if (ok) {
      const session = await getSession();
      session.id = user!.id;
      await session.save();

      redirect("profile");
    } else {
      return {
        fieldErrors: {
          password: ["잘못된 비밀번호입니다."],
          email: [],
        },
      };
    }
  }
};

export default login;
