"use server";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import loginUser from "@/lib/login";
import { hash } from "bcrypt";
import { redirect } from "next/navigation";
import { z } from "zod";

const checkUsername = (username: string) => !username.includes("potato");
const checkPasswords = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;
// const checkUniqueUsername = async (username: string) => {
//   const user = await db.user.findUnique({
//     where: {
//       username,
//     },
//     select: {
//       id: true,
//     },
//   });

//   return !Boolean(user);
// };
// const checkUniqueEmail = async (email: string) => {
//   const user = await db.user.findUnique({
//     where: {
//       email,
//     },
//     select: {
//       id: true,
//     },
//   });

//   return !Boolean(user);
// };

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "문자열을 입력해주세요.",
        required_error: "필수입력입니다.",
      })
      .toLowerCase()
      .trim()
      // .transform((username) => `😍${username}😍`) // return 값으로 데이터 변형 / 리턴 필수
      .refine(checkUsername, "감자 안돼요"), //refine = 커스텀 에러 함수가 true이면 통과
    email: z.string().email().toLowerCase(),
    password: z.string().min(PASSWORD_MIN_LENGTH),
    // .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 중복된 이름이 있습니다.",
        path: ["username"],
        fatal: true,
      });

      return z.NEVER; // 그 뒤에 refine 은 실행되지 X
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 중복된 이메일이 있습니다.",
        path: ["email"],
        fatal: true,
      });

      return z.NEVER; // 그 뒤에 refine 은 실행되지 X
    }
  })
  .refine(checkPasswords, {
    message: "비밀번호가 다릅니다.",
    path: ["confirm_password"],
  });

const createAccount = async (preState: any, formData: FormData) => {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };
  const result = await formSchema.safeParseAsync(data);

  if (!result.success) {
    return result.error.flatten();
  } else {
    //1. 이미 존재하는 이름이나 이메일이 있는지 검증 -> zod에서 refine으로 검증
    //2. 비밀번호 해싱 후 신규 유저 생성
    const hashedPassword = await hash(result.data.password, 12); //12번 해싱

    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassword,
      },
      select: {
        id: true,
      },
    });

    //3. 로그인 -> 사용자에게 쿠키를 주는 것
    await loginUser(user.id);
    redirect("/profile");
  }
};

export default createAccount;
