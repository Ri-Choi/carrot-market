"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import crypto from "crypto";
import loginUser from "@/lib/login";
import twilio from "twilio";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "잘못된 번호 형식입니다."
  );

const tokenExists = async (token: number) => {
  const exist = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });

  return Boolean(exist);
};

const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "토큰이 존재하지 않습니다.");

interface ActionState {
  token: boolean;
}

const getToken = async () => {
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });
  if (exists) {
    return getToken();
  } else {
    return token;
  }
};

const smsLogin = async (preState: ActionState, formData: FormData) => {
  const phone = formData.get("phone");
  const token = formData.get("token");

  if (!preState.token) {
    //사용자가 전화번호만 입력하는 첫번째 상황일때
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return {
        token: false,
        error: result.error.flatten(),
      };
    } else {
      //1. 이전 토큰 모두 삭제
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data,
          },
        },
      });
      //2. 토큰 생성
      const token = await getToken();

      await db.sMSToken.create({
        data: {
          token,
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });

      //3. send token
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages.create({
        body: `Your Carrot verification code is :${token}`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: process.env.MY_PHONE_NUMBER!, //원래는 유저가 입력한 input 값 = result.data여야함
      });

      return { token: true };
    }
  } else {
    //유효한 전화번호를 입력하고 토큰 검증을 할때
    const result = await tokenSchema.spa(token);

    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      //1.토큰이 존재하는지 확인 -> zod 유효성검사
      //2.유저 로그인 시키기
      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
        },
        select: {
          id: true,
          userId: true,
        },
      });

      await loginUser(token!.userId);
      await db.sMSToken.delete({
        where: {
          id: token!.id,
        },
      });

      redirect("/profile");
    }
  }
};

export default smsLogin;
