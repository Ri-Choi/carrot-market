import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import React from "react";

const getUser = async () => {
  const session = await getSession();

  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });

    if (user) {
      return user;
    }
  }

  notFound(); // session에 id 가 없거나, id가 있어서 유저를 찾았으나 유저가 존재하지 않을때
};

const Profile = async () => {
  const user = await getUser();
  //onClick 실행하지않고 server action 하기 위해서 form tag 생성
  const logOut = async () => {
    "use server";
    const session = await getSession();
    session.destroy();

    redirect("/");
  };
  return (
    <div>
      <h1>Welcome to {user?.username}!</h1>

      <form action={logOut}>
        <button>👉 Log out </button>
      </form>
    </div>
  );
};

export default Profile;
